import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, MoreHorizontal, BarChart2, List, LayoutGrid, Layers, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { HealthBadge } from "../components/shared/StatusBadge";
import IssueRow from "../components/issues/IssueRow";
import IssueDetail from "../components/issues/IssueDetail";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import SprintBurndownChart from "../components/projects/SprintBurndownChart";
import ProjectBurnupChart from "../components/projects/ProjectBurnupChart";
import ProjectKanban from "../components/projects/ProjectKanban";
import ProjectBacklog from "../components/projects/ProjectBacklog";
import GanttChart from "../components/gantt/GanttChart";

export default function ProjectDetail() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [section, setSection] = useState("dashboard"); // "dashboard" | "tasks"
  const [view, setView] = useState("list"); // "list" | "kanban" | "backlog" | "gantt"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState([]);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const project = projects.find(p => p.id === projectId);

  const { data: issues = [] } = useQuery({
    queryKey: ["project-issues", projectId],
    queryFn: () => base44.entities.Issue.filter({ project_id: projectId }, "-created_date"),
    enabled: !!projectId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: () => base44.entities.Task.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["all-epics"],
    queryFn: () => base44.entities.Epic.list(),
  });

  // Derive sprint window: use project start_date + 14 days, or last 14 days as fallback
  const sprintStart = project?.start_date || new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const sprintEnd = project?.target_date || new Date().toISOString().split("T")[0];

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", selectedIssue?.id],
    queryFn: () => base44.entities.Comment.filter({ issue_id: selectedIssue.id }),
    enabled: !!selectedIssue?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create({ ...data, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      setShowCreate(false);
    },
  });

  const handleStatusChange = async (issueId, data) => {
    await base44.entities.Issue.update(issueId, data);
    setSelectedIssue(prev => ({ ...prev, ...data }));
    queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
  };

  const handleDateChange = async (itemId, dates) => {
    const isTask = tasks.find(t => t.id === itemId);
    if (isTask) {
      await base44.entities.Task.update(itemId, dates);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    } else {
      await base44.entities.Issue.update(itemId, dates);
      queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
    }
  };

  const handleAddComment = async (content) => {
    await base44.entities.Comment.create({ issue_id: selectedIssue.id, content, author: "You" });
    queryClient.invalidateQueries({ queryKey: ["comments", selectedIssue?.id] });
  };

  const allAssignees = useMemo(() => {
    const assignees = new Map();
    [...issues, ...tasks].forEach(item => {
      if (item.assignee) {
        if (!assignees.has(item.assignee)) {
          assignees.set(item.assignee, {
            email: item.assignee,
            initial: item.assignee[0]?.toUpperCase() || "?"
          });
        }
      }
    });
    return Array.from(assignees.values());
  }, [issues, tasks]);

  const filteredIssues = useMemo(() => {
    let filtered = issues;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title?.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query)
      );
    }
    
    if (selectedAssignees.length > 0) {
      filtered = filtered.filter(issue => selectedAssignees.includes(issue.assignee));
    }
    
    return filtered;
  }, [issues, searchQuery, selectedAssignees]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    if (selectedAssignees.length > 0) {
      filtered = filtered.filter(task => selectedAssignees.includes(task.assignee));
    }
    
    return filtered;
  }, [tasks, selectedAssignees]);

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center text-[#555]">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl("Projects"))} className="text-[#6B6B6B] hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          {project.icon && <span>{project.icon}</span>}
          <h1 className="text-sm font-semibold text-white">{project.name}</h1>
          <span className="text-xs text-[#555] font-mono">{project.prefix}</span>
          <HealthBadge health={project.health} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(true)} className="text-[#6B6B6B] hover:text-white transition-colors">
            <Plus size={16} />
          </button>
          <button className="text-[#555] hover:text-white transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="px-5 py-2.5 border-b border-[#1E1E1E] flex items-center gap-2">
        <button
          onClick={() => setSection("dashboard")}
          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${section === "dashboard" ? "bg-[#2A2A2A] text-white" : "text-[#666] hover:text-[#999]"}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setSection("tasks")}
          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${section === "tasks" ? "bg-[#2A2A2A] text-white" : "text-[#666] hover:text-[#999]"}`}
        >
          Tasks
        </button>
      </div>

      {/* Dashboard Section */}
      {section === "dashboard" && (
        <div className="flex-1 overflow-auto p-5">
          <div className="space-y-6">
            <div className="space-y-4">
              <ProjectBurnupChart
                tasks={tasks}
                issues={issues}
                targetDate={project?.target_date}
                startDate={project?.start_date}
              />
              <SprintBurndownChart tasks={tasks} sprintStart={sprintStart} sprintEnd={sprintEnd} />
            </div>
          </div>
        </div>
      )}

      {/* Tasks Section */}
      {section === "tasks" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View Controls */}
          <div className="px-5 py-2.5 border-b border-[#1E1E1E] flex items-center justify-between gap-2">
            <div className="flex items-center bg-[#161616] border border-[#252525] rounded-lg p-0.5">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${view === "list" ? "bg-[#2A2A2A] text-white" : "text-[#666] hover:text-[#999]"}`}
              >
                <List size={13} /> List
              </button>
              <button
                onClick={() => setView("kanban")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${view === "kanban" ? "bg-[#2A2A2A] text-white" : "text-[#666] hover:text-[#999]"}`}
              >
                <LayoutGrid size={13} /> Kanban
              </button>
              <button
                onClick={() => setView("backlog")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${view === "backlog" ? "bg-[#2A2A2A] text-white" : "text-[#666] hover:text-[#999]"}`}
              >
                <Layers size={13} /> Backlog
              </button>
              <button
                onClick={() => setView("gantt")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${view === "gantt" ? "bg-[#2A2A2A] text-white" : "text-[#666] hover:text-[#999]"}`}
              >
                <BarChart2 size={13} /> Timeline
              </button>
            </div>
            
            {(view === "list" || view === "backlog") && (
              <div className="flex items-center gap-1.5">
                {allAssignees.map(assignee => (
                  <button
                    key={assignee.email}
                    onClick={() => setSelectedAssignees(prev =>
                      prev.includes(assignee.email)
                        ? prev.filter(a => a !== assignee.email)
                        : [...prev, assignee.email]
                    )}
                    title={assignee.email}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all ${
                      selectedAssignees.includes(assignee.email)
                        ? "bg-[#5E6AD2] text-white ring-2 ring-[#7C3AED]"
                        : "bg-[#252525] text-[#999] hover:bg-[#333]"
                    }`}
                  >
                    {assignee.initial}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161616] border border-[#252525] rounded-lg pl-9 pr-9 py-1.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#5E6AD2]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {view === "gantt" ? (
              <div className="flex-1 overflow-auto p-5">
                <GanttChart
                  items={[...filteredIssues, ...tasks]}
                  onDateChange={handleDateChange}
                />
              </div>
            ) : view === "backlog" ? (
              <div className="flex-1 overflow-hidden">
                <ProjectBacklog
                  projectId={projectId}
                  issues={filteredIssues}
                  tasks={filteredTasks}
                  onIssueClick={(issue) => { setSelectedIssue(issue); setView("list"); }}
                />
              </div>
            ) : view === "kanban" ? (
              <div className="flex-1 overflow-auto">
                <ProjectKanban
                  issues={filteredIssues}
                  projectId={projectId}
                  onIssueClick={setSelectedIssue}
                />
              </div>
            ) : view === "list" ? (
              <div className={`${selectedIssue ? "w-[420px] flex-shrink-0" : "flex-1"} border-r border-[#1E1E1E] overflow-y-auto`}>
                {filteredIssues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#555]">
                    <p className="text-sm">{searchQuery ? "No tasks match your search" : "No tasks in this project"}</p>
                    <button onClick={() => setShowCreate(true)} className="text-xs text-[#5E6AD2] mt-2 hover:underline">
                      Create a task
                    </button>
                  </div>
                ) : (
                  filteredIssues.map(issue => (
                    <IssueRow
                      key={issue.id}
                      issue={issue}
                      projectPrefix={project.prefix}
                      onClick={setSelectedIssue}
                    />
                  ))
                )}
              </div>
            ) : null}

            {selectedIssue && view === "list" && (
              <div className="flex-1">
                <IssueDetail
                  issue={selectedIssue}
                  comments={comments}
                  onClose={() => setSelectedIssue(null)}
                  onStatusChange={handleStatusChange}
                  onAddComment={handleAddComment}
                  allIssues={issues}
                  onUpdateIssue={async (issueId, data) => {
                    await base44.entities.Issue.update(issueId, data);
                    setSelectedIssue(prev => ({ ...prev, ...data }));
                    queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <CreateTaskModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        epics={epics}
      />
    </div>
  );
}