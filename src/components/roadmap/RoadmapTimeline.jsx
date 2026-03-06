import React, { useMemo } from "react";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import RoadmapEpicBar from "./RoadmapEpicBar";

export default function RoadmapTimeline({ epics }) {
  const timelineMonths = useMemo(() => {
    if (epics.length === 0) return [];

    const dates = epics
      .flatMap((e) => [e.start_date, e.target_date])
      .filter(Boolean);

    if (dates.length === 0) {
      const now = new Date();
      return getMonthsRange(
        new Date(now.getFullYear(), now.getMonth(), 1),
        new Date(now.getFullYear(), now.getMonth() + 12, 1)
      );
    }

    const minDate = new Date(Math.min(...dates.map((d) => new Date(d))));
    const maxDate = new Date(Math.max(...dates.map((d) => new Date(d))));

    // Start from first month, extend 6 months beyond
    const startMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 6, 1);

    return getMonthsRange(startMonth, endMonth);
  }, [epics]);

  const statusColors = {
    backlog: "#6B6B6B",
    active: "#FACC15",
    completed: "#4ADE80",
  };

  return (
    <div className="space-y-4">
      {/* Timeline header */}
      <div className="flex">
        <div className="w-48 flex-shrink-0" />
        <div className="flex gap-1 overflow-x-auto pb-2">
          {timelineMonths.map((month) => (
            <div
              key={month.toISOString()}
              className="flex-shrink-0 w-20 text-center"
            >
              <p className="text-xs font-medium text-[#999]">
                {format(month, "MMM")}
              </p>
              <p className="text-[10px] text-[#555]">
                {format(month, "yy")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Epics */}
      <div className="space-y-2">
        {epics.map((epic) => (
          <RoadmapEpicBar
            key={epic.id}
            epic={epic}
            timelineMonths={timelineMonths}
            statusColor={statusColors[epic.status] || "#6B6B6B"}
          />
        ))}
      </div>
    </div>
  );
}

function getMonthsRange(start, end) {
  const months = [];
  let current = new Date(start);

  while (current < end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}