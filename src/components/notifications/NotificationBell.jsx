import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, X, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function NotificationBell() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () =>
    user?.email ?
    base44.entities.Notification.filter(
      { user_email: user.email, is_read: false },
      "-created_date",
      20
    ) :
    Promise.resolve([]),
    enabled: !!user?.email,
    refetchInterval: 5000
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) =>
    base44.entities.Notification.update(notificationId, {
      is_read: true,
      read_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) =>
    base44.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const unreadCount = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative text-[#555] hover:text-white transition-colors">
          <Bell size={16} className="text-slate-50 lucide lucide-bell" />
          {unreadCount > 0 &&
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          }
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1A1A1A] border-[#333] p-0 max-h-96 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[#333] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          {unreadCount > 0 &&
          <span className="text-xs text-[#999]">{unreadCount} new</span>
          }
        </div>

        {notifications.length === 0 ?
        <div className="flex flex-col items-center justify-center py-8 text-[#555]">
            <Bell size={24} className="mb-2" />
            <p className="text-xs">No notifications</p>
          </div> :

        <div className="overflow-y-auto flex-1">
            {notifications.map((notif) =>
          <div
            key={notif.id}
            className="px-4 py-3 border-b border-[#252525] hover:bg-[#111] transition-colors group">

                <div className="flex gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-[#999] mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                  onClick={() => markAsReadMutation.mutate(notif.id)}
                  className="p-1 text-[#555] hover:text-[#4ADE80]"
                  title="Mark as read">

                      <Check size={14} />
                    </button>
                    <button
                  onClick={() => deleteNotificationMutation.mutate(notif.id)}
                  className="p-1 text-[#555] hover:text-[#F87171]"
                  title="Delete">

                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
          )}
          </div>
        }
      </PopoverContent>
    </Popover>);

}