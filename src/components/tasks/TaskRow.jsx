import React from "react";
import { Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

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

export default function TaskRow({ task, projectPrefix, onClick }) {
  const queryClient = useQueryClient();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm("Delete this task?")) {
      await base44.entities.Task.delete(task.id);
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
    }
  };

  return (
    <div
      onClick={() => onClick(task)}
      className="px-4 py-3 border-b border-[#1E1E1E] hover:bg-[#161616] cursor-pointer transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate text-sm">
            {task.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
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
            {task.story_points && (
              <span className="text-[10px] text-[#999]">
                {task.story_points}pts
              </span>
            )}
          </div>
        </div>
        {task.assignee && (
          <span className="text-xs text-[#999] flex-shrink-0">
            {task.assignee.split("@")[0]}
          </span>
        )}
        <button
          onClick={handleDelete}
          className="text-[#6B6B6B] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}