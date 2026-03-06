import React, { useMemo } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";

export default function RoadmapEpicBar({ epic, timelineMonths, statusColor }) {
  const barPosition = useMemo(() => {
    if (!epic.start_date || !epic.target_date) {
      return { start: 0, width: 0 };
    }

    const startDate = parseISO(epic.start_date);
    const targetDate = parseISO(epic.target_date);
    const timelineStart = timelineMonths[0];
    const timelineEnd = timelineMonths[timelineMonths.length - 1];

    // Calculate position
    const totalMonths = timelineMonths.length;
    let barStartIdx = 0;
    let barEndIdx = totalMonths;

    for (let i = 0; i < timelineMonths.length; i++) {
      const monthStart = timelineMonths[i];
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      if (startDate < monthEnd && barStartIdx === 0) {
        barStartIdx = i;
      }
      if (targetDate <= monthStart) {
        barEndIdx = i;
        break;
      }
      if (i === timelineMonths.length - 1) {
        barEndIdx = timelineMonths.length;
      }
    }

    return {
      start: barStartIdx,
      width: Math.max(barEndIdx - barStartIdx, 1),
    };
  }, [epic, timelineMonths]);

  const daysLeft = useMemo(() => {
    if (!epic.target_date) return null;
    const target = parseISO(epic.target_date);
    const today = new Date();
    const diff = target - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  }, [epic.target_date]);

  return (
    <div className="flex items-center gap-3">
      {/* Epic name */}
      <div className="w-48 flex-shrink-0">
        <h4 className="text-sm font-medium text-white truncate">
          {epic.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${statusColor}20`,
              color: statusColor,
            }}
          >
            {epic.status}
          </span>
          {epic.priority && epic.priority !== "none" && (
            <span className="text-[10px] text-[#999]">
              {epic.priority}
            </span>
          )}
        </div>
      </div>

      {/* Timeline bar */}
      <div className="flex-1 flex gap-1 overflow-x-auto pb-1">
        {Array.from({ length: timelineMonths.length }).map((_, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-20 h-8 border border-[#1E1E1E] rounded bg-[#0D0D0D]"
            style={{
              backgroundColor:
                idx >= barPosition.start &&
                idx < barPosition.start + barPosition.width
                  ? statusColor + "30"
                  : undefined,
              borderColor:
                idx >= barPosition.start &&
                idx < barPosition.start + barPosition.width
                  ? statusColor + "60"
                  : undefined,
            }}
          />
        ))}
      </div>

      {/* Dates and info */}
      <div className="flex-shrink-0 w-40 text-right">
        <div className="text-xs text-[#999] space-y-1">
          {epic.start_date && (
            <p>{format(parseISO(epic.start_date), "MMM d, yy")}</p>
          )}
          {epic.target_date && (
            <p>
              → {format(parseISO(epic.target_date), "MMM d, yy")}
            </p>
          )}
        </div>
        {daysLeft !== null && (
          <div className={`text-[10px] font-medium mt-1 ${
            daysLeft > 0 ? "text-[#4ADE80]" : "text-[#F87171]"
          }`}>
            {daysLeft > 0
              ? `${daysLeft} days left`
              : `${Math.abs(daysLeft)} days overdue`}
          </div>
        )}
      </div>
    </div>
  );
}