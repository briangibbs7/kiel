import React from "react";
import { format } from "date-fns";

export default function StoryCard({ story }) {
  const statusColors = {
    backlog: "#6B6B6B",
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
    none: "#6B6B6B",
  };

  return (
    <div className="p-3 bg-[#0D0D0D] border border-[#1A1A1A] rounded hover:border-[#252525] transition-colors group cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white group-hover:text-[#5E6AD2]">
            {story.title}
          </h4>
          <div className="flex items-center gap-2 mt-2">
            {story.story_points !== undefined && (
              <span className="text-xs bg-[#111] text-[#999] px-2 py-1 rounded">
                {story.story_points} pts
              </span>
            )}
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${statusColors[story.status]}20`,
                color: statusColors[story.status],
              }}
            >
              {story.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {story.priority && story.priority !== "none" && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${priorityColors[story.priority]}20`,
                color: priorityColors[story.priority],
              }}
            >
              {story.priority}
            </span>
          )}
          {story.due_date && (
            <span className="text-xs text-[#999]">
              {format(new Date(story.due_date), "MMM d")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}