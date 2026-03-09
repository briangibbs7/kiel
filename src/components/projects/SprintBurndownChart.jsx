import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

function buildBurndownData(tasks, sprintStart, sprintEnd) {
  const start = new Date(sprintStart);
  const end = new Date(sprintEnd);
  const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  const totalPoints = tasks.reduce((sum, t) => sum + (t.story_points || 0), 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const data = [];
  for (let d = 0; d <= totalDays; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Ideal: linear burn
    const ideal = Math.round(totalPoints - (totalPoints / totalDays) * d);

    // Actual: count remaining points for tasks not done by this date
    let actual = null;
    if (date <= today) {
      const remaining = tasks.reduce((sum, t) => {
        if (t.status === "done") {
          const updatedAt = new Date(t.updated_date || t.created_date);
          updatedAt.setHours(0, 0, 0, 0);
          if (updatedAt <= date) return sum; // already done
        }
        return sum + (t.story_points || 0);
      }, 0);
      actual = remaining;
    }

    data.push({ day: dateStr, ideal, actual });
  }
  return { data, totalPoints };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-xs">
      <p className="text-[#999] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "ideal" ? "Ideal" : "Actual"}: {p.value} pts
        </p>
      ))}
    </div>
  );
};

export default function SprintBurndownChart({ tasks, sprintStart, sprintEnd }) {
  const { data, totalPoints } = useMemo(
    () => buildBurndownData(tasks, sprintStart, sprintEnd),
    [tasks, sprintStart, sprintEnd]
  );

  const completedPoints = tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.story_points || 0), 0);
  const remainingPoints = totalPoints - completedPoints;

  return (
    <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Sprint Burndown</h3>
          <p className="text-xs text-[#666] mt-0.5">Story points remaining over sprint</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[#666]">Total </span>
            <span className="text-white font-semibold">{totalPoints} pts</span>
          </div>
          <div>
            <span className="text-[#666]">Remaining </span>
            <span className="text-[#FACC15] font-semibold">{remainingPoints} pts</span>
          </div>
          <div>
            <span className="text-[#666]">Done </span>
            <span className="text-[#4ADE80] font-semibold">{completedPoints} pts</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#555", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#555", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#333"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            name="ideal"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#5E6AD2"
            strokeWidth={2}
            dot={{ r: 3, fill: "#5E6AD2", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
            name="actual"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-px border-t-2 border-dashed border-[#444]" />
          <span className="text-[10px] text-[#555]">Ideal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-[#5E6AD2] rounded" />
          <span className="text-[10px] text-[#555]">Actual</span>
        </div>
      </div>
    </div>
  );
}