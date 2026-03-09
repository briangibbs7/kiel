import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Search, X, ListTodo, BookOpen, MessageSquare, FileText } from "lucide-react";

const ENTITY_CONFIG = {
  Task:    { icon: ListTodo,      label: "Task",    color: "#FACC15" },
  Story:   { icon: BookOpen,      label: "Story",   color: "#60A5FA" },
  Issue:   { icon: FileText,      label: "Issue",   color: "#FB923C" },
  Comment: { icon: MessageSquare, label: "Comment", color: "#A78BFA" },
};

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => runSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const runSearch = async (q) => {
    setLoading(true);
    const lower = q.toLowerCase();

    const [tasks, stories, issues, comments] = await Promise.all([
      base44.entities.Task.list("-created_date", 200),
      base44.entities.Story.list("-created_date", 200),
      base44.entities.Issue.list("-created_date", 200),
      base44.entities.Comment.list("-created_date", 200),
    ]);

    const match = (str) => str?.toLowerCase().includes(lower);

    const found = [
      ...tasks.filter(t => match(t.title) || match(t.description) || match(t.assignee) || (t.priority && match(t.priority)))
        .map(t => ({ type: "Task", id: t.id, title: t.title, sub: t.assignee || t.status, page: "Tasks" })),
      ...stories.filter(s => match(s.title) || match(s.description) || match(s.assignee) || (s.labels || []).some(match))
        .map(s => ({ type: "Story", id: s.id, title: s.title, sub: s.assignee || s.status, page: "Backlog" })),
      ...issues.filter(i => match(i.title) || match(i.description) || match(i.assignee) || (i.labels || []).some(match))
        .map(i => ({ type: "Issue", id: i.id, title: i.title, sub: i.assignee || i.status, page: "MyIssues" })),
      ...comments.filter(c => match(c.content) || match(c.author_name) || match(c.author))
        .map(c => ({ type: "Comment", id: c.id, title: c.content?.slice(0, 80), sub: c.author_name || c.author, page: "Tasks" })),
    ].slice(0, 30);

    setResults(found);
    setLoading(false);
  };

  const handleSelect = (item) => {
    navigate(createPageUrl(item.page));
    onClose();
  };

  const grouped = results.reduce((acc, r) => {
    acc[r.type] = acc[r.type] || [];
    acc[r.type].push(r);
    return acc;
  }, {});

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#161616] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#252525]">
          <Search size={16} className="text-[#555] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, stories, issues, comments..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#555] outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#555] hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
          <kbd className="text-[10px] text-[#444] bg-[#1E1E1E] border border-[#333] px-1.5 py-0.5 rounded">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <p className="text-xs text-[#555] text-center py-6">Searching...</p>
          )}
          {!loading && query && results.length === 0 && (
            <p className="text-xs text-[#555] text-center py-6">No results for "{query}"</p>
          )}
          {!loading && !query && (
            <p className="text-xs text-[#444] text-center py-6">Start typing to search across all entities</p>
          )}
          {Object.entries(grouped).map(([type, items]) => {
            const cfg = ENTITY_CONFIG[type];
            const Icon = cfg.icon;
            return (
              <div key={type}>
                <div className="px-4 py-2 flex items-center gap-2 border-b border-[#1A1A1A]">
                  <Icon size={12} style={{ color: cfg.color }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
                    {cfg.label}s
                  </span>
                  <span className="text-[10px] text-[#444]">({items.length})</span>
                </div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#1E1E1E] transition-colors flex items-start gap-3"
                  >
                    <Icon size={13} className="mt-0.5 flex-shrink-0" style={{ color: cfg.color }} />
                    <div className="min-w-0">
                      <p className="text-sm text-[#DDD] truncate">{item.title}</p>
                      {item.sub && <p className="text-[11px] text-[#666] truncate">{item.sub}</p>}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}