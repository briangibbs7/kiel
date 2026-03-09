import React, { useState } from "react";
import { Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJIS = [
  "👍", "❤️", "😂", "🔥", "😍", "🎉", "👏", "💯",
  "✨", "🙌", "😎", "🚀", "💬", "⚡", "🎯", "💡",
];

export default function EmojiPicker({ onEmojiSelect }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Add emoji"
          className="p-1.5 text-[#6B6B6B] hover:text-white hover:bg-[#252525] rounded transition-colors"
        >
          <Smile size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 bg-[#1A1A1A] border-[#333] p-2">
        <div className="grid grid-cols-4 gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onEmojiSelect(emoji)}
              className="text-xl hover:scale-125 transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}