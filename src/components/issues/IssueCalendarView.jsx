import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IssueStatusIcon, PriorityIcon } from "@/components/shared/StatusBadge";

export default function IssueCalendarView({ issues, projects, onIssueClick, currentMonth, onMonthChange }) {
  const getPrefix = (projectId) => {
    const p = projects.find(p => p.id === projectId);
    return p?.prefix || "ISS";
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const days = useMemo(() => {
    const daysCount = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    return Array.from({ length: firstDay }).concat(Array.from({ length: daysCount }, (_, i) => i + 1));
  }, [currentMonth]);

  const getIssuesForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return issues.filter(i => i.due_date === dateStr);
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <div className="flex gap-2">
          <button onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-[#1E1E1E] rounded">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => onMonthChange(new Date())} className="px-3 py-1 text-xs hover:bg-[#1E1E1E] rounded">
            Today
          </button>
          <button onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-[#1E1E1E] rounded">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-[#666] py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day, i) => (
          <div
            key={i}
            className={`min-h-24 rounded border border-[#1E1E1E] p-1 overflow-hidden ${
              day ? "bg-[#0D0D0D]" : "bg-[#0A0A0A]"
            }`}
          >
            {day && (
              <>
                <div className="text-xs font-medium text-[#999] mb-1">{day}</div>
                <div className="space-y-0.5">
                  {getIssuesForDate(day).map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => onIssueClick(issue)}
                      className="text-[10px] p-1 bg-[#1E1E1E] rounded hover:bg-[#252525] cursor-pointer truncate text-[#CCC]"
                      title={issue.title}
                    >
                      {getPrefix(issue.project_id)}-{issue.issue_number}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}