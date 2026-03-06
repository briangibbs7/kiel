import React from "react";
import { HealthBadge } from "../shared/StatusBadge";
import { MoreHorizontal, MessageSquare } from "lucide-react";

export default function InitiativeCard({ initiative, onClick }) {
  return (
    <div
      onClick={() => onClick?.(initiative)}
      className="p-5 border-b border-[#1E1E1E] hover:bg-[#141414] cursor-pointer transition-colors group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">{initiative.name}</h3>
        <button className="opacity-0 group-hover:opacity-100 text-[#6B6B6B] hover:text-white transition-all">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <HealthBadge health={initiative.health || "on_track"} />
        {initiative.lead && (
          <span className="text-[11px] text-[#6B6B6B]">{initiative.lead}</span>
        )}
        {initiative.created_date && (
          <span className="text-[11px] text-[#555]">
            {new Date(initiative.created_date) > new Date(Date.now() - 86400000) ? "today" : "recently"}
          </span>
        )}
      </div>
      {initiative.description && (
        <p className="text-xs text-[#888] leading-relaxed mb-3">{initiative.description}</p>
      )}
      <div className="flex items-center gap-3 text-[#555]">
        <MessageSquare size={13} />
      </div>
    </div>
  );
}