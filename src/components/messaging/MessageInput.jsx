import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MessageInput({ onSubmit, isLoading }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit(content.trim());
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="bg-[#111] border-[#252525] text-white placeholder-[#555]"
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!content.trim() || isLoading}
        className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
      >
        <Send size={16} />
      </Button>
    </form>
  );
}