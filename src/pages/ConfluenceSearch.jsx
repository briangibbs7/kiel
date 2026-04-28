import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, FileText, Folder, Filter, Clock, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function ConfluenceSearch() {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSpace, setFilterSpace] = useState("all");
  const navigate = useNavigate();

  const { data: pages = [] } = useQuery({
    queryKey: ["all-pages-search"],
    queryFn: () => base44.entities.Page.list("-updated_date", 200),
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => base44.entities.Space.list(),
  });

  const spaceMap = Object.fromEntries(spaces.map((s) => [s.id, s]));

  const filtered = pages.filter((p) => {
    const matchesQuery =
      !query ||
      p.title?.toLowerCase().includes(query.toLowerCase()) ||
      p.content?.toLowerCase().includes(query.toLowerCase()) ||
      p.labels?.some((l) => l.toLowerCase().includes(query.toLowerCase()));
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesSpace = filterSpace === "all" || p.space_id === filterSpace;
    return matchesQuery && matchesStatus && matchesSpace;
  });

  // Highlight matching text
  const highlight = (text, q) => {
    if (!q || !text) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text.substring(0, 120);
    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + q.length + 80);
    return (start > 0 ? "..." : "") + text.substring(start, end) + (end < text.length ? "..." : "");
  };

  const stripHtml = (html) => html?.replace(/<[^>]*>/g, "") || "";

  return (
    <div className="h-full bg-[#0D0D0D] overflow-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#1E1E1E] flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-4">Search</h1>
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-3 w-5 h-5 text-[#666]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, content, labels..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#1A1A1A] border border-[#333] rounded-lg text-white placeholder-[#555] outline-none focus:border-[#5E6AD2] text-base"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <Filter className="w-4 h-4 text-[#555]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1A1A1A] border border-[#333] text-white rounded px-2 py-1 text-xs"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filterSpace}
            onChange={(e) => setFilterSpace(e.target.value)}
            className="bg-[#1A1A1A] border border-[#333] text-white rounded px-2 py-1 text-xs"
          >
            <option value="all">All Spaces</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {(filterStatus !== "all" || filterSpace !== "all" || query) && (
            <button
              onClick={() => { setQuery(""); setFilterStatus("all"); setFilterSpace("all"); }}
              className="text-xs text-[#5E6AD2] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 p-6 max-w-4xl">
        {query && (
          <p className="text-xs text-[#666] mb-4">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"</p>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 mb-3 text-[#333]" />
            {query ? (
              <>
                <p className="text-white font-semibold mb-1">No results found</p>
                <p className="text-sm text-[#666]">Try different keywords or remove filters</p>
              </>
            ) : (
              <p className="text-sm text-[#666]">Start typing to search across all pages</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((page) => {
              const space = spaceMap[page.space_id];
              const plainContent = stripHtml(page.content);
              return (
                <div
                  key={page.id}
                  onClick={() => navigate(createPageUrl("ConfluenceSpace") + `?id=${page.space_id}`)}
                  className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4 hover:border-[#2A2A2A] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#5E6AD2] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-white">{page.title}</h3>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          page.status === "published" ? "bg-green-900/40 text-green-400" :
                          page.status === "archived" ? "bg-[#252525] text-[#666]" :
                          "bg-yellow-900/40 text-yellow-400"
                        }`}>
                          {page.status}
                        </span>
                      </div>
                      {plainContent && (
                        <p className="text-xs text-[#999] mb-2 line-clamp-2">
                          {highlight(plainContent, query)}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        {space && (
                          <span className="flex items-center gap-1 text-xs text-[#5E6AD2]">
                            <Folder className="w-3 h-3" />
                            {space.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-[#555]">
                          <Clock className="w-3 h-3" />
                          {format(new Date(page.updated_date), "MMM d, yyyy")}
                        </span>
                        {page.labels?.map((label) => (
                          <span key={label} className="flex items-center gap-1 text-[10px] bg-[#252525] text-[#999] px-1.5 py-0.5 rounded">
                            <Tag className="w-2.5 h-2.5" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}