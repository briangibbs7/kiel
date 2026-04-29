import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, MoreHorizontal, BarChart2, List, LayoutGrid, Layers, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { HealthBadge } from "../components/shared/StatusBadge";
import TaskRow from "@/components/tasks/TaskRow";
import TaskDetail from "@/components/tasks/TaskDetail";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import ProjectDashboard from "../components/projects/ProjectDashboard";
import ProjectKanban from "../components/projects/ProjectKanban";
import ProjectBacklog from "../components/projects/ProjectBacklog";
import GanttChart from "../components/gantt/GanttChart";

export default function ProjectDetail() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState(null);
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

  const { data: tasks = [] } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: () => base44.entities.Task.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["all-epics"],
    queryFn: () => base44.entities.Epic.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
  });

  // Derive sprint window: use project start_date + 14 days, or last 14 days as fallback
  const sprintStart = project?.start_date || new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const sprintEnd = project?.target_date || new Date().toISOString().split("T")[0];

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", selectedTask?.id],
    queryFn: () => base44.entities.Comment.filter({ task_id: selectedTask.id }),
    enabled: !!selectedTask?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create({ ...data, project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      setShowCreate(false);
    },
  });

  const handleStatusChange = async (taskId, data) => {
    await base44.entities.Task.update(taskId, data);
    setSelectedTask(prev => ({ ...prev, ...data }));
    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
  };

  const handleDateChange = async (taskId, dates) => {
    await base44.entities.Task.update(taskId, dates);
    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
  };

  const handleAddComment = async (content) => {
    await base44.entities.Comment.create({ task_id: selectedTask.id, content, author: "You" });
    queryClient.invalidateQueries({ queryKey: ["comments", selectedTask?.id] });
  };

  const allAssignees = useMemo(() => {
    const assignees = new Map();
    tasks.forEach(task => {
      if (task.assignee) {
        if (!assignees.has(task.assignee)) {
          assignees.set(task.assignee, {
            email: task.assignee,
            initial: task.assignee[0]?.toUpperCase() || "?"
          });
        }
      }
    });
    return Array.from(assignees.values());
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }
    
    if (selectedAssignees.length > 0) {
      filtered = filtered.filter(task => selectedAssignees.includes(task.assignee));
    }
    
    return filtered;
  }, [tasks, searchQuery, selectedAssignees]);

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
        <ProjectDashboard
          project={project}
          tasks={tasks}
          sprintStart={sprintStart}
          sprintEnd={sprintEnd}
        />
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
                  items={filteredTasks}
                  onDateChange={handleDateChange}
                />
              </div>
            ) : view === "backlog" ? (
              <div className="flex-1 overflow-hidden">
                <ProjectBacklog
                  projectId={projectId}
                  tasks={filteredTasks}
                  onTaskClick={(task) => { setSelectedTask(task); setView("list"); }}
                />
              </div>
            ) : view === "kanban" ? (
              <div className="flex-1 overflow-auto">
                <ProjectKanban
                  tasks={filteredTasks}
                  projectId={projectId}
                  onTaskClick={setSelectedTask}
                />
              </div>
            ) : view === "list" ? (
              <div className={`${selectedTask ? "w-[420px] flex-shrink-0" : "flex-1"} border-r border-[#1E1E1E] overflow-y-auto`}>
                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#555]">
                    <p className="text-sm">{searchQuery ? "No tasks match your search" : "No tasks in this project"}</p>
                    <button onClick={() => setShowCreate(true)} className="text-xs text-[#5E6AD2] mt-2 hover:underline">
                      Create a task
                    </button>
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      projectPrefix={project.prefix}
                      onClick={setSelectedTask}
                    />
                  ))
                )}
              </div>
            ) : null}

            {selectedTask && view === "list" && (
              <div className="flex-1">
                <TaskDetail
                  task={selectedTask}
                  comments={comments}
                  onClose={() => setSelectedTask(null)}
                  onStatusChange={handleStatusChange}
                  onAddComment={handleAddComment}
                  allTasks={tasks}
                  onUpdateTask={async (taskId, data) => {
                    await base44.entities.Task.update(taskId, data);
                    setSelectedTask(prev => ({ ...prev, ...data }));
                    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
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
        users={users}
        project={project}
      />
    </div>
  );
}