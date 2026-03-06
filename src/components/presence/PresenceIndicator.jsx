import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function PresenceIndicator({ userEmail, size = 12 }) {
  const { data: presence } = useQuery({
    queryKey: ["presence", userEmail],
    queryFn: () =>
      base44.entities.Presence.filter({ user_email: userEmail }).then(
        (results) => results[0]
      ),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Subscribe to real-time presence updates
  useEffect(() => {
    const unsubscribe = base44.entities.Presence.subscribe((event) => {
      if (event.data?.user_email === userEmail && event.type === "update") {
        // Component will re-render with updated data from query
      }
    });

    return unsubscribe;
  }, [userEmail]);

  const statusColors = {
    online: "#4ADE80",
    idle: "#FACC15",
    offline: "#6B6B6B",
  };

  const status = presence?.status || "offline";
  const color = statusColors[status];

  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size * 1.5}px ${color}80`,
      }}
      title={status}
    />
  );
}