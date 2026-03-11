import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card } from "@/components/ui/card";

export default function EpicBurndownChart({ epic, tasks = [], projectStartDate, projectTargetDate }) {
  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0 || !projectStartDate || !projectTargetDate) {
      return [];
    }

    const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
    if (totalStoryPoints === 0) return [];

    // Create date range from start to target
    const startDate = new Date(projectStartDate);
    const targetDate = new Date(projectTargetDate);
    const daysDiff = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 0) return [];

    // Generate daily burndown data
    const data = [];
    const pointsPerDay = totalStoryPoints / daysDiff;

    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      // Ideal burndown (linear)
      const idealRemaining = Math.max(0, totalStoryPoints - pointsPerDay * i);

      // Actual burndown (based on completed tasks)
      const completedPoints = tasks
        .filter((task) => {
          if (!task.updated_date) return false;
          const taskDate = new Date(task.updated_date);
          return taskDate <= currentDate && (task.status === "done" || task.status === "in_review");
        })
        .reduce((sum, task) => sum + (task.story_points || 0), 0);

      const actualRemaining = totalStoryPoints - completedPoints;

      data.push({
        date: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ideal: Math.max(0, idealRemaining),
        actual: Math.max(0, actualRemaining),
        day: i,
      });
    }

    return data;
  }, [epic, tasks, projectStartDate, projectTargetDate]);

  if (chartData.length === 0) {
    return (
      <Card className="bg-[#111] border-[#1E1E1E] p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Sprint Burndown</h2>
        <div className="flex items-center justify-center h-80">
          <p className="text-sm text-[#666]">Add tasks or set project dates to see burndown chart</p>
        </div>
      </Card>
    );
  }

  const totalPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
  const completedPoints = tasks
    .filter((task) => task.status === "done" || task.status === "in_review")
    .reduce((sum, task) => sum + (task.story_points || 0), 0);
  const remainingPoints = totalPoints - completedPoints;
  const progressPercent = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return (
    <Card className="bg-[#111] border-[#1E1E1E] p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white mb-3">Sprint Burndown</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-[#666]">Total Points</p>
            <p className="text-lg font-bold text-white">{totalPoints}</p>
          </div>
          <div>
            <p className="text-xs text-[#666]">Remaining</p>
            <p className="text-lg font-bold text-[#FFA500]">{remainingPoints}</p>
          </div>
          <div>
            <p className="text-xs text-[#666]">Progress</p>
            <p className="text-lg font-bold text-[#4ADE80]">{progressPercent}%</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="date" 
            stroke="#666" 
            style={{ fontSize: "12px" }}
            tick={{ fill: "#666" }}
          />
          <YAxis 
            stroke="#666" 
            style={{ fontSize: "12px" }}
            label={{ value: "Story Points", angle: -90, position: "insideLeft" }}
            tick={{ fill: "#666" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #333",
              borderRadius: "4px",
              color: "#FFF",
            }}
            formatter={(value) => Math.round(value)}
          />
          <Legend 
            wrapperStyle={{ color: "#999", paddingTop: "20px" }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#666"
            strokeWidth={2}
            name="Ideal Burndown"
            dot={false}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#5E6AD2"
            strokeWidth={2}
            name="Actual Progress"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}