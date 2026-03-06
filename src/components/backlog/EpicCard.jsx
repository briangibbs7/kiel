import React from "react";
import { format } from "date-fns";

export default function EpicCard({ epic }) {
  const statusColors = {
    backlog: "#6B6B6B",
    active: "#FACC15",
    completed: "#4ADE80",
  };

  const priorityColors = {
    urgent: "#F87171",
    high: "#FB923C",
    medium: "#FACC15",
    low: "#60A5FA",
    none: "#6B6B6B",
  };

  return (
    <div className="flex-1 flex items-center gap-4">
      <div className="flex-1">
        <h3 className="font-medium text-white">{epic.title}</h3>
        {epic.description && (
          <p className="text-xs text-[#999] mt-1 line-clamp-1">
            {epic.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {epic.status && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded"
              style={{
                backgroundColor: `${statusColors[epic.status]}20`,
                color: statusColors[epic.status],
              }}
            >
              {epic.status}
            </span>
          )}
          {epic.priority && epic.priority !== "none" && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded"
              style={{
                backgroundColor: `${priorityColors[epic.priority]}20`,
                color: priorityColors[epic.priority],
              }}
            >
              {epic.priority}
            </span>
          )}
        </div>
        {epic.target_date && (
          <span className="text-xs text-[#999]">
            {format(new Date(epic.target_date), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}