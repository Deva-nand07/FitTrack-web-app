import React, { useMemo } from "react";
import { useStore } from "../store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Flame, Trophy, Dumbbell, TrendingUp } from "lucide-react";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Colour palette — rest is now vivid sky-blue, clearly distinct from workout cyan
const TYPE_COLORS = {
  workout_done: {
    bg: "rgba(14,165,233,0.25)",
    border: "rgba(14,165,233,0.55)",
    text: "#38bdf8",
    bar: "#0ea5e9",
  },
  rest: {
    bg: "rgba(56,189,248,0.22)",
    border: "#38bdf8",
    text: "#7dd3fc",
    bar: "#38bdf8",
  }, // brighter sky blue
  in_progress: {
    bg: "rgba(250,204,21,0.12)",
    border: "rgba(250,204,21,0.35)",
    text: "#fde047",
    bar: "#facc15",
  },
  workout_missed: {
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    text: "#f87171",
    bar: "rgba(239,68,68,0.4)",
  },
  unscheduled: {
    bg: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.05)",
    text: "#2d3748",
    bar: "rgba(255,255,255,0.05)",
  },
  before_install: {
    bg: "transparent",
    border: "rgba(255,255,255,0.03)",
    text: "#1e293b",
    bar: "transparent",
  },
  future: {
    bg: "transparent",
    border: "rgba(255,255,255,0.04)",
    text: "#1e293b",
    bar: "transparent",
  },
};
// fallback for any unknown type
const fallback = {
  bg: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.05)",
  text: "#2d3748",
  bar: "rgba(255,255,255,0.05)",
};
const tc = (type) => TYPE_COLORS[type] || fallback;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const labels = {
    workout_done: "Workout done",
    rest: "Rest day",
    in_progress: "In progress",
    workout_missed: "Missed",
    unscheduled: "No plan",
    before_install: "",
    future: "",
  };
  if (!labels[d.type]) return null;
  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid rgba(14,165,233,0.3)",
        borderRadius: 10,
        padding: "8px 12px",
      }}>
      <p style={{ fontSize: 12, color: tc(d.type).text, fontWeight: 600 }}>
        {labels[d.type]}
      </p>
    </div>
  );
};

