import React, { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { format, differenceInDays, parseISO, startOfDay } from "date-fns";

export default function ProjectBurndownDashboard({ projects, tasks = [], sprints = [] }) {
  const getBurndownData = (project) => {
    const projectTasks = tasks.filter((t) => t.project_id === project.id);
    if (projectTasks.length === 0) return null;

    const projectStart = project.start_date ? parseISO(project.start_date) : new Date();
    const projectEnd = project.target_date ? parseISO(project.target_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const totalDays = differenceInDays(projectEnd, projectStart) + 1;
    const totalStoryPoints = projectTasks.reduce((sum, t) => sum + (t.story_points || 0), 0);
    const totalTasks = projectTasks.length;

    const data = [];
    const tasksByDate = {};

    // Organize tasks by status
    projectTasks.forEach((task) => {
      const dateKey = task.updated_date ? format(parseISO(task.updated_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = { todo: 0, in_progress: 0, in_review: 0, done: 0 };
      }
      tasksByDate[dateKey][task.status] = (tasksByDate[dateKey][task.status] || 0) + 1;
    });

    // Generate burndown timeline
    for (let i = 0; i <= Math.min(totalDays, 30); i++) {
      const currentDate = new Date(projectStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = format(currentDate, "MMM dd");
      const dateKey = format(currentDate, "yyyy-MM-dd");

      const tasksCompletedByDate = Object.entries(tasksByDate)
        .filter(([date]) => date <= format(currentDate, "yyyy-MM-dd"))
        .reduce((sum, [, counts]) => sum + counts.done, 0);

      const remainingTasks = totalTasks - tasksCompletedByDate;
      const remainingPoints = projectTasks
        .filter((t) => t.status !== "done" && parseISO(t.updated_date || new Date().toISOString()) <= currentDate)
        .reduce((sum, t) => sum + (t.story_points || 0), 0);

      const idealBurn = Math.max(0, totalStoryPoints - (totalStoryPoints / totalDays) * i);

      data.push({
        date: dateStr,
        idealPoints: Math.round(idealBurn),
        actualPoints: remainingPoints,
        completedTasks: tasksCompletedByDate,
        remainingTasks: Math.max(0, remainingTasks),
      });
    }

    return { data, totalStoryPoints, totalTasks };
  };

  return (
    <div className="space-y-6">
      {projects.map((project) => {
        const burndownData = getBurndownData(project);
        if (!burndownData) return null;

        const { data, totalStoryPoints, totalTasks } = burndownData;
        const finalData = data[data.length - 1];
        const completionRate = totalTasks > 0 ? Math.round((finalData.completedTasks / totalTasks) * 100) : 0;

        return (
          <div key={project.id} className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
            {/* Project Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                <p className="text-xs text-[#999] mt-1">
                  {totalStoryPoints} total story points • {totalTasks} tasks
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#4ADE80]">{completionRate}%</p>
                <p className="text-xs text-[#999] mt-1">Complete</p>
              </div>
            </div>

            {/* Story Points Burndown */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-[#CCC] mb-4">Story Points Burndown</h4>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
                  <XAxis dataKey="date" stroke="#666" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
                    labelStyle={{ color: "#CCC" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="idealPoints"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    name="Ideal Burn"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualPoints"
                    stroke="#4ADE80"
                    strokeWidth={2}
                    name="Actual Points"
                    dot={false}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Task Completion */}
            <div>
              <h4 className="text-sm font-medium text-[#CCC] mb-4">Task Completion Over Time</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
                  <XAxis dataKey="date" stroke="#666" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }}
                    labelStyle={{ color: "#CCC" }}
                  />
                  <Legend />
                  <Bar dataKey="completedTasks" fill="#4ADE80" name="Completed Tasks" />
                  <Bar dataKey="remainingTasks" fill="#F87171" name="Remaining Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Footer */}
            <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#252525]">
              <div>
                <p className="text-xs text-[#999]">Completed</p>
                <p className="text-lg font-bold text-[#4ADE80]">{finalData.completedTasks}</p>
              </div>
              <div>
                <p className="text-xs text-[#999]">Remaining</p>
                <p className="text-lg font-bold text-[#F87171]">{finalData.remainingTasks}</p>
              </div>
              <div>
                <p className="text-xs text-[#999]">Story Points Left</p>
                <p className="text-lg font-bold text-[#FACC15]">{finalData.actualPoints}</p>
              </div>
              <div>
                <p className="text-xs text-[#999]">On Track</p>
                <p className={`text-lg font-bold ${finalData.actualPoints <= finalData.idealPoints ? "text-[#4ADE80]" : "text-[#F87171]"}`}>
                  {finalData.actualPoints <= finalData.idealPoints ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}