import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ResolutionTimeChart({ issues }) {
  const calculateResolutionData = () => {
    const statusStats = {};

    issues.forEach((issue) => {
      if (issue.status === "done" && issue.created_date && issue.updated_date) {
        const created = new Date(issue.created_date);
        const updated = new Date(issue.updated_date);
        const daysToResolve = Math.ceil(
          (updated - created) / (1000 * 60 * 60 * 24)
        );

        if (!statusStats[issue.status]) {
          statusStats[issue.status] = [];
        }
        statusStats[issue.status].push(daysToResolve);
      }
    });

    const avgResolution = Object.entries(statusStats).map(([status, times]) => ({
      status: "Average Resolution Time",
      days: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      count: times.length,
    }));

    return avgResolution.length > 0
      ? avgResolution
      : [{ status: "Average Resolution Time", days: 0, count: 0 }];
  };

  const data = calculateResolutionData();

  return (
    <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
      <h3 className="text-sm font-semibold text-white mb-4">
        Issue Resolution Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
          <XAxis dataKey="status" stroke="#999" />
          <YAxis stroke="#999" label={{ value: "Days", angle: -90, position: "insideLeft" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #333",
              borderRadius: "4px",
            }}
            labelStyle={{ color: "#CCC" }}
            formatter={(value) => [`${value} days`, "Avg Resolution"]}
          />
          <Bar dataKey="days" fill="#5E6AD2" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-[#999] mt-4">
        Based on {data[0]?.count || 0} resolved issues
      </p>
    </div>
  );
}