export default function ProgressTab() {
  const { log, streak, getDayType, dateKey, todayKey } = useStore();

  const weekData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const offset = -6 + i;
        const k = dateKey(offset);
        const dl = log[k] || {};
        const d = new Date();
        d.setDate(d.getDate() + offset);
        const label = DAYS_SHORT[d.getDay()];
        const type = getDayType(offset);
        const exCount =
          type === "workout_done"
            ? Object.values(dl).reduce(
                (a, v) =>
                  a +
                  (v?.exercises
                    ? Object.values(v.exercises).filter(Boolean).length
                    : 0),
                0,
              )
            : 0;
        // Give rest/in-progress a small visual height so they show on the chart
        const count =
          type === "workout_done"
            ? Math.max(exCount, 1)
            : type === "rest"
              ? 0.5
              : type === "in_progress"
                ? 0.3
                : 0;
        return { label, count, type };
      }),
    [log],
  );

  const monthDays = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const today = now.getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const offset = dayNum - today;
      const type = offset > 0 ? "future" : getDayType(offset);
      return { day: dayNum, isToday: offset === 0, type };
    });
  }, [log]);

  const streakDays = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const offset = -(27 - i);
        const d = new Date();
        d.setDate(d.getDate() + offset);
        return {
          date: d.getDate(),
          isToday: offset === 0,
          type: getDayType(offset),
        };
      }),
    [log],
  );

  const totalWorkouts = useMemo(
    () =>
      Object.keys(log).filter((k) => {
        const dl = log[k];
        if (!dl || dl.rest) return false;
        return Object.values(dl).some(
          (v) => v?.exercises && Object.values(v.exercises).some(Boolean),
        );
      }).length,
    [log],
  );

  const stats = [
    {
      val: streak.current || 0,
      lbl: "Current Streak",
      Icon: Flame,
      color: "#f59e0b",
    },
    {
      val: streak.best || 0,
      lbl: "Best Streak",
      Icon: Trophy,
      color: "#0ea5e9",
    },
    {
      val: totalWorkouts,
      lbl: "Total Workouts",
      Icon: Dumbbell,
      color: "#14b8a6",
    },
  ];

  const legendItems = [
    { type: "workout_done", label: "Workout done" },
    { type: "rest", label: "Rest day" },
    { type: "in_progress", label: "Today / in progress" },
    { type: "workout_missed", label: "Missed" },
    { type: "unscheduled", label: "No plan" },
  ];

  return (
    <div style={{ padding: "20px 16px 16px" }} className="page-enter">
      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
          marginBottom: 16,
        }}>
        {stats.map(({ val, lbl, Icon, color }) => (
          <div
            key={lbl}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: "14px 10px",
              textAlign: "center",
              backdropFilter: "blur(12px)",
            }}>
            <Icon
              size={18}
              style={{
                color,
                margin: "0 auto 6px",
                display: "block",
                filter: `drop-shadow(0 0 6px ${color}80)`,
              }}
            />
            <p
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#f0f4ff",
                lineHeight: 1,
              }}>
              {val}
            </p>
            <p
              style={{
                fontSize: 10,
                color: "#8892aa",
                marginTop: 4,
                letterSpacing: "0.05em",
              }}>
              {lbl}
            </p>
          </div>
        ))}
      </div>

      {/* Week bar chart */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "16px 12px",
          marginBottom: 12,
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}>
          <TrendingUp size={16} style={{ color: "#0ea5e9" }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>
            Last 7 Days
          </p>
        </div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart
            data={weekData}
            barCategoryGap="35%"
            margin={{ top: 4, right: 10, bottom: 0, left: -10 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#4a5568", fontFamily: "Barlow" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} minPointSize={3}>
              {weekData.map((d, i) => (
                <Cell key={i} fill={tc(d.type).bar} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <Legend items={legendItems} />
      </div>

      {/* Month calendar */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
        }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#f0f4ff",
            marginBottom: 12,
          }}>
          This Month
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {monthDays.map(({ day, isToday, type }) => (
            <div
              key={day}
              style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                background: tc(type).bg,
                color: tc(type).text,
                border: `1px solid ${isToday ? "#0ea5e9" : tc(type).border}`,
                boxShadow: isToday ? "0 0 10px rgba(14,165,233,0.55)" : "none",
              }}>
              {day}
            </div>
          ))}
        </div>
        <Legend items={legendItems} style={{ marginTop: 12 }} />
      </div>

      {/* 28-day streak heatmap */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: 16,
        }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#f0f4ff",
            marginBottom: 12,
          }}>
          28-Day Overview
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {streakDays.map(({ date, isToday, type }, i) => (
            <div
              key={i}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                background: tc(type).bg,
                color: tc(type).text,
                border: `2px solid ${isToday ? "#0ea5e9" : tc(type).border}`,
                boxShadow:
                  type === "workout_done"
                    ? "0 0 8px rgba(14,165,233,0.3)"
                    : type === "rest"
                      ? "0 0 8px rgba(56,189,248,0.25)"
                      : "none",
              }}>
              {date}
            </div>
          ))}
        </div>
        <Legend items={legendItems} style={{ marginTop: 12 }} />
      </div>
    </div>
  );
}

// Reusable legend component
function Legend({ items, style = {} }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 14px",
        marginTop: 10,
        paddingTop: 10,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        ...style,
      }}>
      {items.map(({ type, label }) => (
        <div
          key={type}
          style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: tc(type).bg,
              border: `1.5px solid ${tc(type).border}`,
            }}
          />
          <span style={{ fontSize: 10, color: "#8892aa" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
