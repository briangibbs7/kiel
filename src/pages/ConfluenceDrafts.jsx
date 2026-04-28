import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, Search, Trash2, Edit, Clock, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function ConfluenceDrafts() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["draft-pages"],
    queryFn: () => base44.entities.Page.filter({ status: "draft" }, "-updated_date", 50),
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => base44.entities.Space.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Page.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["draft-pages"] }),
  });

  const spaceMap = Object.fromEntries(spaces.map((s) => [s.id, s]));

  const filtered = pages.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full bg-[#0D0D0D] overflow-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#1E1E1E] flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Drafts</h1>
            <p className="text-sm text-[#999] mt-1">Pages you're still working on</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("ConfluenceSpaces"))}
            variant="outline"
            className="border-[#333] text-[#CCC]"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Browse Spaces
          </Button>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#666]" />
          <Input
            placeholder="Search drafts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1A1A1A] border-[#333] text-white placeholder-[#666]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-[#111] border border-[#1E1E1E] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-[#333]" />
            <p className="text-white font-semibold mb-1">No drafts found</p>
            <p className="text-sm text-[#666]">
              {search ? "Try a different search term" : "Pages saved as 'Draft' will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-w-4xl">
            {filtered.map((page) => {
              const space = spaceMap[page.space_id];
              return (
                <div
                  key={page.id}
                  className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4 hover:border-[#2A2A2A] transition-colors group flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: space?.color || "#5E6AD2" }}
                  >
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{page.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {space && (
                        <span className="text-xs text-[#5E6AD2]">{space.name}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-[#666]">
                        <Clock className="w-3 h-3" />
                        {format(new Date(page.updated_date), "MMM d, yyyy")}
                      </span>
                      {page.labels?.length > 0 && page.labels.map((label) => (
                        <span key={label} className="text-[10px] bg-[#252525] text-[#999] px-1.5 py-0.5 rounded">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(createPageUrl("ConfluenceSpace") + `?id=${page.space_id}`)}
                      className="p-1.5 text-[#666] hover:text-[#5E6AD2] transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirm("Delete this draft?") && deleteMutation.mutate(page.id)}
                      className="p-1.5 text-[#666] hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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