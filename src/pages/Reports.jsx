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
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-sm text-[#999] mt-1">
          Project metrics and team performance insights
        </p>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4">
            <p className="text-xs font-medium text-[#999] uppercase tracking-wider">
              Total Issues
            </p>
            <p className="text-3xl font-bold text-white mt-2">
              {metrics.totalIssues}
            </p>
          </div>
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4">
            <p className="text-xs font-medium text-[#999] uppercase tracking-wider">
              Completed
            </p>
            <p className="text-3xl font-bold text-[#4ADE80] mt-2">
              {metrics.completedIssues}
            </p>
          </div>
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4">
            <p className="text-xs font-medium text-[#999] uppercase tracking-wider">
              In Progress
            </p>
            <p className="text-3xl font-bold text-[#FACC15] mt-2">
              {metrics.inProgressIssues}
            </p>
          </div>
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4">
            <p className="text-xs font-medium text-[#999] uppercase tracking-wider">
              Completion Rate
            </p>
            <p className="text-3xl font-bold text-[#5E6AD2] mt-2">
              {metrics.completionRate}%
            </p>
          </div>
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4">
            <p className="text-xs font-medium text-[#999] uppercase tracking-wider">
              Team Members
            </p>
            <p className="text-3xl font-bold text-[#60A5FA] mt-2">
              {metrics.assignedUsers}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResolutionTimeChart issues={issues} />
          <WorkloadChart issues={issues} />
        </div>

        <div className="w-full">
          <ProjectProgressChart issues={issues} projects={projects} />
        </div>

        {/* Project Summary */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Project Summary
          </h3>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-xs text-[#555]">No projects yet</p>
            ) : (
              projects.map((project) => {
                const projectIssues = issues.filter(
                  (i) => i.project_id === project.id
                );
                const doneCount = projectIssues.filter(
                  (i) => i.status === "done"
                ).length;
                const progress =
                  projectIssues.length > 0
                    ? Math.round((doneCount / projectIssues.length) * 100)
                    : 0;

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 bg-[#0D0D0D] border border-[#1E1E1E] rounded hover:border-[#252525] transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {project.name}
                      </p>
                      <p className="text-xs text-[#999] mt-1">
                        {projectIssues.length} issues • {doneCount} completed
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-[#1E1E1E] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#5E6AD2] to-[#7C3AED]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[#999] w-10 text-right">
                        {progress}%
                      </span>
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