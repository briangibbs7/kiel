import React from "react";
import { HealthBadge } from "../shared/StatusBadge";
import { ChevronRight } from "lucide-react";

export default function ProjectRow({ project, issueCount, completedIssueCount, onClick, isChild }) {
  const progressPercent = issueCount > 0 ? Math.round((completedIssueCount / issueCount) * 100) : 0;

  return (
    <div
      onClick={() => onClick?.(project)}
      className={`group flex flex-col gap-2 px-4 py-3 border-b border-[#1E1E1E] hover:bg-[#1A1A1A] cursor-pointer transition-colors ${isChild ? "pl-10" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {project.icon && <span className="text-base">{project.icon}</span>}
          <div className="min-w-0">
            <span className="text-sm text-[#E5E5E5] font-medium block truncate">{project.name}</span>
            {project.description && (
              <span className="text-[11px] text-[#555] block truncate">{project.description}</span>
            )}
          </div>
        </div>
        <span className="text-xs text-[#6B6B6B] w-20 text-center">{project.target || "—"}</span>
        <div className="w-24">
          <HealthBadge health={project.health || "on_track"} />
        </div>
        <span className="text-xs text-[#6B6B6B] w-16 text-center">{issueCount || 0} issues</span>
        <ChevronRight size={14} className="text-[#333] group-hover:text-[#6B6B6B] transition-colors" />
      </div>
      <div className="flex items-center gap-2 px-1">
        <div className="flex-1 h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4ADE80] to-[#22C55E] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-[#666] w-8 text-right">{progressPercent}%</span>
      </div>
    </div>
  );
}