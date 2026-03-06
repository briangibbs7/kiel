import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Filter, Settings2, Bell, Check } from "lucide-react";
import { IssueStatusIcon, PriorityIcon, LabelBadge } from "../components/shared/StatusBadge";
import IssueDetail from "../components/issues/IssueDetail";

export default function Inbox() {
  const [selectedIssue, setSelectedIssue] = useState(null);

  const { data: issues = [] } = useQuery({
    queryKey: ["inbox-issues"],
    queryFn: () => base44.entities.Issue.list("-created_date", 30),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", selectedIssue?.id],
    queryFn: () => base44.entities.Comment.filter({ issue_id: selectedIssue.id }),
    enabled: !!selectedIssue?.id,
  });

  const getPrefix = (projectId) => {
    const p = projects.find(p => p.id === projectId);
    return p?.prefix || "ISS";
  };

  const handleStatusChange = async (issueId, data) => {
    await base44.entities.Issue.update(issueId, data);
    setSelectedIssue(prev => ({ ...prev, ...data }));
  };

  const handleAddComment = async (content) => {
    await base44.entities.Comment.create({
      issue_id: selectedIssue.id,
      content,
      author: "You",
    });
  };

  return (
    <div className="h-full flex">
      {/* Issue list */}
      <div className={`${selectedIssue ? "w-96" : "flex-1"} border-r border-[#1E1E1E] flex flex-col`}>
        <div className="px-5 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-white">Inbox</h1>
          </div>
          <div className="flex items-center gap-2 text-[#555]">
            <Filter size={14} />
            <Settings2 size={14} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#555]">
              <Bell size={24} className="mb-3" />
              <p className="text-sm">No new notifications</p>
              <p className="text-xs text-[#444] mt-1">Issues assigned to you will appear here</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`flex items-start gap-3 px-4 py-3 border-b border-[#1A1A1A] cursor-pointer transition-colors ${
                  selectedIssue?.id === issue.id ? "bg-[#1A1A1A]" : "hover:bg-[#141414]"
                }`}
              >
                <IssueStatusIcon status={issue.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#555]">
                      {getPrefix(issue.project_id)}-{issue.issue_number || "?"}
                    </span>
                    <span className="text-[13px] text-[#E5E5E5] truncate">{issue.title}</span>
                  </div>
                  {issue.description && (
                    <p className="text-[11px] text-[#555] mt-0.5 truncate">{issue.description}</p>
                  )}
                </div>
                <span className="text-[10px] text-[#444] flex-shrink-0">
                  {issue.created_date && format(new Date(issue.created_date), "h'h'")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedIssue && (
        <div className="flex-1">
          <IssueDetail
            issue={selectedIssue}
            comments={comments}
            onClose={() => setSelectedIssue(null)}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
          />
        </div>
      )}
    </div>
  );
}