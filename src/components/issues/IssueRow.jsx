import React from "react";
import { IssueStatusIcon, PriorityIcon, LabelBadge } from "../shared/StatusBadge";
import { format } from "date-fns";

export default function IssueRow({ issue, projectPrefix, onClick }) {
  const issueId = projectPrefix
    ? `${projectPrefix}-${issue.issue_number || "?"}`
    : `#${issue.issue_number || "?"}`;

  return (
    <div
      onClick={() => onClick?.(issue)}
      className="group flex items-center gap-3 px-4 py-2.5 border-b border-[#1E1E1E] hover:bg-[#1A1A1A] cursor-pointer transition-colors"
    >
      <PriorityIcon priority={issue.priority} />
      <span className="text-[#6B6B6B] text-xs font-mono w-20 flex-shrink-0">{issueId}</span>
      <IssueStatusIcon status={issue.status} />
      <span className="text-sm text-[#E5E5E5] flex-1 truncate">{issue.title}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        {issue.labels?.map(label => (
          <LabelBadge key={label} label={label} />
        ))}
        {issue.assignee && (
          <div className="w-5 h-5 rounded-full bg-[#333] flex items-center justify-center text-[10px] text-[#999]">
            {issue.assignee[0]?.toUpperCase()}
          </div>
        )}
        {issue.created_date && (
          <span className="text-[11px] text-[#555] ml-1">
            {format(new Date(issue.created_date), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}