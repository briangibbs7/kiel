import React from "react";

const healthConfig = {
  on_track: { label: "On track", color: "bg-green-500", textColor: "text-green-400" },
  at_risk: { label: "At risk", color: "bg-yellow-500", textColor: "text-yellow-400" },
  off_track: { label: "Off track", color: "bg-red-500", textColor: "text-red-400" },
};

const statusConfig = {
  backlog: { color: "#6B6B6B", icon: "○" },
  todo: { color: "#6B6B6B", icon: "○" },
  in_progress: { color: "#FACC15", icon: "◐" },
  in_review: { color: "#60A5FA", icon: "◕" },
  done: { color: "#4ADE80", icon: "●" },
  cancelled: { color: "#6B6B6B", icon: "⊘" },
};

export function HealthBadge({ health }) {
  const config = healthConfig[health] || healthConfig.on_track;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className={config.textColor}>{config.label}</span>
    </span>
  );
}

export function IssueStatusIcon({ status, size = 16 }) {
  const config = statusConfig[status] || statusConfig.backlog;
  return (
    <span
      style={{ color: config.color, fontSize: size, lineHeight: 1 }}
      className="inline-flex items-center justify-center flex-shrink-0"
    >
      {config.icon}
    </span>
  );
}

export function PriorityIcon({ priority, size = 14 }) {
  const bars = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
    none: 0,
  };
  const colors = {
    urgent: "#F87171",
    high: "#FB923C",
    medium: "#FACC15",
    low: "#60A5FA",
    none: "#6B6B6B",
  };
  const count = bars[priority] || 0;
  const color = colors[priority] || "#6B6B6B";

  if (count === 0) return null;

  return (
    <span className="inline-flex items-end gap-[1px]" style={{ height: size }}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="rounded-[1px]"
          style={{
            width: 2,
            height: `${(i / 4) * 100}%`,
            backgroundColor: i <= count ? color : "#333",
          }}
        />
      ))}
    </span>
  );
}

export function LabelBadge({ label }) {
  const labelColors = {
    Bug: "#F87171",
    Performance: "#FACC15",
    iOS: "#60A5FA",
    Maps: "#4ADE80",
    API: "#A78BFA",
    Reliability: "#FB923C",
    UI: "#22D3EE",
    Security: "#F472B6",
  };
  const color = labelColors[label] || "#6B6B6B";
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export default function StatusBadge({ status, type = "issue" }) {
  if (type === "health") return <HealthBadge health={status} />;
  return <IssueStatusIcon status={status} />;
}