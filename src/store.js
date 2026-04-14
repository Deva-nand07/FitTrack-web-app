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

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayName(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return DAYS[d.getDay()];
}

// Central helper: given a date offset, decide what "type" that day is.
// Returns: 'rest' | 'workout_done' | 'workout_missed' | 'free' (no plan, no log)
function classifyDay(plans, log, offset) {
  const k = dateKey(offset);
  const day = dayName(offset);
  const dayLog = log[k];

  // 1. Manual rest tap OR plan-level rest day → always "rest"
  const isPlanRest = plans.some((p) => (p.restDays || []).includes(day));
  if ((dayLog && dayLog.rest) || isPlanRest) return "rest";

  // 2. No workout plans scheduled for this day → free day (doesn't break streak)
  const scheduled = plans.filter((p) => (p.days || []).includes(day));
  if (scheduled.length === 0) return "free";

  // 3. Has scheduled plans — check if all exercises are done
  if (!dayLog) return "workout_missed";

  const allDone = scheduled.every((p) => {
    const exDone = (dayLog[p.id] && dayLog[p.id].exercises) || {};
    return p.exercises.every((e) => exDone[e.id]);
  });
  return allDone ? "workout_done" : "workout_missed";
}

export const useStore = create(
  persist(
    (set, get) => ({
      plans: [],
      log: {},
      streak: { current: 0, best: 0 },

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
        const { plans, log } = get();
        let cur = 0;
        const best = get().streak.best || 0;

        for (let i = 0; i < 365; i++) {
          const type = classifyDay(plans, log, -i);
          // 'rest' and 'free' days keep the streak alive without counting as a workout
          if (type === "rest" || type === "free") {
            cur++;
            continue;
          }
          // Completed workout — increment
          if (type === "workout_done") {
            cur++;
            continue;
          }
          // Missed workout — streak stops here
          break;
        }

        set({ streak: { current: cur, best: Math.max(cur, best) } });
      },

      // Used by heatmaps & history — returns 'rest'|'workout_done'|'workout_missed'|'free'|'future'
      getDayType: (offset) => {
        // Don't colour future days
        if (offset > 0) return "future";
        const { plans, log } = get();
        return classifyDay(plans, log, offset);
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
    { name: `gymtrack-storage-${getDeviceId()}` },
  ),
);
