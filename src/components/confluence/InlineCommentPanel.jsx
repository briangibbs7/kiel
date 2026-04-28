import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle2, X, Send, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";

function CommentThread({ comment, user, onResolve, pageId }) {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(true);

  const { data: replies = [] } = useQuery({
    queryKey: ["inline-replies", comment.id],
    queryFn: () => base44.entities.PageComment.filter({ parent_comment_id: comment.id }),
  });

  const replyMutation = useMutation({
    mutationFn: (content) =>
      base44.entities.PageComment.create({
        page_id: pageId,
        content,
        author: user?.email,
        author_name: user?.full_name || user?.email,
        parent_comment_id: comment.id,
      }),
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["inline-replies", comment.id] });
    },
  });

  return (
    <div className="border border-[#2A2A2A] rounded-lg overflow-hidden">
      {/* Thread header - quoted text */}
      {comment.inline_position?.text && (
        <div className="px-3 py-2 bg-[#1A1A1A] border-b border-[#2A2A2A]">
          <p className="text-xs text-[#5E6AD2] italic line-clamp-2">
            "{comment.inline_position.text}"
          </p>
        </div>
      )}

      {/* Root comment */}
      <div className="p-3 bg-[#161616]">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#5E6AD2] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
              {(comment.author_name || comment.author || "?")[0].toUpperCase()}
            </div>
            <span className="text-xs font-medium text-[#CCC]">{comment.author_name || comment.author}</span>
            <span className="text-[10px] text-[#555]">{format(new Date(comment.created_date), "MMM d, h:mm a")}</span>
          </div>
          <div className="flex items-center gap-1">
            {!comment.is_resolved && (
              <button
                onClick={() => onResolve(comment.id)}
                className="text-[#555] hover:text-green-400 transition-colors"
                title="Resolve"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
            {comment.is_resolved && (
              <span className="text-[10px] text-green-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Resolved
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-[#DDD] ml-7">{comment.content}</p>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="border-t border-[#2A2A2A]">
          <button
            onClick={() => setShowReplies((v) => !v)}
            className="w-full flex items-center gap-1 px-3 py-1.5 text-[11px] text-[#666] hover:text-[#999] transition-colors"
          >
            {showReplies ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>
          {showReplies && (
            <div className="divide-y divide-[#2A2A2A]">
              {replies.map((reply) => (
                <div key={reply.id} className="px-3 py-2 bg-[#111] ml-4 border-l-2 border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full bg-[#333] flex items-center justify-center text-[8px] font-bold text-white">
                      {(reply.author_name || reply.author || "?")[0].toUpperCase()}
                    </div>
                    <span className="text-[11px] font-medium text-[#BBB]">{reply.author_name || reply.author}</span>
                    <span className="text-[10px] text-[#555]">{format(new Date(reply.created_date), "MMM d, h:mm a")}</span>
                  </div>
                  <p className="text-xs text-[#CCC] ml-6">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reply input */}
      {!comment.is_resolved && (
        <div className="border-t border-[#2A2A2A] p-2 bg-[#111] flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && replyText.trim()) {
                e.preventDefault();
                replyMutation.mutate(replyText.trim());
              }
            }}
            placeholder="Reply..."
            className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-white placeholder-[#555] outline-none focus:border-[#5E6AD2]"
          />
          <button
            onClick={() => replyText.trim() && replyMutation.mutate(replyText.trim())}
            disabled={!replyText.trim() || replyMutation.isPending}
            className="text-[#5E6AD2] hover:text-[#7E8AFF] disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function InlineCommentPanel({ pageId, user, onClose }) {
  const queryClient = useQueryClient();
  const [showResolved, setShowResolved] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ["inline-comments", pageId],
    queryFn: () =>
      base44.entities.PageComment.filter({ page_id: pageId }),
    enabled: !!pageId,
    refetchInterval: 10000,
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => base44.entities.PageComment.update(id, { is_resolved: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inline-comments", pageId] }),
  });

  // Only top-level comments (no parent)
  const topLevel = comments.filter((c) => !c.parent_comment_id);
  const open = topLevel.filter((c) => !c.is_resolved);
  const resolved = topLevel.filter((c) => c.is_resolved);
  const displayed = showResolved ? [...open, ...resolved] : open;

  return (
    <div className="w-72 flex-shrink-0 border-l border-[#1E1E1E] bg-[#0D0D0D] flex flex-col">
      <div className="p-3 border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#5E6AD2]" />
          <span className="text-sm font-semibold text-white">Comments</span>
          {open.length > 0 && (
            <span className="text-[10px] bg-[#5E6AD2] text-white px-1.5 py-0.5 rounded-full">
              {open.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResolved((v) => !v)}
            className={`text-[10px] px-2 py-1 rounded border transition-colors ${
              showResolved ? "border-[#5E6AD2] text-[#5E6AD2]" : "border-[#333] text-[#666] hover:border-[#555] hover:text-[#999]"
            }`}
          >
            {showResolved ? "Hide resolved" : "Show resolved"}
          </button>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {displayed.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-[#333]" />
            <p className="text-xs text-[#555]">No comments yet.</p>
            <p className="text-xs text-[#444] mt-1">Highlight text in the editor to add one.</p>
          </div>
        ) : (
          displayed.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              user={user}
              onResolve={(id) => resolveMutation.mutate(id)}
              pageId={pageId}
            />
          ))
        )}
      </div>
    </div>
  );
}