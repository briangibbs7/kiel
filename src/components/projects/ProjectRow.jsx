import React from "react";
import { HealthBadge } from "../shared/StatusBadge";
import { ChevronRight } from "lucide-react";

export default function ProjectRow({ project, issueCount, onClick, isChild }) {
  return (
    <div
      onClick={() => onClick?.(project)}
      className={`group flex items-center gap-4 px-4 py-3 border-b border-[#1E1E1E] hover:bg-[#1A1A1A] cursor-pointer transition-colors ${isChild ? "pl-10" : ""}`}
    >
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
  );
}