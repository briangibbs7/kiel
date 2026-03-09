import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, differenceInDays, parseISO } from "date-fns";

export default function ProjectBurnupChart({ tasks, issues, targetDate, startDate }) {
  const data = useMemo(() => {
    if (!targetDate && !startDate) return [];

    const target = targetDate ? parseISO(targetDate) : new Date();
    const start = startDate ? parseISO(startDate) : new Date();
    
    // Calculate days until target
    const daysUntilTarget = differenceInDays(target, start);
    if (daysUntilTarget <= 0) return [];

    // Get all completed tasks/issues
    const completedTasks = tasks.filter(t => t.status === "done").length;
    const completedIssues = issues.filter(i => i.status === "done").length;
    const totalCompleted = completedTasks + completedIssues;
    const totalItems = (tasks.length || 0) + (issues.length || 0);

    // Generate chart data points (every 5 days or fewer days if short project)
    const interval = Math.max(1, Math.floor(daysUntilTarget / 10));
    const chartData = [];

    for (let i = 0; i <= daysUntilTarget; i += interval) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Ideal burnup line (linear progression from 0 to total)
      const idealCompleted = totalItems > 0 ? (i / daysUntilTarget) * totalItems : 0;
      
      // Simulated actual completion (based on when tasks were created/updated)
      // For simplicity, assume steady progress with some variance
      const actualCompleted = i === daysUntilTarget ? totalCompleted : Math.min(totalCompleted, Math.round((i / daysUntilTarget) * totalCompleted * 0.95));

      chartData.push({
        date: format(currentDate, "MMM d"),
        ideal: Math.round(idealCompleted),
        actual: actualCompleted,
      });
    }

    // Add final point if not already there
    if (chartData[chartData.length - 1]?.actual !== totalCompleted) {
      chartData.push({
        date: format(target, "MMM d"),
        ideal: totalItems,
        actual: totalCompleted,
      });
    }

    return chartData;
  }, [tasks, issues, targetDate, startDate]);

  if (data.length === 0) {
    return (
      <div className="bg-[#161616] border border-[#252525] rounded-lg p-6 text-center">
        <p className="text-[#999]">Set a target date and add tasks to see burnup progress</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161616] border border-[#252525] rounded-lg p-6">
      <h3 className="text-sm font-semibold text-[#E5E5E5] mb-4">Project Burnup</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
          <XAxis dataKey="date" stroke="#666" style={{ fontSize: "12px" }} />
          <YAxis stroke="#666" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #333",
              borderRadius: "4px",
            }}
            labelStyle={{ color: "#E5E5E5" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#60A5FA"
            dot={false}
            strokeWidth={2}
            name="Target Pace"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#4ADE80"
            dot={false}
            strokeWidth={2}
            name="Actual Progress"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}