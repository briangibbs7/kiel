import React from "react";
import { formatDistanceToNow } from "date-fns";
import { FileText, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";

const actionIcons = {
  issue: FileText,
  task: CheckCircle2,
  comment: MessageSquare,
};

const actionColors = {
  created: "text-[#4ADE80]",
  updated: "text-[#60A5FA]",
  commented: "text-[#A78BFA]",
};

export default function ActivityItem({ activity }) {
  const IconComponent = actionIcons[activity.type];
  const actionColor = actionColors[activity.action];

  const getActivityLabel = () => {
    switch (activity.type) {
      case "issue":
        return activity.action === "created" ? "created issue" : "updated issue";
      case "task":
        return activity.action === "created" ? "created task" : "updated task";
      case "comment":
        return "commented";
      default:
        return "updated";
    }
  };

  const getActivityContent = () => {
    if (activity.type === "comment") {
      return activity.content;
    }
    return activity.title;
  };

  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
    addSuffix: true,
  });

  return (
    <div className="px-4 py-3 rounded-lg bg-[#161616] border border-[#252525] hover:border-[#333] transition-colors">
      <div className="flex items-start gap-3">
        <div className={`mt-1 flex-shrink-0 ${actionColor}`}>
          <IconComponent size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-[#E5E5E5]">
            <span className="text-[#999]">
              {activity.createdBy?.split("@")[0] || "User"}
            </span>
            {" "}
            <span className={`font-medium ${actionColor}`}>
              {getActivityLabel()}
            </span>
            {activity.project && (
              <>
                {" "}
                <span className="text-[#666]">in</span>{" "}
                <span className="text-[#CCC]">{activity.project.name}</span>
              </>
            )}
          </div>

          <p className="text-sm text-[#CCC] mt-1 truncate">
            {getActivityContent()}
          </p>

          <p className="text-xs text-[#666] mt-1">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}