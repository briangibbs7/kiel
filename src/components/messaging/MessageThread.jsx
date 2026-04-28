import React, { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCheck, Check } from "lucide-react";
import MessageInput from "./MessageInput";

export default function MessageThread({ currentUserEmail, otherUserEmail }) {
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", currentUserEmail, otherUserEmail],
    queryFn: async () => {
      const [sent, received] = await Promise.all([
        base44.entities.Message.filter({
          from_user: currentUserEmail,
          to_user: otherUserEmail,
        }),
        base44.entities.Message.filter({
          from_user: otherUserEmail,
          to_user: currentUserEmail,
        }),
      ]);

      const allMessages = [...sent, ...received].sort(
        (a, b) =>
          new Date(a.created_date).getTime() -
          new Date(b.created_date).getTime()
      );

      return allMessages;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content) =>
      base44.functions.invoke("sendMessage", {
        to_user: otherUserEmail,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", currentUserEmail, otherUserEmail],
      });
    },
  });

  // Mark messages as read
  useEffect(() => {
    const unreadMessages = messages.filter(
      (m) => m.from_user === otherUserEmail && !m.is_read
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg) => {
        base44.entities.Message.update(msg.id, {
          is_read: true,
          read_at: new Date().toISOString(),
        });
      });
    }
  }, [messages, otherUserEmail]);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      const isRelevant =
        (event.data?.from_user === otherUserEmail &&
          event.data?.to_user === currentUserEmail) ||
        (event.data?.from_user === currentUserEmail &&
          event.data?.to_user === otherUserEmail);

      if (isRelevant && event.type === "create") {
        queryClient.invalidateQueries({
          queryKey: ["messages", currentUserEmail, otherUserEmail],
        });
      }
    });

    return unsubscribe;
  }, [currentUserEmail, otherUserEmail, queryClient]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#555] text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.from_user === currentUserEmail;
            const isRead = isMine && msg.is_read;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${
                    isMine
                      ? "bg-[#5E6AD2] text-white rounded-br-sm"
                      : "bg-[#1E1E1E] text-[#CCC] rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                    <span className={`text-[10px] ${isMine ? "text-[#B0B8FF]" : "text-[#666]"}`}>
                      {format(new Date(msg.created_date), "HH:mm")}
                    </span>
                    {isMine && (
                      isRead ? (
                        <CheckCheck className="w-3 h-3 text-[#93C5FD]" title={`Read at ${msg.read_at ? format(new Date(msg.read_at), "HH:mm") : ""}`} />
                      ) : (
                        <Check className="w-3 h-3 text-[#7B86D4]" title="Sent" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#1E1E1E] p-4">
        <MessageInput
          onSubmit={(content) => sendMessageMutation.mutate(content)}
          isLoading={sendMessageMutation.isPending}
        />
      </div>
    </div>
  );
}