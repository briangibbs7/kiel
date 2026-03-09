import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Loader, AlertCircle } from "lucide-react";
import ActivityItem from "./ActivityItem";

export default function ActivityFeed({ limit = 20 }) {
  const [activities, setActivities] = useState([]);

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ["issues", "recent"],
    queryFn: () =>
      base44.entities.Issue.list("-updated_date", limit * 2),
    initialData: [],
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", "recent"],
    queryFn: () =>
      base44.entities.Comment.list("-created_date", limit * 2),
    initialData: [],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "recent"],
    queryFn: () =>
      base44.entities.Task.list("-updated_date", limit * 2),
    initialData: [],
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  useEffect(() => {
    const projectMap = {};
    projects.forEach((p) => {
      projectMap[p.id] = p;
    });

    const combined = [];

    // Add issue activities
    issues.forEach((issue) => {
      combined.push({
        id: `issue-${issue.id}`,
        type: "issue",
        action: issue.created_date === issue.updated_date ? "created" : "updated",
        title: issue.title,
        entity: issue,
        project: projectMap[issue.project_id],
        timestamp: issue.updated_date || issue.created_date,
        createdBy: issue.created_by,
      });
    });

    // Add comment activities
    comments.forEach((comment) => {
      combined.push({
        id: `comment-${comment.id}`,
        type: "comment",
        action: "commented",
        content: comment.content,
        entity: comment,
        timestamp: comment.created_date,
        createdBy: comment.author || comment.created_by,
      });
    });

    // Add task activities
    tasks.forEach((task) => {
      combined.push({
        id: `task-${task.id}`,
        type: "task",
        action: task.created_date === task.updated_date ? "created" : "updated",
        title: task.title,
        entity: task,
        project: projectMap[task.project_id],
        timestamp: task.updated_date || task.created_date,
        createdBy: task.created_by,
      });
    });

    // Sort by timestamp (newest first) and limit
    combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setActivities(combined.slice(0, limit));
  }, [issues, comments, tasks, projects, limit]);

  const isLoading = issuesLoading || commentsLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-5 h-5 text-[#666] animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-8 h-8 text-[#555] mb-2" />
        <p className="text-sm text-[#666]">No recent activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}