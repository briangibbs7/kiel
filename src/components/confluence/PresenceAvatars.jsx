import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const COLORS = [
  "#5E6AD2", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
];

function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default function PresenceAvatars({ users }) {
  if (!users || users.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1">
        <span className="text-xs text-[#666] mr-1">Also viewing:</span>
        <div className="flex -space-x-2">
          {users.slice(0, 6).map((u) => {
            const color = hashColor(u.user_email);
            const name = u.user_name || u.user_email;
            return (
              <Tooltip key={u.id}>
                <TooltipTrigger asChild>
                  <div
                    className="w-7 h-7 rounded-full border-2 border-[#0D0D0D] flex items-center justify-center text-[10px] font-bold text-white cursor-default select-none ring-1 ring-white/10"
                    style={{ backgroundColor: color }}
                  >
                    {initials(name)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#1A1A1A] border-[#333] text-white text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
                    {name}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
          {users.length > 6 && (
            <div className="w-7 h-7 rounded-full border-2 border-[#0D0D0D] bg-[#333] flex items-center justify-center text-[10px] text-[#CCC]">
              +{users.length - 6}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}