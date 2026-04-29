import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ResolutionTimeChart from "@/components/reports/ResolutionTimeChart";
import WorkloadChart from "@/components/reports/WorkloadChart";
import ProjectProgressChart from "@/components/reports/ProjectProgressChart";
import ProjectBurndownDashboard from "@/components/reports/ProjectBurndownDashboard";

export default function Reports() {
  const { data: issues = [] } = useQuery({
    queryKey: ["all-issues"],
    queryFn: () => base44.asServiceRole.entities.Issue.list("-created_date", 500),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => base44.asServiceRole.entities.Project.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => base44.asServiceRole.entities.Task.list("-updated_date", 500),
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ["all-sprints"],
    queryFn: () => base44.asServiceRole.entities.Sprint.list(),
  });

  const calculateMetrics = () => {
    const totalIssues = issues.length;
    const completedIssues = issues.filter((i) => i.status === "done").length;
    const inProgressIssues = issues.filter(
      (i) => i.status === "in_progress"
    ).length;
    const completionRate =
      totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    const assignedUsers = new Set(
      issues
        .filter((i) => i.assignee && i.status !== "done")
        .map((i) => i.assignee)
    ).size;

    return {
      totalIssues,
      completedIssues,
      inProgressIssues,
      completionRate,
      assignedUsers,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "var(--pm-bg)" }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--pm-border)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--pm-text)" }}>Reports & Analytics</h1>
        <p className="text-sm mt-1" style={{ color: "var(--pm-text-secondary)" }}>
          Project metrics and team performance insights
        </p>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Issues", value: metrics.totalIssues, color: "var(--pm-text)" },
            { label: "Completed", value: metrics.completedIssues, color: "var(--pm-green)" },
            { label: "In Progress", value: metrics.inProgressIssues, color: "var(--pm-yellow)" },
            { label: "Completion Rate", value: `${metrics.completionRate}%`, color: "var(--pm-accent)" },
            { label: "Team Members", value: metrics.assignedUsers, color: "var(--pm-blue)" },
          ].map((stat) => (
            <div key={stat.label} className="border rounded-lg p-4" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--pm-text-secondary)" }}>{stat.label}</p>
              <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResolutionTimeChart issues={issues} />
          <WorkloadChart issues={issues} />
        </div>

        <div className="w-full">
          <ProjectProgressChart issues={issues} projects={projects} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--pm-text)" }}>Project Progress & Burndown</h2>
          <ProjectBurndownDashboard projects={projects} tasks={tasks} sprints={sprints} />
        </div>

        <div className="border rounded-lg p-6" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--pm-text)" }}>Project Summary</h3>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--pm-text-muted)" }}>No projects yet</p>
            ) : (
              projects.map((project) => {
                const projectIssues = issues.filter((i) => i.project_id === project.id);
                const doneCount = projectIssues.filter((i) => i.status === "done").length;
                const progress = projectIssues.length > 0 ? Math.round((doneCount / projectIssues.length) * 100) : 0;
                return (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded hover:opacity-80 transition-opacity" style={{ backgroundColor: "var(--pm-bg)", borderColor: "var(--pm-border)" }}>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--pm-text)" }}>{project.name}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--pm-text-secondary)" }}>{projectIssues.length} issues • {doneCount} completed</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--pm-border)" }}>
                        <div className="h-full bg-gradient-to-r from-[#5E6AD2] to-[#7C3AED]" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-sm font-medium w-10 text-right" style={{ color: "var(--pm-text-secondary)" }}>{progress}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}