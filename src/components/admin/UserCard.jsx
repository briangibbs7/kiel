import React from "react";
import { Clock, Circle } from "lucide-react";

export default function UserCard({ user, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { bg: "#1a3a2a", text: "#4ADE80" };
      case "inactive":
        return { bg: "#2a1a1a", text: "#999" };
      default:
        return { bg: "#1a1a2a", text: "#999" };
    }
  };

  const statusColor = getStatusColor(user.status);
  const isOnline = user.status === "active";

  return (
    <div
      onClick={onClick}
      className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg hover:border-[#252525] transition-colors cursor-pointer group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center text-sm font-bold text-white">
            {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          </div>
          <Circle
            size={12}
            fill={isOnline ? "#4ADE80" : "#999"}
            stroke={isOnline ? "#4ADE80" : "#999"}
            className="absolute bottom-0 right-0"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">
            {user.full_name || "Unnamed User"}
          </h3>
          <p className="text-xs text-[#999] truncate">{user.email}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
            >
              {user.status || "active"}
            </span>
            <span className="text-[10px] text-[#666] bg-[#0D0D0D] px-2 py-0.5 rounded">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {user.last_seen && (
        <div className="flex items-center gap-1 text-[10px] text-[#666]">
          <Clock size={12} />
          <span>{new Date(user.last_seen).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
}