import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#5E6AD2", "#4ADE80", "#FACC15", "#F87171", "#60A5FA", "#A78BFA"];

export default function WorkloadChart({ issues }) {
  const calculateWorkload = () => {
    const workload = {};

    issues
      .filter((issue) => issue.assignee && issue.status !== "done")
      .forEach((issue) => {
        workload[issue.assignee] = (workload[issue.assignee] || 0) + 1;
      });

    return Object.entries(workload)
      .map(([assignee, count]) => ({
        name: assignee.split("@")[0] || assignee,
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const data = calculateWorkload();

  if (data.length === 0) {
    return (
      <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6 flex items-center justify-center h-80">
        <div className="text-center text-[#555]">
          <p className="text-sm">No active assignments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
      <h3 className="text-sm font-semibold text-white mb-4">
        Team Workload Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} (${value})`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #333",
              borderRadius: "4px",
            }}
            labelStyle={{ color: "#CCC" }}
            formatter={(value) => [`${value} issues`, "Active"]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-xs text-[#999]">
              {item.name}: {item.value} issues
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}