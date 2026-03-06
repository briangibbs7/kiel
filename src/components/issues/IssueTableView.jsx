import React, { useState } from "react";
import { IssueStatusIcon, PriorityIcon, LabelBadge } from "@/components/shared/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function IssueTableView({ issues, projects, selectedIssues, onSelectIssue, onIssueClick, columns, onSort, sortBy, sortOrder }) {
  const getPrefix = (projectId) => {
    const p = projects.find((p) => p.id === projectId);
    return p?.prefix || "ISS";
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      onSort(col, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(col, "asc");
    }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return null;
    return sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const columnConfig = {
    id: { label: "ID", width: "w-20" },
    title: { label: "Title", width: "flex-1" },
    status: { label: "Status", width: "w-24" },
    priority: { label: "Priority", width: "w-24" },
    assignee: { label: "Assignee", width: "w-24" },
    due_date: { label: "Due Date", width: "w-24" },
    labels: { label: "Labels", width: "w-32" }
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#1E1E1E]">
            <th className="w-8 px-3 py-2 text-left">
              <Checkbox
                checked={selectedIssues.length === issues.length && issues.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectIssue(issues.map((i) => i.id));
                  } else {
                    onSelectIssue([]);
                  }
                }} />

            </th>
            {columns.map((col) =>
            <th
              key={col}
              className={`${columnConfig[col]?.width} px-3 py-2 text-left text-xs font-medium text-[#999] cursor-pointer hover:text-[#CCC]`}
              onClick={() => handleSort(col)}>

                <div className="flex items-center gap-1">
                  {columnConfig[col]?.label}
                  <SortIcon col={col} />
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) =>
          <tr
            key={issue.id}
            className="border-b border-[#1A1A1A] hover:bg-[#111] cursor-pointer transition-colors"
            onClick={() => onIssueClick(issue)}>

              <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                checked={selectedIssues.includes(issue.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectIssue([...selectedIssues, issue.id]);
                  } else {
                    onSelectIssue(selectedIssues.filter((id) => id !== issue.id));
                  }
                }} className="bg-transparent text-slate-100 rounded-sm peer h-4 w-4 shrink-0 border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />

              </td>
              {columns.map((col) =>
            <td key={col} className={`${columnConfig[col]?.width} px-3 py-2 text-sm text-[#CCC]`}>
                  {col === "id" && <span className="font-mono text-[#999]">{getPrefix(issue.project_id)}-{issue.issue_number}</span>}
                  {col === "title" && <span className="truncate">{issue.title}</span>}
                  {col === "status" && <IssueStatusIcon status={issue.status} />}
                  {col === "priority" && <PriorityIcon priority={issue.priority} />}
                  {col === "assignee" && <span className="text-[#999]">{issue.assignee || "—"}</span>}
                  {col === "due_date" && <span className="text-[#999]">{issue.due_date || "—"}</span>}
                  {col === "labels" &&
              <div className="flex gap-1 flex-wrap">
                      {issue.labels?.slice(0, 2).map((label) =>
                <LabelBadge key={label} label={label} />
                )}
                      {issue.labels?.length > 2 && <span className="text-[10px] text-[#666]">+{issue.labels.length - 2}</span>}
                    </div>
              }
                </td>
            )}
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}