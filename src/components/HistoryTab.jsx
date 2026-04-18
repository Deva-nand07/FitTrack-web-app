import React from "react";
import { useStore } from "../store";
import { Coffee, CheckCircle, Clock } from "lucide-react";

export default function HistoryTab() {
  const { log, plans } = useStore();
  const keys = Object.keys(log).sort((a, b) => b.localeCompare(a));

  const formatDate = (k) => {
    const d = new Date(k + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (!keys.length) {
    return (
      <div
        style={{ padding: "20px 16px", textAlign: "center", paddingTop: 60 }}
        className="page-enter">
        <Clock
          size={40}
          style={{ color: "#1e293b", margin: "0 auto 16px", display: "block" }}
        />
        <p style={{ fontSize: 14, color: "#8892aa" }}>
          No workout history yet.
        </p>
        <p style={{ fontSize: 12, color: "#4a5568", marginTop: 4 }}>
          Complete your first workout to see it here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 16px 16px" }} className="page-enter">
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#f0f4ff",
          marginBottom: 16,
        }}>
        Workout History
      </h2>
      {keys.slice(0, 60).map((k) => {
        const dl = log[k];

        if (dl.rest)
          return (
            <div
              key={k}
              style={{
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.15)",
                borderRadius: 14,
                padding: "12px 16px",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Coffee size={16} style={{ color: "#60a5fa" }} />
                </div>
                <div>
                  <p
                    style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>
                    {formatDate(k)}
                  </p>
                  <p style={{ fontSize: 11, color: "#60a5fa", marginTop: 1 }}>
                    Rest day
                  </p>
                </div>
              </div>
              <span className="chip chip-blue">Rest</span>
            </div>
          );

        const exTotal = Object.values(dl).reduce(
          (a, v) =>
            a +
            (v?.exercises
              ? Object.values(v.exercises).filter(Boolean).length
              : 0),
          0,
        );
        const planNames = Object.keys(dl)
          .map((pid) => plans.find((p) => p.id === pid)?.name)
          .filter(Boolean);
        if (exTotal === 0) return null;

        return (
          <div
            key={k}
            style={{
              background: "rgba(14,165,233,0.05)",
              border: "1px solid rgba(14,165,233,0.12)",
              borderRadius: 14,
              padding: "12px 16px",
              marginBottom: 8,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "rgba(14,165,233,0.3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "rgba(14,165,233,0.12)")
            }>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(14,165,233,0.1)",
                    border: "1px solid rgba(14,165,233,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <CheckCircle size={16} style={{ color: "#0ea5e9" }} />
                </div>
                <div>
                  <p
                    style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>
                    {formatDate(k)}
                  </p>
                  {planNames.length > 0 && (
                    <p style={{ fontSize: 11, color: "#8892aa", marginTop: 1 }}>
                      {planNames.join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <span className="chip chip-cyan">{exTotal} done</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
