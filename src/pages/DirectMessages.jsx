import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import MessageThread from "@/components/messaging/MessageThread";
import PresenceIndicator from "@/components/presence/PresenceIndicator";

export default function DirectMessages() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];

      const messages = await base44.entities.Message.filter(
        {},
        "-created_date",
        100
      );

      // Get unique conversation partners
      const partners = new Set();
      messages.forEach((msg) => {
        if (msg.from_user === currentUser.email) {
          partners.add(msg.to_user);
        } else if (msg.to_user === currentUser.email) {
          partners.add(msg.from_user);
        }
      });

      return Array.from(partners);
    },
  });

  // Update presence when component mounts
  useEffect(() => {
    if (!currentUser?.email) return;

    const updatePresence = async () => {
      const existingPresence = await base44.entities.Presence.filter({
        user_email: currentUser.email,
      });

      if (existingPresence.length > 0) {
        await base44.entities.Presence.update(existingPresence[0].id, {
          page_id: existingPresence[0].page_id || "messages",
          status: "online",
          last_seen_at: new Date().toISOString(),
        });
      } else {
        await base44.entities.Presence.create({
          user_email: currentUser.email,
          page_id: "messages",
          status: "online",
          last_seen_at: new Date().toISOString(),
        });
      }
    };

    updatePresence();

    // Update presence every 30 seconds
    const interval = setInterval(updatePresence, 30000);

    // Set offline when leaving
    return () => {
      clearInterval(interval);
      base44.entities.Presence.filter({
        user_email: currentUser.email,
      }).then((results) => {
        if (results.length > 0) {
          base44.entities.Presence.update(results[0].id, {
            status: "offline",
            last_seen_at: new Date().toISOString(),
          });
        }
      });
    };
  }, [currentUser?.email]);

  const filteredUsers = users.filter(
    (u) =>
      u.email !== currentUser?.email &&
      (u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayedUsers = searchTerm ? filteredUsers : users.filter((u) =>
    conversations.includes(u.email) && u.email !== currentUser?.email
  );

  return (
    <div className="h-full bg-[#0D0D0D] flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#1E1E1E] flex flex-col bg-[#0D0D0D]">
        <div className="p-4 border-b border-[#1E1E1E]">
          <h1 className="text-lg font-bold text-white mb-4">Messages</h1>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111] border-[#252525] text-white placeholder-[#555] pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {displayedUsers.length === 0 ? (
              <p className="text-xs text-[#555] p-4 text-center">
                {searchTerm ? "No users found" : "No conversations yet"}
              </p>
            ) : (
              displayedUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                    selectedUser?.id === user.id
                      ? "bg-[#1E1E1E] text-white"
                      : "text-[#999] hover:bg-[#111] hover:text-white"
                  }`}
                >
                  <PresenceIndicator userEmail={user.email} size={10} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-[#666] truncate">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          <div className="px-6 py-4 border-b border-[#1E1E1E] flex items-center gap-3">
            <PresenceIndicator userEmail={selectedUser.email} size={14} />
            <div>
              <h2 className="font-semibold text-white">{selectedUser.full_name}</h2>
              <p className="text-xs text-[#999]">{selectedUser.email}</p>
            </div>
          </div>
          <MessageThread
            currentUserEmail={currentUser?.email}
            otherUserEmail={selectedUser.email}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[#555]">
          <div className="text-center">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">Select a user to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}