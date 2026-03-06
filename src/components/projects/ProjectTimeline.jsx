import React, { useMemo } from "react";
import { eachMonthOfInterval, startOfMonth, endOfMonth, format, isBefore, isAfter, min, max } from "date-fns";

const colorMap = {
  ENG: "#5E6AD2",
  MOB: "#4ADE80",
  INF: "#FACC15",
  UIR: "#22D3EE",
  APAC: "#FB923C",
};

export default function ProjectTimeline({ projects }) {
  const timeline = useMemo(() => {
    if (!projects.length) return { months: [], projects: [] };

    // Get date range
    const allDates = projects
      .flatMap(p => [
        p.start_date ? new Date(p.start_date) : null,
        p.target_date ? new Date(p.target_date) : null,
      ])
      .filter(Boolean);

    if (allDates.length === 0) return { months: [], projects: [] };

    const minDate = min(allDates);
    const maxDate = max(allDates);
    
    // Generate months from min to max date
    const months = eachMonthOfInterval({
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate),
    });

    return { months, projects };
  }, [projects]);

  if (timeline.months.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-[#555]">
        <p>No projects with dates to display</p>
      </div>
    );
  }

  const monthWidth = 120; // pixels per month
  const totalWidth = timeline.months.length * monthWidth;

  return (
    <div className="flex-1 overflow-auto p-5">
      <div className="min-w-max">
        {/* Month headers */}
        <div className="flex gap-0 mb-6 sticky top-0 bg-[#0D0D0D] pt-2">
          <div className="w-48 flex-shrink-0" />
          {timeline.months.map((month) => (
            <div
              key={month.toISOString()}
              className="text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-wider text-center flex-shrink-0"
              style={{ width: monthWidth }}
            >
              {format(month, "MMM")}
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="space-y-3">
          {timeline.projects.map((project) => {
            const startDate = project.start_date ? new Date(project.start_date) : null;
            const endDate = project.target_date ? new Date(project.target_date) : null;

            if (!startDate && !endDate) return null;

            // Calculate position and width
            const firstMonth = timeline.months[0];
            const lastMonth = timeline.months[timeline.months.length - 1];
            const projectStart = startDate || endDate || firstMonth;
            const projectEnd = endDate || startDate || lastMonth;

            const startMonthIndex = timeline.months.findIndex(
              (m) =>
                m.getFullYear() === projectStart.getFullYear() &&
                m.getMonth() === projectStart.getMonth()
            );
            const endMonthIndex = timeline.months.findIndex(
              (m) =>
                m.getFullYear() === projectEnd.getFullYear() &&
                m.getMonth() === projectEnd.getMonth()
            );

            const startOffset = startMonthIndex >= 0 ? startMonthIndex * monthWidth : 0;
            const span = endMonthIndex >= 0 ? endMonthIndex - startMonthIndex + 1 : 1;
            const width = Math.max(monthWidth, span * monthWidth);

            const color = colorMap[project.prefix] || "#5E6AD2";

            return (
              <div key={project.id} className="flex items-center gap-3">
                <div className="w-48 flex-shrink-0">
                  <div className="flex items-center gap-2 px-3 py-2 rounded text-sm">
                    {project.icon && <span>{project.icon}</span>}
                    <div className="min-w-0">
                      <p className="text-[#E5E5E5] text-xs font-medium truncate">
                        {project.name}
                      </p>
                      <p className="text-[#555] text-[10px]">{project.prefix}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline bar */}
                <div className="relative h-7 flex-1 bg-[#111] rounded border border-[#1E1E1E]">
                  <div
                    className="absolute h-full rounded border border-l-2"
                    style={{
                      left: `${startOffset}px`,
                      width: `${width}px`,
                      backgroundColor: `${color}30`,
                      borderColor: color,
                      borderLeftColor: color,
                    }}
                  >
                    <div className="flex items-center h-full px-2 text-[10px] font-medium text-white truncate">
                      {project.target || "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}