import React, { useState } from "react";
import { IssueStatusIcon, PriorityIcon, LabelBadge, HealthBadge } from "../shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function IssueDetail({ issue, comments, onClose, onStatusChange, onAddComment }) {
  const [commentText, setCommentText] = useState("");

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
        </div>

        {/* Activity */}
        <div className="pt-4 border-t border-[#252525]">
          <h3 className="text-sm font-medium text-[#999] mb-4">Activity</h3>
          <div className="space-y-3">
            {comments?.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center text-[10px] text-[#999] flex-shrink-0 mt-0.5">
                  {(c.author || c.created_by || "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#CCC]">{c.author || c.created_by}</span>
                    <span className="text-[10px] text-[#555]">
                      {c.created_date && format(new Date(c.created_date), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <p className="text-xs text-[#999] mt-1">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment input */}
      <div className="p-4 border-t border-[#252525]">
        <div className="flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555] min-h-[40px] text-sm resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleComment();
              }
            }}
          />
          <Button onClick={handleComment} size="icon" className="bg-[#5E6AD2] hover:bg-[#4F5ABF] flex-shrink-0">
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}