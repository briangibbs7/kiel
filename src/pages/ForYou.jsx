import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Star, Folder, Eye, LayoutGrid, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ForYou() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['all-projects'],
    queryFn: () => base44.entities.Project.list("-updated_date", 50)
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['my-issues', user?.email],
    queryFn: () => base44.entities.Issue.filter({ assignee: user?.email }, "-updated_date", 20),
    enabled: !!user?.email
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['my-tasks', user?.email],
    queryFn: () => base44.entities.Task.filter({ assignee: user?.email }, "-updated_date", 20),
    enabled: !!user?.email
  });

  const { data: customBoards = [] } = useQuery({
    queryKey: ['my-boards', user?.email],
    queryFn: () => base44.entities.CustomProjectBoard.filter({ created_by: user?.email }, "-updated_date", 10),
    enabled: !!user?.email
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ['all-sprints'],
    queryFn: () => base44.entities.Sprint.list("-updated_date", 50)
  });

  const recentProjects = projects.slice(0, 5);
  const watchedItems = [...issues.filter(i => i.status !== 'done'), ...tasks.filter(t => t.status !== 'done')].slice(0, 10);
  const recommendedProjects = projects.slice(0, 4);

  // Calculate dashboard metrics
  const assignedProjects = projects.length;
  const assignedTasks = tasks.length;
  const assignedIssues = issues.length;
  
  const currentSprint = sprints.find(s => s.status === 'active');
  const currentSprintTasks = currentSprint ? tasks.filter(t => t.project_id === currentSprint.project_id) : [];
  const totalStoryPoints = currentSprintTasks.reduce((sum, t) => sum + (t.story_points || 0), 0);

  return (
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D]">
        <h1 className="text-2xl font-bold text-white">For You</h1>
        <p className="text-sm text-[#999] mt-1">Your personalized workspace dashboard</p>
      </div>

      {/* Dashboard Metrics */}
      <div className="px-6 py-6 border-b border-[#1E1E1E] bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg">
            <p className="text-[11px] text-[#999] uppercase tracking-wider mb-2">Assigned Projects</p>
            <p className="text-2xl font-bold text-white">{assignedProjects}</p>
          </div>
          <div className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg">
            <p className="text-[11px] text-[#999] uppercase tracking-wider mb-2">Assigned Tasks</p>
            <p className="text-2xl font-bold text-[#60A5FA]">{assignedTasks}</p>
          </div>
          <div className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg">
            <p className="text-[11px] text-[#999] uppercase tracking-wider mb-2">Assigned Issues</p>
            <p className="text-2xl font-bold text-[#FB923C]">{assignedIssues}</p>
          </div>
          <div className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg">
            <p className="text-[11px] text-[#999] uppercase tracking-wider mb-2">Current Sprint</p>
            <p className="text-sm font-semibold text-white">{currentSprint?.name || 'None'}</p>
          </div>
          <div className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg">
            <p className="text-[11px] text-[#999] uppercase tracking-wider mb-2">Story Points</p>
            <p className="text-2xl font-bold text-[#A78BFA]">{totalStoryPoints}</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Recommended Projects */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-[#FACC15]" />
            <h2 className="text-lg font-semibold text-white">Recommended Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedProjects.length === 0 ? (
              <p className="text-sm text-[#666] col-span-full">No projects available</p>
            ) : (
              recommendedProjects.map(project => (
                <Link
                  key={project.id}
                  to={createPageUrl("ProjectDetail") + `?id=${project.id}`}
                  className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg hover:border-[#333] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">{project.icon || '📋'}</div>
                    <span className="text-[10px] px-2 py-1 bg-[#252525] text-[#999] rounded">
                      {project.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{project.name}</h3>
                  <p className="text-[11px] text-[#999] truncate">{project.description}</p>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Recently Worked On */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-5 h-5 text-[#60A5FA]" />
            <h2 className="text-lg font-semibold text-white">Recently Worked On</h2>
          </div>
          <div className="space-y-2">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-[#666]">No recent projects</p>
            ) : (
              recentProjects.map(project => (
                <Link
                  key={project.id}
                  to={createPageUrl("ProjectDetail") + `?id=${project.id}`}
                  className="p-3 bg-[#111] border border-[#1E1E1E] rounded hover:bg-[#161616] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{project.icon || '📋'}</span>
                    <div>
                      <h3 className="text-sm font-medium text-white">{project.name}</h3>
                      <p className="text-xs text-[#666]">{project.prefix}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#666]">{format(new Date(project.updated_date), 'MMM d')}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Your Boards */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-5 h-5 text-[#A78BFA]" />
            <h2 className="text-lg font-semibold text-white">Your Boards</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customBoards.length === 0 ? (
              <p className="text-sm text-[#666] col-span-full">No boards created yet</p>
            ) : (
              customBoards.map(board => (
                <Link
                  key={board.id}
                  to={createPageUrl("CustomProjectBoards") + `?id=${board.id}`}
                  className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg hover:border-[#333] transition-colors"
                >
                  <h3 className="font-semibold text-white text-sm mb-1">{board.name}</h3>
                  <p className="text-[11px] text-[#999] mb-2">{board.description}</p>
                  <span className="text-[10px] px-2 py-1 bg-[#252525] text-[#999] rounded capitalize">
                    {board.board_type}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Items You're Watching */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-[#4ADE80]" />
            <h2 className="text-lg font-semibold text-white">Items You're Watching</h2>
          </div>
          <div className="space-y-2">
            {watchedItems.length === 0 ? (
              <p className="text-sm text-[#666]">No active items to watch</p>
            ) : (
              watchedItems.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-[#111] border border-[#1E1E1E] rounded hover:bg-[#161616] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.status === 'done' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4ADE80] flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#FB923C] flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                      <p className="text-xs text-[#666]">{item.priority || 'medium'} priority • {item.status}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#666] flex-shrink-0 ml-2">
                    {format(new Date(item.updated_date), 'MMM d')}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}