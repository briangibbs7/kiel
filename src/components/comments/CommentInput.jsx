import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function CommentInput({ onSubmit, isLoading }) {
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
    setCursorPosition(e.target.selectionStart);

    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(" ");

      if (spaceIndex === -1) {
        // Still typing the mention
        const searchTerm = textAfterAt.toLowerCase();
        const filtered = users.filter(
          (u) =>
            u.email.toLowerCase().includes(searchTerm) ||
            u.full_name.toLowerCase().includes(searchTerm)
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleMentionSelect = (user) => {
    const lastAtIndex = content.lastIndexOf("@");
    const beforeAt = content.substring(0, lastAtIndex);
    const afterAt = content.substring(lastAtIndex);
    const spaceIndex = afterAt.indexOf(" ");

    let newContent;
    if (spaceIndex === -1) {
      newContent = beforeAt + "@" + user.email + " ";
    } else {
      newContent =
        beforeAt + "@" + user.email + " " + afterAt.substring(spaceIndex + 1);
    }

    setContent(newContent);
    setMentions([...mentions, user.email]);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit({
      content: content.trim(),
      author: currentUser?.email,
      author_name: currentUser?.full_name,
      mentioned_users: mentions,
    });

    setContent("");
    setMentions([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <Textarea
          value={content}
          onChange={handleChange}
          placeholder='Type your comment... Use @ to mention someone'
          className="bg-[#0D0D0D] border-[#252525] text-white placeholder-[#555] text-sm resize-none"
          rows={3}
          disabled={isLoading}
        />

        {/* Mention suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#1A1A1A] border border-[#333] rounded shadow-lg z-10 max-h-40 overflow-y-auto">
            {suggestions.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleMentionSelect(user)}
                className="w-full text-left px-3 py-2 hover:bg-[#252525] transition-colors text-sm text-white flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-[#5E6AD2] flex items-center justify-center text-[8px] font-bold text-white">
                  {user.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium">{user.full_name}</p>
                  <p className="text-[10px] text-[#999]">{user.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {mentions.map((mention) => (
            <span
              key={mention}
              className="text-xs bg-[#5E6AD2] text-white px-2 py-1 rounded"
            >
              @{mention.split("@")[0]}
              <button
                type="button"
                onClick={() =>
                  setMentions(mentions.filter((m) => m !== mention))
                }
                className="ml-1 text-[10px] opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isLoading}
          className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
        >
          <Send size={14} className="mr-1" />
          Comment
        </Button>
      </div>
    </form>
  );
}