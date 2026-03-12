import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Calendar, User } from "lucide-react";
import CommentThread from "@/components/comments/CommentThread";

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function TaskDetail({
  task,
  comments,
  onClose,
  onStatusChange,
  onAddComment,
  allTasks,
  onUpdateTask,
}) {
  const [editingField, setEditingField] = useState(null);

  const { data: epics = [] } = useQuery({
    queryKey: ["all-epics"],
    queryFn: () => base44.entities.Epic.list(),
  });

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D] border-l border-[#1E1E1E] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1E1E1E] flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold text-white truncate text-sm">
          {task.title}
        </h2>
        <button
          onClick={onClose}
          className="text-[#666] hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-[#CCC]">{task.description}</p>
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
              Status
            </h3>
            <Select value={task.status} onValueChange={(status) => onStatusChange(task.id, { status })}>
              <SelectTrigger className="bg-[#111] border-[#333] text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
              Priority
            </h3>
            <Select value={task.priority || "medium"} onValueChange={(priority) => onUpdateTask(task.id, { priority })}>
              <SelectTrigger className="bg-[#111] border-[#333] text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Epic */}
          <div>
            <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
              Epic
            </h3>
            <Select value={task.epic_id || ""} onValueChange={(epic_id) => onUpdateTask(task.id, { epic_id: epic_id || null })}>
              <SelectTrigger className="bg-[#111] border-[#333] text-white text-xs">
                <SelectValue placeholder="No epic" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                <SelectItem value={null}>No epic</SelectItem>
                {epics.map((epic) => (
                  <SelectItem key={epic.id} value={epic.id} className="text-white">
                    {epic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          {task.assignee && (
            <div>
              <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2 flex items-center gap-1">
                <User size={12} /> Assignee
              </h3>
              <p className="text-sm text-[#CCC]">{task.assignee}</p>
            </div>
          )}

          {/* Due Date */}
          {task.due_date && (
            <div>
              <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar size={12} /> Due Date
              </h3>
              <p className="text-sm text-[#CCC]">{new Date(task.due_date).toLocaleDateString()}</p>
            </div>
          )}

          {/* Story Points */}
          {task.story_points && (
            <div>
              <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
                Story Points
              </h3>
              <p className="text-sm text-[#CCC]">{task.story_points}</p>
            </div>
          )}

          {/* Estimated Hours */}
          {task.estimated_hours && (
            <div>
              <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
                Estimated Hours
              </h3>
              <p className="text-sm text-[#CCC]">{task.estimated_hours}h</p>
            </div>
          )}

          {/* Comments */}
          <div className="pt-4 border-t border-[#252525]">
            <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">
              Comments
            </h3>
            <CommentThread taskId={task.id} />
          </div>
        </div>
      </div>
    </div>
  );
}