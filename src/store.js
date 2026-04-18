import { create } from "zustand";
import { persist } from "zustand/middleware";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDeviceId() {
  let id = localStorage.getItem("gymtrack-device-id");
  if (!id) {
    id =
      "device-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("gymtrack-device-id", id);
  }
  return id;
}

export const PLATE_SIZES = [25, 20, 15, 10, 5, 2.5, 1.25];
export const BAR_WEIGHT = 20;

export function platesToKg(plates) {
  const perSide = Object.entries(plates || {}).reduce(
    (sum, [kg, count]) => sum + parseFloat(kg) * count,
    0,
  );
  return BAR_WEIGHT + perSide * 2;
}

export function kgToPlatesDisplay(plates) {
  if (!plates || Object.keys(plates).length === 0) return "Bar only";
  const parts = PLATE_SIZES.filter((p) => plates[p] > 0).map(
    (p) => `${plates[p]}×${p}kg`,
  );
  return parts.join(" + ") + " / side";
}

function dateKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayKey() {
  return dateKey(0);
}

function dayName(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return DAYS[d.getDay()];
}

// ─────────────────────────────────────────────────────────────────────────────
// classifyDay — single source of truth
//
// Return values:
//   'before_install'  — before app was first used, no data → stops streak lookback
//   'rest'            — manual rest tap OR plan restDay → streak safe
//   'workout_done'    — all scheduled exercises completed
//   'in_progress'     — today, has a plan, workout started but not finished yet
//   'workout_missed'  — past day with scheduled plan but not completed
//   'unscheduled'     — no plan scheduled AND no rest marked → breaks streak
//                       (also used for today with no plan → shown as grey)
// ─────────────────────────────────────────────────────────────────────────────
function classifyDay(plans, log, installDate, offset) {
  const isToday = offset === 0;
  const k = dateKey(offset);
  const day = dayName(offset);
  const dayLog = log[k];

  // Stop lookback at install boundary
  if (k < installDate && !dayLog) return "before_install";

  // Manual rest tap
  if (dayLog && dayLog.rest) return "rest";

  // Plan-level rest day
  const isPlanRest = plans.some((p) => (p.restDays || []).includes(day));
  if (isPlanRest) return "rest";

  // Check if any workout is scheduled for this day
  const scheduled = plans.filter((p) => (p.days || []).includes(day));

  // ── FIX 2: No plan today → always 'unscheduled' (grey), never yellow ──
  if (scheduled.length === 0) return "unscheduled";

  // Has a scheduled plan — check completion
  const allDone = scheduled.every((p) => {
    const exDone = dayLog?.[p.id]?.exercises || {};
    return p.exercises.every((e) => exDone[e.id]);
  });

  if (allDone) return "workout_done";

  // Today's workout is scheduled but not fully done yet → in_progress (yellow)
  if (isToday) return "in_progress";

  // Past day, scheduled but not done → missed
  return "workout_missed";
}

// ─────────────────────────────────────────────────────────────────────────────
// Streak calculation
// Rules:
//  • 'rest'         → safe, counts toward streak
//  • 'workout_done' → counts toward streak
//  • 'in_progress'  → skip (don't add, don't break — it's still today)
//  • 'unscheduled'  → BREAKS streak (user wants this)
//  • 'workout_missed'→ BREAKS streak
//  • 'before_install'→ stops the lookback loop
// ─────────────────────────────────────────────────────────────────────────────
function calcStreak(plans, log, installDate) {
  let cur = 0;
  let best = 0;
  let inStreak = true; // tracking current streak from today backwards
  let curCount = 0;

  for (let i = 0; i < 365; i++) {
    const type = classifyDay(plans, log, installDate, -i);

    if (type === "before_install") break;

    if (type === "in_progress") {
      // Today not done yet — don't count it, don't break
      continue;
    }

    if (type === "rest" || type === "workout_done") {
      curCount++;
      best = Math.max(best, curCount);
      continue;
    }

    // 'unscheduled' or 'workout_missed' — streak resets
    // ── FIX 1: once we hit a break, stop counting current streak ──
    if (inStreak) {
      // We were in an unbroken run — record current streak
      cur = curCount;
      inStreak = false;
    }
    curCount = 0;
    // Keep scanning past for best streak
  }

  // If we never hit a break, cur = whatever we counted
  if (inStreak) cur = curCount;

  return { current: cur, best: Math.max(best, cur) };
}

export const useStore = create(
  persist(
    (set, get) => ({
      plans: [],
      log: {},
      streak: { current: 0, best: 0 },
      installDate: todayKey(),

      addPlan: (plan) =>
        set((s) => ({
          plans: [...s.plans, { ...plan, id: "plan" + Date.now() }],
        })),
      updatePlan: (id, plan) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === id ? { ...plan, id } : p)),
        })),
      deletePlan: (id) =>
        set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),

      toggleExercise: (planId, exId) => {
        const today = todayKey();
        set((s) => {
          const log = { ...s.log };
          if (!log[today]) log[today] = {};
          if (!log[today][planId]) log[today][planId] = { exercises: {} };
          if (!log[today][planId].exercises) log[today][planId].exercises = {};
          log[today][planId].exercises[exId] =
            !log[today][planId].exercises[exId];
          return { log };
        });
        get().recalcStreak();
      },

      markRestDay: () => {
        const today = todayKey();
        set((s) => ({ log: { ...s.log, [today]: { rest: true } } }));
        get().recalcStreak();
      },

      recalcStreak: () => {
        const { plans, log, installDate } = get();
        const streak = calcStreak(plans, log, installDate);
        set({ streak });
      },

      getDayType: (offset) => {
        if (offset > 0) return "future";
        const { plans, log, installDate } = get();
        return classifyDay(plans, log, installDate, offset);
      },

      getTodayLog: () => get().log[todayKey()] || {},
      getTodayPlans: () => {
        const today = dayName();
        return get().plans.filter((p) => (p.days || []).includes(today));
      },
      dateKey,
      dayName,
      todayKey,
    }),
    {
      name: `gymtrack-storage-${getDeviceId()}`,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Set installDate if missing (old installs)
        if (!state.installDate) state.installDate = todayKey();
        // ── FIX 1: Immediately recalc streak on load to wipe stale 365 value ──
        // Use setTimeout so Zustand finishes hydrating first
        setTimeout(() => {
          useStore.getState().recalcStreak();
        }, 0);
      },
    },
  ),
);
