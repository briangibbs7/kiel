import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ProjectProgressChart({ issues, projects }) {
  const calculateProjectProgress = () => {
    const projectStats = {};

    projects.forEach((project) => {
      projectStats[project.id] = {
        name: project.name,
        total: 0,
        done: 0,
        in_progress: 0,
        backlog: 0,
      };
    });

    issues.forEach((issue) => {
      if (projectStats[issue.project_id]) {
        projectStats[issue.project_id].total += 1;
        if (issue.status === "done") {
          projectStats[issue.project_id].done += 1;
        } else if (issue.status === "in_progress") {
          projectStats[issue.project_id].in_progress += 1;
        } else if (issue.status === "backlog") {
          projectStats[issue.project_id].backlog += 1;
        }
      }
    });

    return Object.values(projectStats)
      .filter((p) => p.total > 0)
      .map((p) => ({
        name: p.name,
        done: p.done,
        in_progress: p.in_progress,
        backlog: p.backlog,
        total: p.total,
        completion: Math.round((p.done / p.total) * 100),
      }));
  };

  const data = calculateProjectProgress();

  if (data.length === 0) {
    return (
      <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6 flex items-center justify-center h-80">
        <div className="text-center text-[#555]">
          <p className="text-sm">No project data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
      <h3 className="text-sm font-semibold text-white mb-4">
        Project Progress
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
          <XAxis
            dataKey="name"
            stroke="#999"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#999" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #333",
              borderRadius: "4px",
            }}
            labelStyle={{ color: "#CCC" }}
          />
          <Legend />
          <Bar dataKey="done" stackId="a" fill="#4ADE80" />
          <Bar dataKey="in_progress" stackId="a" fill="#FACC15" />
          <Bar dataKey="backlog" stackId="a" fill="#6B6B6B" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-1">
        {data.map((project) => (
          <div key={project.name} className="text-xs text-[#999]">
            {project.name}: {project.completion}% complete
          </div>
        ))}
      </div>
    </div>
  );
}