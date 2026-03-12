import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, ChevronRight, Settings, MoreVertical, Star, Edit, Trash } from "lucide-react";
import PageEditor from "@/components/confluence/PageEditor";
import { format } from "date-fns";

export default function ConfluenceSpace() {
  const [selectedPage, setSelectedPage] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const params = new URLSearchParams(window.location.search);
  const spaceId = params.get("id");

  const { data: space } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: async () => {
      const spaces = await base44.entities.Space.list();
      return spaces.find((s) => s.id === spaceId);
    },
    enabled: !!spaceId,
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["pages", spaceId],
    queryFn: () => base44.entities.Page.filter({ space_id: spaceId }),
    enabled: !!spaceId,
  });

  const deleteMutation = useMutation({
    mutationFn: (pageId) => base44.entities.Page.delete(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", spaceId] });
      setSelectedPage(null);
    },
  });

  const handlePageClick = (page) => {
    setSelectedPage(page);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedPage(null);
    setIsCreating(true);
  };

  const handlePageSaved = () => {
    setIsCreating(false);
    queryClient.invalidateQueries({ queryKey: ["pages", spaceId] });
  };

  const handleDeletePage = (pageId) => {
    if (confirm("Delete this page?")) {
      deleteMutation.mutate(pageId);
    }
  };

  if (!space) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0D0D0D]">
        <p className="text-[#666]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-[#0D0D0D]">
      {/* Sidebar - Page Tree */}
      <aside className="w-64 border-r border-[#1E1E1E] flex flex-col">
        <div className="p-4 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-10 h-10 rounded flex items-center justify-center text-xl"
              style={{ backgroundColor: space.color || "#5E6AD2" }}
            >
              {space.icon || "📁"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white truncate">{space.name}</h2>
              <p className="text-xs text-[#666]">{space.key}</p>
            </div>
          </div>
          <Button
            onClick={handleCreateNew}
            className="w-full bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Page
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {pages.length === 0 ? (
            <div className="text-center p-6 text-[#666] text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No pages yet
            </div>
          ) : (
            <div className="space-y-1">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors group ${
                    selectedPage?.id === page.id ? "bg-[#1E1E1E] text-white" : "text-[#999] hover:bg-[#161616] hover:text-white"
                  }`}
                  onClick={() => handlePageClick(page)}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">{page.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(page.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash className="w-3 h-3 text-[#666] hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {isCreating || selectedPage ? (
          <PageEditor
            page={selectedPage}
            spaceId={spaceId}
            onSave={handlePageSaved}
            onCancel={() => {
              setIsCreating(false);
              setSelectedPage(null);
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-[#333]" />
              <p className="text-[#666] mb-2">Select a page to view or edit</p>
              <Button onClick={handleCreateNew} variant="outline" className="border-[#333] text-[#999]">
                <Plus className="w-4 h-4 mr-2" />
                Create New Page
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}