import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, CheckCircle2, Circle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CommentThread from "@/components/comments/CommentThread";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function SubTaskManager({ taskId }) {
  const [showCreate, setShowCreate] = useState(false);
  const [expandedSubtask, setExpandedSubtask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    assignee: "",
    due_date: "",
  });

  const queryClient = useQueryClient();

  const { data: subtasks = [] } = useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: () =>
      base44.entities.SubTask.filter({ task_id: taskId }, "-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.SubTask.create({
        ...data,
        task_id: taskId,
        status: "todo",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
      setFormData({ title: "", assignee: "", due_date: "" });
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.SubTask.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SubTask.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
    },
  });

  const completedCount = subtasks.filter((s) => s.status === "done").length;
  const completionRate =
    subtasks.length > 0
      ? Math.round((completedCount / subtasks.length) * 100)
      : 0;

  const statusColors = {
    todo: "#6B6B6B",
    in_progress: "#FACC15",
    done: "#4ADE80",
  };

  const getNextStatus = (current) => {
    const statuses = ["todo", "in_progress", "done"];
    const currentIdx = statuses.indexOf(current);
    return statuses[(currentIdx + 1) % statuses.length];
  };

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#999]">Sub-task Progress</p>
            <span className="text-xs text-[#999]">
              {completedCount}/{subtasks.length}
            </span>
          </div>
          <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5E6AD2] to-[#7C3AED]"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-[#999]">{completionRate}% complete</p>
        </div>
      )}

      {/* Sub-tasks list */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="bg-[#0D0D0D] border border-[#1A1A1A] rounded hover:border-[#252525] transition-colors"
          >
            <div className="p-3 flex items-start gap-3 group">
              <button
                onClick={() =>
                  updateMutation.mutate({
                    id: subtask.id,
                    status: getNextStatus(subtask.status),
                  })
                }
                className="text-[#555] hover:text-white transition-colors mt-0.5"
                title="Click to change status"
              >
                {subtask.status === "done" ? (
                  <CheckCircle2 size={16} className="text-[#4ADE80]" />
                ) : (
                  <Circle size={16} />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    subtask.status === "done"
                      ? "line-through text-[#666]"
                      : "text-white"
                  }`}
                >
                  {subtask.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {subtask.assignee && (
                    <span className="text-xs text-[#999]">
                      {subtask.assignee.split("@")[0]}
                    </span>
                  )}
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${statusColors[subtask.status]}20`,
                      color: statusColors[subtask.status],
                    }}
                  >
                    {subtask.status}
                  </span>
                  {subtask.due_date && (
                    <span className="text-xs text-[#999]">
                      {format(new Date(subtask.due_date), "MMM d")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() =>
                    setExpandedSubtask(
                      expandedSubtask === subtask.id ? null : subtask.id
                    )
                  }
                  className="text-[#555] hover:text-white transition-colors"
                  title="Comments"
                >
                  <MessageCircle size={14} />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(subtask.id)}
                  className="text-[#555] hover:text-[#F87171] transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {expandedSubtask === subtask.id && (
              <div className="border-t border-[#1E1E1E] bg-[#0D0D0D] p-3">
                <CommentThread subtaskId={subtask.id} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create form */}
      {showCreate ? (
        <div className="p-3 bg-[#111] border border-[#1E1E1E] rounded space-y-3">
          <Input
            autoFocus
            placeholder="Sub-task title..."
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="bg-[#0D0D0D] border-[#252525] text-white text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="email"
              placeholder="Assignee email..."
              value={formData.assignee}
              onChange={(e) =>
                setFormData({ ...formData, assignee: e.target.value })
              }
              className="bg-[#0D0D0D] border-[#252525] text-white text-sm"
            />
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              className="bg-[#0D0D0D] border-[#252525] text-white text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                createMutation.mutate(formData)
              }
              className="bg-[#5E6AD2] text-white"
            >
              Create
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowCreate(true)}
          className="w-full"
        >
          <Plus size={14} className="mr-1" />
          Add Sub-task
        </Button>
      )}
    </div>
  );
}