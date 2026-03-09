import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronRight, List, Columns, Network } from "lucide-react";
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

  const queryClient = useQueryClient();

  const { data: stories = [] } = useQuery({
    queryKey: ["all-stories"],
    queryFn: () => base44.entities.Story.list("-created_date", 100),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 200),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      setShowCreateTask(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }) => base44.entities.Task.update(taskId, { status }),
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
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tasks</h1>
            <p className="text-sm text-[#999] mt-1">
              Manage tasks with subtasks and dependencies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#1A1A1A] border border-[#333] rounded-lg p-0.5">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors ${view === "list" ? "bg-[#2A2A2A] text-white" : "text-[#666] hover:text-[#999]"}`}
              >
                <List size={13} /> List
              </button>
              <button
                onClick={() => setView("board")}
                className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors ${view === "board" ? "bg-[#2A2A2A] text-white" : "text-[#666] hover:text-[#999]"}`}
              >
                <Columns size={13} /> Board
              </button>
              <button
                onClick={() => setShowDependencyMap(!showDependencyMap)}
                className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors ${showDependencyMap ? "bg-[#2A2A2A] text-white" : "text-[#666] hover:text-[#999]"}`}
              >
                <Network size={13} /> Dependencies
              </button>
            </div>
            <Button
              onClick={() => setShowCreateTask(true)}
              className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
            >
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
        {stories.length === 0 ? (
          <div className="text-center py-12 text-[#555]">
            <p className="text-sm">No stories yet. Create a story first.</p>
          </div>
        ) : (
          stories.map((story) => {
            const storyTasks = getTasksForStory(story.id);
            if (storyTasks.length === 0) return null;

            return (
              <div key={story.id} className="space-y-2">
                <div className="px-4 py-3 bg-[#111] border border-[#1E1E1E] rounded-lg">
                  <h3 className="font-medium text-white">{story.title}</h3>
                  <p className="text-xs text-[#999] mt-1">
                    {storyTasks.length} tasks
                  </p>
                </div>

                <div className="space-y-2 ml-4">
                  {storyTasks.map((task) => {
                    const isExpanded = expandedTasks[task.id];

                    return (
                      <div key={task.id} className="border border-[#1E1E1E] rounded-lg overflow-hidden bg-[#0D0D0D]">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#111] transition-colors group"
                        >
                          <div className="text-[#999]">
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <h4 className="font-medium text-white truncate">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${statusColors[task.status]}20`,
                                  color: statusColors[task.status],
                                }}
                              >
                                {task.status}
                              </span>
                              {task.priority && (
                                <span
                                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                  style={{
                                    backgroundColor: `${priorityColors[task.priority]}20`,
                                    color: priorityColors[task.priority],
                                  }}
                                >
                                  {task.priority}
                                </span>
                              )}
                              {task.estimated_hours && (
                                <span className="text-[10px] text-[#999]">
                                  {task.estimated_hours}h
                                </span>
                              )}
                            </div>
                          </div>

                          {task.assignee && (
                            <span className="text-xs text-[#999] flex-shrink-0">
                              {task.assignee.split("@")[0]}
                            </span>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="border-t border-[#1E1E1E] bg-[#0D0D0D] p-4 space-y-6">
                            {task.description && (
                              <div>
                                <h5 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
                                  Description
                                </h5>
                                <p className="text-sm text-[#CCC]">
                                  {task.description}
                                </p>
                              </div>
                            )}

                            <SubTaskManager taskId={task.id} />

                            <TaskDependencyManager
                              taskId={task.id}
                              storyId={story.id}
                            />

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
          })
        )}
      </div>
      )}

      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSubmit={(data) => createTaskMutation.mutate(data)}
        stories={stories}
      />
    </div>
  );
}