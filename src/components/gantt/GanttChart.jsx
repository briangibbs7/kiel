import React, { useState, useMemo } from "react";
import { format, parseISO, isAfter } from "date-fns";
import { GripHorizontal } from "lucide-react";

const priorityColors = {
  urgent: "#F87171",
  high: "#FB923C",
  medium: "#FACC15",
  low: "#4ADE80",
};

const statusColors = {
  todo: "#555",
  in_progress: "#60A5FA",
  in_review: "#FB923C",
  done: "#4ADE80",
};

export default function GanttChart({ items, onDateChange }) {
  const [draggingItem, setDraggingItem] = useState(null);
  const [startX, setStartX] = useState(0);

  const { minDate, maxDate, daysCount } = useMemo(() => {
    const dates = items
      .flatMap(item => [item.start_date || item.created_date, item.target_date || item.due_date])
      .filter(Boolean)
      .map(d => new Date(d));

    if (dates.length === 0) {
      const today = new Date();
      return { minDate: today, maxDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), daysCount: 30 };
    }

    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    min.setDate(min.getDate() - 5);
    max.setDate(max.getDate() + 5);

    const daysCount = Math.ceil((max - min) / (1000 * 60 * 60 * 24));
    return { minDate: min, maxDate: max, daysCount };
  }, [items]);

  const getItemPosition = (date) => {
    if (!date) return 0;
    const d = new Date(date);
    const days = Math.floor((d - minDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, (days / daysCount) * 100);
  };

  const getDateFromPosition = (percent) => {
    const days = (percent / 100) * daysCount;
    const newDate = new Date(minDate);
    newDate.setDate(newDate.getDate() + Math.round(days));
    return newDate;
  };

  const getCriticalPath = () => {
    const critical = new Set();
    const visited = new Set();

    const traverse = (itemId, isOnPath = false) => {
      if (visited.has(itemId)) return isOnPath;
      visited.add(itemId);

      const item = items.find(i => i.id === itemId);
      if (!item) return isOnPath;

      const dependsOn = item.depends_on_task_ids || [];
      let childOnPath = isOnPath;

      if (dependsOn.length === 0) childOnPath = true;
      else {
        for (const depId of dependsOn) {
          if (traverse(depId, true)) {
            childOnPath = true;
          }
        }
      }

      if (childOnPath) critical.add(itemId);
      return childOnPath;
    };

    for (const item of items) {
      traverse(item.id);
    }

    return critical;
  };

  const criticalPath = getCriticalPath();

  const handleMouseDown = (e, item) => {
    if (item.status === "done") return;
    setDraggingItem(item);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!draggingItem) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    const newDate = getDateFromPosition(percent);

    if (onDateChange) {
      onDateChange(draggingItem.id, {
        start_date: draggingItem.start_date ? format(newDate, "yyyy-MM-dd") : undefined,
        target_date: draggingItem.target_date ? format(newDate, "yyyy-MM-dd") : undefined,
        due_date: draggingItem.due_date ? format(newDate, "yyyy-MM-dd") : undefined,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
  };

  return (
    <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-white mb-4">Project Timeline</h3>

      {/* Timeline Header */}
      <div className="flex gap-4 mb-2">
        <div className="w-48 flex-shrink-0 text-xs font-semibold text-[#666]">Item</div>
        <div className="flex-1 relative">
          <div className="h-6 flex items-end gap-0.5">
            {Array.from({ length: Math.min(daysCount, 30) }).map((_, i) => {
              const date = new Date(minDate);
              date.setDate(date.getDate() + Math.floor(i * (daysCount / 30)));
              return (
                <div key={i} className="flex-1 text-[10px] text-[#666] text-right">
                  {format(date, "MMM d")}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Bars */}
      <div
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {items.map((item) => {
          const startDate = item.start_date || item.created_date;
          const endDate = item.target_date || item.due_date;
          const isCritical = criticalPath.has(item.id);
          const startPos = getItemPosition(startDate);
          const endPos = getItemPosition(endDate);
          const width = Math.max(endPos - startPos, 2);
          const color = statusColors[item.status] || "#999";

          return (
            <div key={item.id} className="flex gap-4 mb-3 items-center group">
              <div className="w-48 flex-shrink-0">
                <p className="text-xs font-medium text-white truncate">{item.title}</p>
                <p className="text-[10px] text-[#666] mt-0.5">
                  {startDate ? format(parseISO(startDate), "MMM d") : "TBD"}
                </p>
              </div>

              <div className="flex-1 relative h-8 bg-[#0D0D0D] rounded border border-[#252525]">
                {/* Bar */}
                <div
                  style={{
                    left: `${startPos}%`,
                    width: `${width}%`,
                  }}
                  className="absolute h-full rounded transition-all"
                  onMouseDown={(e) => handleMouseDown(e, item)}
                  title={`${item.title} - ${startDate ? format(parseISO(startDate), "MMM d") : "?"} to ${endDate ? format(parseISO(endDate), "MMM d") : "?"}`}
                >
                  <div
                    className={`h-full rounded flex items-center px-2 cursor-${item.status === "done" ? "default" : "grab"} active:cursor-grabbing transition-all ${
                      isCritical ? "ring-1 ring-[#FB923C]" : ""
                    }`}
                    style={{
                      backgroundColor: color,
                      opacity: item.status === "done" ? 0.5 : 0.8,
                    }}
                  >
                    {width > 30 && (
                      <div className="text-[9px] text-white font-semibold truncate">
                        {item.status === "in_progress" && "⏳"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dependency Lines */}
                {(item.depends_on_task_ids || []).map((depId) => {
                  const depItem = items.find(i => i.id === depId);
                  if (!depItem) return null;
                  const depEndPos = getItemPosition(depItem.target_date || depItem.due_date);
                  const currentStartPos = getItemPosition(startDate);
                  return (
                    <svg
                      key={depId}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      style={{ overflow: "visible" }}
                    >
                      <line
                        x1={`${depEndPos}%`}
                        y1={-15}
                        x2={`${currentStartPos}%`}
                        y2={4}
                        stroke="#666"
                        strokeWidth={1}
                        strokeDasharray="2,2"
                      />
                    </svg>
                  );
                })}

                {/* Hover Actions */}
                {item.status !== "done" && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <GripHorizontal size={12} className="text-white/50" />
                  </div>
                )}
              </div>

              {/* End Date */}
              {endDate && (
                <div className="w-16 flex-shrink-0 text-right text-[10px] text-[#666]">
                  {format(parseISO(endDate), "MMM d")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-[#666] space-y-1">
        <p>💡 Drag bars to adjust dates</p>
        <p>🔶 Orange ring indicates critical path</p>
      </div>
    </div>
  );
}