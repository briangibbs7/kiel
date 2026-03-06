import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import CommentInput from "./CommentInput";

export default function CommentThread({
  taskId,
  subtaskId,
  issueId,
}) {
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", { taskId, subtaskId, issueId }],
    queryFn: async () => {
      const query = {};
      if (taskId) query.task_id = taskId;
      if (subtaskId) query.subtask_id = subtaskId;
      if (issueId) query.issue_id = issueId;

      return base44.entities.Comment.filter(query, "created_date");
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        ...(taskId && { task_id: taskId }),
        ...(subtaskId && { subtask_id: subtaskId }),
        ...(issueId && { issue_id: issueId }),
      };
      return base44.functions.invoke("createComment", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", { taskId, subtaskId, issueId }],
      });
    },
  });

  // Subscribe to real-time comment updates
  useEffect(() => {
    const unsubscribe = base44.entities.Comment.subscribe((event) => {
      const isRelevant =
        (taskId && event.data?.task_id === taskId) ||
        (subtaskId && event.data?.subtask_id === subtaskId) ||
        (issueId && event.data?.issue_id === issueId);

      if (isRelevant && event.type === "create") {
        queryClient.invalidateQueries({
          queryKey: ["comments", { taskId, subtaskId, issueId }],
        });
      }
    });

    return unsubscribe;
  }, [taskId, subtaskId, issueId, queryClient]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-[#999] uppercase tracking-wider">
          Comments ({comments.length})
        </h4>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-xs text-[#555] py-4">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 bg-[#0D0D0D] border border-[#1A1A1A] rounded"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#5E6AD2] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {comment.author_name?.[0]?.toUpperCase() ||
                      comment.author?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {comment.author_name || comment.author}
                    </p>
                    <p className="text-[10px] text-[#666]">
                      {format(new Date(comment.created_date), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#CCC] break-words">
                {comment.content}
              </p>

              {comment.mentioned_users && comment.mentioned_users.length > 0 && (
                <div className="mt-2 text-[10px] text-[#999]">
                  Mentioned:{" "}
                  {comment.mentioned_users
                    .map((u) => u.split("@")[0])
                    .join(", ")}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Comment input */}
      <CommentInput
        onSubmit={(data) => createCommentMutation.mutate(data)}
        isLoading={createCommentMutation.isPending}
      />
    </div>
  );
}