import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Search, FileText, Clock, Folder } from "lucide-react";
import { format } from "date-fns";

export default function ConfluenceRecent() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: pages = [] } = useQuery({
    queryKey: ["recent-pages"],
    queryFn: async () => {
      const allPages = await base44.entities.Page.list("-updated_date");
      return allPages.slice(0, 50);
    },
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => base44.entities.Space.list(),
  });

  const filteredPages = pages.filter((page) =>
    page.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getSpace = (spaceId) => spaces.find((s) => s.id === spaceId);

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D] overflow-hidden">
      <div className="p-6 border-b border-[#1E1E1E] flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#5E6AD2]" />
            <h1 className="text-2xl font-bold text-white">Recent Pages</h1>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#666]" />
          <Input
            placeholder="Search recent pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1A1A1A] border-[#333] text-white placeholder-[#666]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredPages.length === 0 ? (
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-[#666]" />
            <p className="text-[#999] mb-2">No recent pages</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPages.map((page) => {
              const space = getSpace(page.space_id);
              return (
                <div
                  key={page.id}
                  className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4 hover:border-[#333] transition-colors cursor-pointer"
                  onClick={() => navigate(createPageUrl("ConfluenceSpace") + `?id=${page.space_id}`)}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#5E6AD2] flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">{page.title}</h3>
                      {space && (
                        <div className="flex items-center gap-2 text-xs text-[#666] mb-2">
                          <Folder className="w-3 h-3" />
                          <span>{space.name}</span>
                          <span>•</span>
                          <span>{space.key}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-[#666]">
                        <span>Updated {format(new Date(page.updated_date), "MMM d, yyyy")}</span>
                        {page.status && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{page.status}</span>
                          </>
                        )}
                        {page.labels && page.labels.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex gap-1">
                              {page.labels.slice(0, 3).map((label, i) => (
                                <span key={i} className="px-2 py-0.5 bg-[#1A1A1A] rounded text-[#999]">
                                  {label}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
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