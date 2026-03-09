import React, { useState } from "react";
import { IssueStatusIcon, PriorityIcon, LabelBadge, HealthBadge } from "../shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Send, MessageSquare, Link2 } from "lucide-react";
import { format } from "date-fns";
import DependencyManager from "../shared/DependencyManager";
import DependencyViewer from "../shared/DependencyViewer";
import IssueAttachments from "./IssueAttachments";
import CommentThread from "../comments/CommentThread";

export default function IssueDetail({ issue, comments, onClose, onStatusChange, onAddComment, allIssues = [], onUpdateIssue }) {
  const [commentText, setCommentText] = useState("");
  const [showDeps, setShowDeps] = useState(false);

  const handleComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText("");
  };

  if (!issue) return null;

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#252525]">
        <span className="text-sm text-[#999]">{issue.title?.substring(0, 40)}</span>
        <button onClick={onClose} className="text-[#6B6B6B] hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <h1 className="text-xl font-semibold text-white">{issue.title}</h1>

        {issue.description && (
          <p className="text-sm text-[#999] leading-relaxed">{issue.description}</p>
        )}

        {/* Properties */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-[#6B6B6B] w-20">Status</span>
            <Select value={issue.status} onValueChange={(v) => onStatusChange(issue.id, { status: v })}>
              <SelectTrigger className="w-36 h-8 bg-transparent border-[#333] text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                {["backlog", "todo", "in_progress", "in_review", "done", "cancelled"].map(s => (
                  <SelectItem key={s} value={s} className="text-white focus:bg-[#252525] focus:text-white text-xs capitalize">
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#6B6B6B] w-20">Priority</span>
            <Select value={issue.priority || "none"} onValueChange={(v) => onStatusChange(issue.id, { priority: v })}>
              <SelectTrigger className="w-36 h-8 bg-transparent border-[#333] text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                {["urgent", "high", "medium", "low", "none"].map(p => (
                  <SelectItem key={p} value={p} className="text-white focus:bg-[#252525] focus:text-white text-xs capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {issue.labels?.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-[#6B6B6B] w-20">Labels</span>
              <div className="flex gap-1.5 flex-wrap">
                {issue.labels.map(l => <LabelBadge key={l} label={l} />)}
              </div>
            </div>
          )}
          {issue.assignee && (
            <div className="flex items-center gap-4">
              <span className="text-[#6B6B6B] w-20">Assignee</span>
              <span className="text-[#E5E5E5] text-xs">{issue.assignee}</span>
            </div>
          )}
          <div className="flex items-center gap-4 pt-2 border-t border-[#252525]">
            <button
              onClick={() => setShowDeps(true)}
              className="flex items-center gap-1.5 text-[#5E6AD2] hover:text-white text-xs font-medium transition-colors"
            >
              <Link2 size={13} />
              Manage Dependencies
            </button>
          </div>
        </div>

        {/* Dependencies viewer */}
        {(issue.depends_on_issue_ids?.length > 0 || issue.blocked_by_issue_ids?.length > 0) && (
          <div className="pt-4 border-t border-[#252525] space-y-3">
            {issue.blocked_by_issue_ids?.length > 0 && (
              <DependencyViewer
                dependencies={issue.blocked_by_issue_ids.map(id => ({
                  itemId: id,
                  type: "is blocked by"
                }))}
                items={allIssues}
              />
            )}
            {issue.depends_on_issue_ids?.length > 0 && (
              <DependencyViewer
                dependencies={issue.depends_on_issue_ids.map(id => ({
                  itemId: id,
                  type: "blocks"
                }))}
                items={allIssues}
              />
            )}
          </div>
        )}

        {/* Attachments */}
        <div className="pt-4 border-t border-[#252525]">
          <IssueAttachments issue={issue} />
        </div>

        {/* Comments */}
        <div className="pt-4 border-t border-[#252525]">
          <CommentThread issueId={issue.id} />
        </div>
      </div>

      <DependencyManager
        open={showDeps}
        onClose={() => setShowDeps(false)}
        type="issue"
        currentId={issue.id}
        availableItems={allIssues}
        currentDependencies={[
          ...(issue.depends_on_issue_ids || []).map(id => ({ itemId: id, type: "blocks" })),
          ...(issue.blocked_by_issue_ids || []).map(id => ({ itemId: id, type: "is blocked by" })),
        ]}
        onAddDependency={async (dep) => {
          const updated = { ...issue };
          if (dep.type === "blocks") {
            updated.depends_on_issue_ids = [...(updated.depends_on_issue_ids || []), dep.itemId];
          } else {
            updated.blocked_by_issue_ids = [...(updated.blocked_by_issue_ids || []), dep.itemId];
          }
          await onUpdateIssue?.(issue.id, dep.type === "blocks" 
            ? { depends_on_issue_ids: updated.depends_on_issue_ids }
            : { blocked_by_issue_ids: updated.blocked_by_issue_ids }
          );
        }}
        onRemoveDependency={async (depId) => {
          const updated = { ...issue };
          updated.depends_on_issue_ids = updated.depends_on_issue_ids?.filter(id => id !== depId);
          updated.blocked_by_issue_ids = updated.blocked_by_issue_ids?.filter(id => id !== depId);
          await onUpdateIssue?.(issue.id, {
            depends_on_issue_ids: updated.depends_on_issue_ids,
            blocked_by_issue_ids: updated.blocked_by_issue_ids,
          });
        }}
      />
    </div>
  );
}