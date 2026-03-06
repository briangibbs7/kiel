import React from "react";
import { Link2, AlertCircle } from "lucide-react";

export default function DependencyViewer({ dependencies, items, onItemClick }) {
  if (!dependencies || dependencies.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Link2 size={14} className="text-[#6B6B6B]" />
        <span className="text-xs font-medium text-[#6B6B6B]">Dependencies</span>
      </div>
      <div className="space-y-1.5">
        {dependencies.map((dep) => {
          const item = items.find((i) => i.id === dep.itemId);
          if (!item) return null;

          const displayText = item.prefix ? `${item.prefix}-${item.issue_number}` : item.name;
          const isBlocked = dep.type === "is blocked by";

          return (
            <div
              key={dep.itemId}
              className="flex items-center gap-2 text-[11px] p-2 rounded bg-[#111] border border-[#1E1E1E] hover:border-[#333] cursor-pointer transition-colors group"
              onClick={() => onItemClick?.(item)}
            >
              {isBlocked && <AlertCircle size={12} className="text-red-500 flex-shrink-0" />}
              <span className="text-[#E5E5E5] flex-1 truncate font-mono">{displayText}</span>
              <span className="text-[#555] text-[10px]">{dep.type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}