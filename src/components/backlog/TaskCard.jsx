import React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, AlertCircle } from "lucide-react";

const priorityColors = {
  urgent: "text-[#F87171]",
  high: "text-[#FB923C]",
  medium: "text-[#FACC15]",
  low: "text-[#4ADE80]",
};

const statusColors = {
  todo: "bg-[#252525] text-[#999]",
  in_progress: "bg-[#1E4D7B] text-[#60A5FA]",
  in_review: "bg-[#5A3A1E] text-[#FB923C]",
  done: "bg-[#1B4D2E] text-[#4ADE80]",
};

export default function TaskCard({ task }) {
  return (
    <div className="p-3 bg-[#0D0D0D] border border-[#252525] rounded hover:border-[#333] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-[#666] mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded ${statusColors[task.status]}`}>
              {task.status.replace("_", " ")}
            </span>
            {task.story_points && (
              <span className="text-xs px-2 py-1 rounded bg-[#252525] text-[#999]">
                {task.story_points} pts
              </span>
            )}
            {task.priority && task.priority !== "medium" && (
              <span className={`text-xs font-semibold ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-[#999]">
              <Calendar size={12} />
              {format(parseISO(task.due_date), "MMM d")}
            </div>
          )}
          {task.assignee && (
            <div className="w-6 h-6 rounded-full bg-[#5E6AD2] flex items-center justify-center text-[9px] font-bold text-white">
              {task.assignee[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}