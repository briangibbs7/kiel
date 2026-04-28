import { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";

const HEARTBEAT_INTERVAL = 15000; // 15s
const PRESENCE_TIMEOUT = 30000;   // 30s stale threshold

export function usePagePresence(pageId, user) {
  const [presenceUsers, setPresenceUsers] = useState([]);
  const heartbeatRef = useRef(null);
  const presenceIdRef = useRef(null);

  // Upsert our own presence record
  const upsertPresence = async () => {
    if (!pageId || !user) return;
    try {
      const now = new Date().toISOString();
      if (presenceIdRef.current) {
        await base44.entities.Presence.update(presenceIdRef.current, {
          last_seen_at: now,
        });
      } else {
        // Check if we already have a record (e.g. after reload)
        const existing = await base44.entities.Presence.filter({
          page_id: pageId,
          user_email: user.email,
        });
        if (existing.length > 0) {
          presenceIdRef.current = existing[0].id;
          await base44.entities.Presence.update(presenceIdRef.current, {
            last_seen_at: now,
          });
        } else {
          const record = await base44.entities.Presence.create({
            page_id: pageId,
            user_email: user.email,
            user_name: user.full_name || user.email,
            last_seen_at: now,
          });
          presenceIdRef.current = record.id;
        }
      }
    } catch (e) {
      // silently ignore
    }
  };

  // Remove our presence on unmount
  const removePresence = async () => {
    if (presenceIdRef.current) {
      try {
        await base44.entities.Presence.delete(presenceIdRef.current);
      } catch (e) {}
      presenceIdRef.current = null;
    }
  };

  // Fetch active presence for this page
  const fetchPresence = async () => {
    if (!pageId) return;
    try {
      const all = await base44.entities.Presence.filter({ page_id: pageId });
      const cutoff = Date.now() - PRESENCE_TIMEOUT;
      const active = all.filter((p) => {
        const t = new Date(p.last_seen_at || p.updated_date).getTime();
        return t > cutoff && p.user_email !== user?.email;
      });
      setPresenceUsers(active);
    } catch (e) {}
  };

  useEffect(() => {
    if (!pageId || !user) return;

    upsertPresence();
    fetchPresence();

    heartbeatRef.current = setInterval(() => {
      upsertPresence();
      fetchPresence();
    }, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(heartbeatRef.current);
      removePresence();
    };
  }, [pageId, user?.email]);

  return presenceUsers;
}