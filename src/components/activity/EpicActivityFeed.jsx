import React, { useMemo } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, MessageSquare, AlertCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  backlog: "bg-[#333] text-[#CCC]",
  todo: "bg-[#444] text-[#EEE]",
  in_progress: "bg-blue-900 text-blue-200",
  in_review: "bg-purple-900 text-purple-200",
  done: "bg-green-900 text-green-200",
};

export default function EpicActivityFeed({ epic, issues = [], tasks = [], comments = [] }) {
  const activities = useMemo(() => {
    const events = [];

    // Add issue creation/updates
    issues.forEach((issue) => {
      if (issue.created_date) {
        events.push({
          id: `issue-created-${issue.id}`,
          type: "issue_created",
          timestamp: new Date(issue.created_date),
          title: `Issue created: ${issue.title}`,
          description: issue.description || "",
          icon: Zap,
          color: "#60A5FA",
          entity: issue,
          entityType: "issue",
        });
      }

      if (issue.updated_date && new Date(issue.updated_date) !== new Date(issue.created_date)) {
        events.push({
          id: `issue-updated-${issue.id}`,
          type: "issue_updated",
          timestamp: new Date(issue.updated_date),
          title: `Issue updated: ${issue.title}`,
          status: issue.status,
          icon: Clock,
          color: "#60A5FA",
          entity: issue,
          entityType: "issue",
        });
      }
    });

    // Add task creation/updates
    tasks.forEach((task) => {
      if (task.created_date) {
        events.push({
          id: `task-created-${task.id}`,
          type: "task_created",
          timestamp: new Date(task.created_date),
          title: `Task created: ${task.title}`,
          description: task.description || "",
          storyPoints: task.story_points,
          icon: Zap,
          color: "#A78BFA",
          entity: task,
          entityType: "task",
        });
      }

      if (task.updated_date && new Date(task.updated_date) !== new Date(task.created_date)) {
        events.push({
          id: `task-updated-${task.id}`,
          type: "task_updated",
          timestamp: new Date(task.updated_date),
          title: `Task updated: ${task.title}`,
          status: task.status,
          icon: Clock,
          color: "#A78BFA",
          entity: task,
          entityType: "task",
        });
      }
    });

    // Add comments
    comments.forEach((comment) => {
      if (comment.created_date) {
        events.push({
          id: `comment-${comment.id}`,
          type: "comment",
          timestamp: new Date(comment.created_date),
          title: `${comment.author_name || comment.author} commented`,
          description: comment.content,
          icon: MessageSquare,
          color: "#4ADE80",
          entity: comment,
          entityType: "comment",
        });
      }
    });

    // Sort by timestamp descending (newest first)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [issues, tasks, comments]);

  if (activities.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-[#666]">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const IconComponent = activity.icon;
        return (
          <div key={activity.id} className="p-3 bg-[#0D0D0D] border border-[#252525] rounded">
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: activity.color + "20" }}
              >
                <IconComponent className="w-4 h-4" style={{ color: activity.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white text-sm">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-[#999] mt-1 line-clamp-2">{activity.description}</p>
                    )}
                    {activity.status && (
                      <div className="mt-2">
                        <Badge className={statusColors[activity.status] || statusColors.backlog}>
                          {activity.status}
                        </Badge>
                      </div>
                    )}
                    {activity.storyPoints && (
                      <Badge className="bg-[#5E6AD2] text-white text-xs mt-2">
                        {activity.storyPoints} story points
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#666] mt-2">
                  {format(activity.timestamp, "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}