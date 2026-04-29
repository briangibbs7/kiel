import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronRight, List, Columns, Network, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubTaskManager from "@/components/tasks/SubTaskManager";
import TaskDependencyManager from "@/components/tasks/TaskDependencyManager";
import CommentThread from "@/components/comments/CommentThread";
import TaskAttachments from "@/components/tasks/TaskAttachments";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import TaskKanbanBoard from "@/components/tasks/TaskKanbanBoard";
import DependencyGraph from "@/components/tasks/DependencyGraph";

export default function Tasks() {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [selectedStory, setSelectedStory] = useState(null);
  const [view, setView] = useState("list");
  const [showDependencyMap, setShowDependencyMap] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const queryClient = useQueryClient();

  const { data: stories = [] } = useQuery({
    queryKey: ["all-stories"],
    queryFn: () => base44.entities.Story.list("-created_date", 100),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 200),
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["all-epics"],
    queryFn: () => base44.entities.Epic.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      setShowCreateTask(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.Task.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      setEditingTask(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }) => base44.entities.Task.update(taskId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-tasks"] }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => base44.entities.Task.delete(taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-tasks"] }),
  });

  const toggleTask = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const getTasksForStory = (storyId) => {
    return tasks.filter((t) => t.story_id === storyId);
  };

  const getTasksWithoutStory = () => {
    return tasks.filter((t) => !t.story_id);
  };

  const statusColors = {
    todo: "#6B6B6B",
    in_progress: "#FACC15",
    in_review: "#60A5FA",
    done: "#4ADE80",
  };

  const priorityColors = {
    urgent: "#F87171",
    high: "#FB923C",
    medium: "#FACC15",
    low: "#60A5FA",
  };

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "var(--pm-bg)" }}>
      <div className="px-6 py-4 border-b sticky top-0" style={{ borderColor: "var(--pm-border)", backgroundColor: "var(--pm-bg)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--pm-text)" }}>Tasks</h1>
            <p className="text-sm mt-1" style={{ color: "var(--pm-text-secondary)" }}>
              Manage tasks with subtasks and dependencies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg p-0.5" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border-light)" }}>
              <button
                onClick={() => { setView("list"); setShowDependencyMap(false); }}
                style={view === "list" && !showDependencyMap ? { backgroundColor: "var(--pm-surface-hover)", color: "var(--pm-text)" } : { color: "var(--pm-text-muted)" }}
                className="px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors"
              >
                <List size={13} /> List
              </button>
              <button
                onClick={() => { setView("board"); setShowDependencyMap(false); }}
                style={view === "board" && !showDependencyMap ? { backgroundColor: "var(--pm-surface-hover)", color: "var(--pm-text)" } : { color: "var(--pm-text-muted)" }}
                className="px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors"
              >
                <Columns size={13} /> Board
              </button>
              <button
                onClick={() => setShowDependencyMap(!showDependencyMap)}
                style={showDependencyMap ? { backgroundColor: "var(--pm-surface-hover)", color: "var(--pm-text)" } : { color: "var(--pm-text-muted)" }}
                className="px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors"
              >
                <Network size={13} /> Dependencies
              </button>
            </div>
            <Button onClick={() => setShowCreateTask(true)} className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90">
              <Plus size={16} className="mr-2" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {showDependencyMap ? (
        <div className="p-6 h-[calc(100%-80px)] overflow-y-auto">
          <DependencyGraph tasks={tasks} />
        </div>
      ) : view === "board" ? (
        <div className="p-6 overflow-x-auto h-[calc(100%-80px)]">
          <TaskKanbanBoard
            tasks={tasks}
            onStatusChange={(taskId, status) => updateStatusMutation.mutate({ taskId, status })}
          />
        </div>
      ) : (
        <div className="p-6 max-w-6xl mx-auto space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12" style={{ color: "var(--pm-text-muted)" }}>
            <p className="text-sm">No tasks yet. Create a task to get started.</p>
          </div>
        ) : (
          <>
            {getTasksWithoutStory().length > 0 && (
              <div className="space-y-2">
                <div className="px-4 py-3 border rounded-lg" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
                  <h3 className="font-medium" style={{ color: "var(--pm-text)" }}>General Tasks</h3>
                  <p className="text-xs mt-1" style={{ color: "var(--pm-text-secondary)" }}>{getTasksWithoutStory().length} tasks</p>
                </div>
                <div className="space-y-2 ml-4">
                  {getTasksWithoutStory().map((task) => {
                    const isExpanded = expandedTasks[task.id];
                    return (
                      <div key={task.id} className="border rounded-lg overflow-hidden" style={{ backgroundColor: "var(--pm-bg)", borderColor: "var(--pm-border)" }}>
                        <div className="w-full px-4 py-3 flex items-center gap-3 group">
                          <button onClick={() => toggleTask(task.id)} style={{ color: "var(--pm-text-muted)" }} className="hover:opacity-80 transition-opacity">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          <div className="flex-1 text-left min-w-0">
                            <h4 className="font-medium truncate" style={{ color: "var(--pm-text)" }}>{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${statusColors[task.status]}20`, color: statusColors[task.status] }}>{task.status}</span>
                              {task.priority && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${priorityColors[task.priority]}20`, color: priorityColors[task.priority] }}>{task.priority}</span>}
                              {task.estimated_hours && <span className="text-[10px]" style={{ color: "var(--pm-text-secondary)" }}>{task.estimated_hours}h</span>}
                            </div>
                          </div>
                          {task.assignee && <span className="text-xs flex-shrink-0" style={{ color: "var(--pm-text-secondary)" }}>{task.assignee.split("@")[0]}</span>}
                          <button onClick={() => setEditingTask(task)} className="hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" style={{ color: "var(--pm-text-muted)" }} title="Edit task"><Edit2 size={14} /></button>
                          <button onClick={() => { if (confirm('Delete this task?')) deleteTaskMutation.mutate(task.id); }} className="hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" style={{ color: "var(--pm-text-muted)" }} title="Delete task"><Trash2 size={14} /></button>
                        </div>
                        {isExpanded && (
                          <div className="border-t p-4 space-y-6" style={{ borderColor: "var(--pm-border)", backgroundColor: "var(--pm-bg)" }}>
                            {task.description && (
                              <div>
                                <h5 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--pm-text-secondary)" }}>Description</h5>
                                <p className="text-sm" style={{ color: "var(--pm-text-secondary)" }}>{task.description}</p>
                              </div>
                            )}
                            <SubTaskManager taskId={task.id} />
                            <TaskDependencyManager taskId={task.id} storyId={null} />
                            <TaskAttachments task={task} />
                            <CommentThread taskId={task.id} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {stories.map((story) => {
              const storyTasks = getTasksForStory(story.id);
              if (storyTasks.length === 0) return null;
              return (
                <div key={story.id} className="space-y-2">
                  <div className="px-4 py-3 border rounded-lg" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
                    <h3 className="font-medium" style={{ color: "var(--pm-text)" }}>{story.title}</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--pm-text-secondary)" }}>{storyTasks.length} tasks</p>
                  </div>
                  <div className="space-y-2 ml-4">
                    {storyTasks.map((task) => {
                      const isExpanded = expandedTasks[task.id];
                      return (
                        <div key={task.id} className="border rounded-lg overflow-hidden" style={{ backgroundColor: "var(--pm-bg)", borderColor: "var(--pm-border)" }}>
                          <div className="w-full px-4 py-3 flex items-center gap-3 group">
                            <button onClick={() => toggleTask(task.id)} style={{ color: "var(--pm-text-muted)" }} className="hover:opacity-80 transition-opacity">
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <div className="flex-1 text-left min-w-0">
                              <h4 className="font-medium truncate" style={{ color: "var(--pm-text)" }}>{task.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${statusColors[task.status]}20`, color: statusColors[task.status] }}>{task.status}</span>
                                {task.priority && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${priorityColors[task.priority]}20`, color: priorityColors[task.priority] }}>{task.priority}</span>}
                                {task.estimated_hours && <span className="text-[10px]" style={{ color: "var(--pm-text-secondary)" }}>{task.estimated_hours}h</span>}
                              </div>
                            </div>
                            {task.assignee && <span className="text-xs flex-shrink-0" style={{ color: "var(--pm-text-secondary)" }}>{task.assignee.split("@")[0]}</span>}
                            <button onClick={() => setEditingTask(task)} className="hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" style={{ color: "var(--pm-text-muted)" }} title="Edit task"><Edit2 size={14} /></button>
                            <button onClick={() => { if (confirm('Delete this task?')) deleteTaskMutation.mutate(task.id); }} className="hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" style={{ color: "var(--pm-text-muted)" }} title="Delete task"><Trash2 size={14} /></button>
                          </div>
                          {isExpanded && (
                            <div className="border-t p-4 space-y-6" style={{ borderColor: "var(--pm-border)", backgroundColor: "var(--pm-bg)" }}>
                              {task.description && (
                                <div>
                                  <h5 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--pm-text-secondary)" }}>Description</h5>
                                  <p className="text-sm" style={{ color: "var(--pm-text-secondary)" }}>{task.description}</p>
                                </div>
                              )}
                              <SubTaskManager taskId={task.id} />
                              <TaskDependencyManager taskId={task.id} storyId={story.id} />
                              <TaskAttachments task={task} />
                              <CommentThread taskId={task.id} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        <CreateTaskModal
          open={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          onSubmit={(data) => createTaskMutation.mutate(data)}
          epics={epics}
          users={users}
          project={null}
        />

        <CreateTaskModal
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={(data) => updateTaskMutation.mutate({ taskId: editingTask.id, data })}
          epics={epics}
          users={users}
          project={null}
          initialData={editingTask}
          isEditing={true}
        />
        </div>
      )}
    </div>
    );
}