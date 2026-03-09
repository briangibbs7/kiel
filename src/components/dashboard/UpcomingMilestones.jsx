import React from "react";
import { format, parseISO, isBefore, startOfToday } from "date-fns";
import { Calendar, Flag } from "lucide-react";

const priorityColors = {
  urgent: "text-[#F87171]",
  high: "text-[#FB923C]",
  medium: "text-[#FACC15]",
  low: "text-[#4ADE80]",
  none: "text-[#999]",
};

export default function UpcomingMilestones({ epics }) {
  const today = startOfToday();
  
  const upcomingMilestones = (epics || [])
    .filter(epic => epic.target_date && isBefore(today, parseISO(epic.target_date)))
    .sort((a, b) => new Date(a.target_date) - new Date(b.target_date))
    .slice(0, 5);

  return (
    <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flag size={16} className="text-[#5E6AD2]" />
        <h3 className="text-sm font-semibold text-white">Upcoming Milestones</h3>
      </div>

      {upcomingMilestones.length === 0 ? (
        <p className="text-sm text-[#666]">No upcoming milestones</p>
      ) : (
        <div className="space-y-3">
          {upcomingMilestones.map((milestone) => {
            const daysUntil = Math.ceil(
              (parseISO(milestone.target_date) - today) / (1000 * 60 * 60 * 24)
            );
            const isOverdue = daysUntil < 0;

            return (
              <div
                key={milestone.id}
                className="p-3 bg-[#0D0D0D] border border-[#252525] rounded hover:border-[#333] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-[#666] mt-1 line-clamp-1">
                      {milestone.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-[#999]">
                      <Calendar size={12} />
                      {format(parseISO(milestone.target_date), "MMM d")}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        isOverdue
                          ? "bg-[#452a2a] text-[#F87171]"
                          : daysUntil <= 7
                          ? "bg-[#4a3a1a] text-[#FB923C]"
                          : "bg-[#1a3a2a] text-[#4ADE80]"
                      }`}
                    >
                      {isOverdue ? "Overdue" : `${daysUntil}d`}
                    </span>
                  </div>
                </div>
                {milestone.priority && milestone.priority !== "none" && (
                  <div className="mt-2">
                    <span className={`text-xs font-semibold ${priorityColors[milestone.priority]}`}>
                      {milestone.priority}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}