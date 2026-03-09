import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ProjectMetrics from "@/components/dashboard/ProjectMetrics";
import BurnUpChart from "@/components/dashboard/BurnUpChart";
import UpcomingMilestones from "@/components/dashboard/UpcomingMilestones";

export default function ProjectOverview() {
  const [projectId, setProjectId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) setProjectId(id);
  }, []);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () =>
      projectId ? base44.entities.Project.filter({ id: projectId }).then(p => p[0]) : null,
    enabled: !!projectId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: () =>
      projectId
        ? base44.entities.Task.filter({ project_id: projectId })
        : Promise.resolve([]),
    enabled: !!projectId,
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["project-issues", projectId],
    queryFn: () =>
      projectId
        ? base44.entities.Issue.filter({ project_id: projectId })
        : Promise.resolve([]),
    enabled: !!projectId,
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["project-epics", projectId],
    queryFn: () =>
      projectId
        ? base44.entities.Epic.filter({ project_id: projectId })
        : Promise.resolve([]),
    enabled: !!projectId,
  });

  if (!projectId || !project) {
    return (
      <div className="h-full bg-[#0D0D0D] flex items-center justify-center">
        <p className="text-[#666]">Loading project overview...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-[#6B6B6B] hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{project.icon || "📁"}</span>
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              </div>
              <p className="text-sm text-[#999] mt-1">Project Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[#FACC15]" />
            <span className="text-sm text-[#999]">Last updated now</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Metrics */}
        <ProjectMetrics tasks={tasks} issues={issues} />

        {/* Charts and Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BurnUpChart tasks={tasks} issues={issues} />
          </div>
          <div>
            <UpcomingMilestones epics={epics} />
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Project Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#666] mb-1">Status</p>
                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-[#1a3a2a] text-[#4ADE80]">
                  {project.status || "active"}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#666] mb-1">Lead</p>
                <p className="text-sm text-white">{project.lead || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs text-[#666] mb-1">Prefix</p>
                <p className="text-sm text-white font-mono">{project.prefix}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Timeline</h3>
            <div className="space-y-3">
              {project.start_date && (
                <div>
                  <p className="text-xs text-[#666] mb-1">Start Date</p>
                  <p className="text-sm text-white">{new Date(project.start_date).toLocaleDateString()}</p>
                </div>
              )}
              {project.target_date && (
                <div>
                  <p className="text-xs text-[#666] mb-1">Target Date</p>
                  <p className="text-sm text-white">{new Date(project.target_date).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#666] mb-1">Epics</p>
                <p className="text-sm text-white">{epics.length} epics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}