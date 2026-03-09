import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Filter, Settings2, Bell, Check, AlertCircle, Clock, X } from "lucide-react";
import { IssueStatusIcon, PriorityIcon, LabelBadge } from "../components/shared/StatusBadge";
import IssueDetail from "../components/issues/IssueDetail";

export default function Inbox() {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  const { data: issues = [] } = useQuery({
    queryKey: ["inbox-issues"],
    queryFn: () => base44.entities.Issue.list("-created_date", 30)
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user?.email) return [];
      return base44.entities.Notification.filter({ user_email: user.email }, "-created_date", 50);
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", selectedIssue?.id],
    queryFn: () => base44.entities.Comment.filter({ issue_id: selectedIssue.id }),
    enabled: !!selectedIssue?.id
  });

  const markNotificationAsReadMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const getPrefix = (projectId) => {
    const p = projects.find((p) => p.id === projectId);
    return p?.prefix || "ISS";
  };

  const handleStatusChange = async (issueId, data) => {
    await base44.entities.Issue.update(issueId, data);
    setSelectedIssue((prev) => ({ ...prev, ...data }));
  };

  const handleAddComment = async (content) => {
    await base44.entities.Comment.create({
      issue_id: selectedIssue.id,
      content,
      author: "You"
    });
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <div className="h-full flex">
      {/* Sidebar tabs */}
      <div className="w-80 border-r border-[#1E1E1E] flex flex-col">
        <div className="px-5 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
          <h1 className="text-sm font-semibold text-white">Inbox</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-1.5 rounded transition-colors ${showNotifications ? "bg-[#252525] text-[#5E6AD2]" : "text-[#666] hover:text-white"}`}
              title="Toggle notifications"
            >
              <AlertCircle size={16} />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button className="text-[#555] hover:text-white transition-colors">
              <Settings2 size={14} />
            </button>
          </div>
        </div>

        {/* Notifications or Issues list */}
        <div className="flex-1 overflow-y-auto">
          {showNotifications ? (
            // Notifications view
            notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#555]">
                <Bell size={24} className="mb-3" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => setSelectedNotification(notif)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#1A1A1A] cursor-pointer transition-colors ${
                    selectedNotification?.id === notif.id ? "bg-[#1A1A1A]" : "hover:bg-[#141414]"
                  } ${!notif.is_read ? "bg-[#0D0D0D]" : ""}`}
                >
                  {notif.type === 'deadline' ? (
                    <Clock size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#E5E5E5] truncate font-medium">{notif.title}</span>
                      {!notif.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>}
                    </div>
                    <p className="text-[11px] text-[#555] mt-0.5 truncate">{notif.message}</p>
                  </div>
                </div>
              ))
            )
          ) : (
            // Issues view
            issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#555]">
                <Bell size={24} className="mb-3" />
                <p className="text-sm">No issues</p>
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
            )
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedIssue &&
      <div className="flex-1">
          <IssueDetail
          issue={selectedIssue}
          comments={comments}
          onClose={() => setSelectedIssue(null)}
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
          allIssues={issues}
          onUpdateIssue={async (issueId, data) => {
            await base44.entities.Issue.update(issueId, data);
            setSelectedIssue((prev) => ({ ...prev, ...data }));
            queryClient.invalidateQueries({ queryKey: ["inbox-issues"] });
          }} />

        </div>
      }
    </div>);

}