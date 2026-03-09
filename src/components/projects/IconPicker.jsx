import React from "react";

const ICON_OPTIONS = [
  "📁", "📋", "🚀", "⚙️", "📊", "💻", "🎯", "🔧",
  "📱", "🌐", "🎨", "📈", "🏆", "💡", "🔐", "📡",
  "🛠️", "🎭", "🌟", "⚡", "🎪", "🎬", "📚", "🧪"
];

export default function IconPicker({ value, onChange }) {
  return (
    <div>
      <label className="text-xs text-[#6B6B6B] mb-2 block">Icon</label>
      <div className="grid grid-cols-6 gap-2">
        {ICON_OPTIONS.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => onChange(icon)}
            className={`h-10 flex items-center justify-center text-2xl rounded border-2 transition-all ${
              value === icon
                ? "border-[#5E6AD2] bg-[#1E1E1E]"
                : "border-[#252525] bg-[#111] hover:border-[#333]"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}