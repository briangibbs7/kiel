import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, Clock, Star, Folder, Grid, List } from "lucide-react";

export default function ConfluenceHome() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => base44.entities.Space.list(),
  });

  const { data: recentPages = [] } = useQuery({
    queryKey: ["recent-pages"],
    queryFn: async () => {
      const pages = await base44.entities.Page.list("-updated_date", 10);
      return pages;
    },
  });

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const filteredSpaces = spaces.filter((space) =>
    space.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#1E1E1E] flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Confluence</h1>
            <p className="text-sm text-[#999]">Welcome back, {user?.full_name || "User"}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(createPageUrl("ConfluenceSpaces"))}
              variant="outline"
              className="border-[#333] text-[#CCC]"
            >
              <Folder className="w-4 h-4 mr-2" />
              All Spaces
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("ConfluenceSpaces") + "?create=true")}
              className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Space
            </Button>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#666]" />
          <Input
            placeholder="Search spaces and pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1A1A1A] border-[#333] text-white placeholder-[#666]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-8">
          {/* Recent Pages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Pages
              </h2>
            </div>
            {recentPages.length === 0 ? (
              <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-[#666]" />
                <p className="text-[#999] mb-2">No recent pages</p>
                <p className="text-sm text-[#666]">Pages you've viewed will appear here</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {recentPages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => navigate(createPageUrl("ConfluencePage") + `?id=${page.id}`)}
                    className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4 hover:border-[#333] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-[#5E6AD2] mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white mb-1">{page.title}</h3>
                        <p className="text-xs text-[#666]">
                          Updated {new Date(page.updated_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Your Spaces */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Your Spaces
              </h2>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant={view === "grid" ? "default" : "ghost"}
                  onClick={() => setView("grid")}
                  className="w-8 h-8"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant={view === "list" ? "default" : "ghost"}
                  onClick={() => setView("list")}
                  className="w-8 h-8"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {filteredSpaces.length === 0 ? (
              <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-8 text-center">
                <Folder className="w-12 h-12 mx-auto mb-3 text-[#666]" />
                <p className="text-[#999] mb-2">No spaces yet</p>
                <p className="text-sm text-[#666] mb-4">Create a space to organize your team's knowledge</p>
                <Button
                  onClick={() => navigate(createPageUrl("ConfluenceSpaces") + "?create=true")}
                  className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Space
                </Button>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpaces.map((space) => (
                  <div
                    key={space.id}
                    onClick={() => navigate(createPageUrl("ConfluenceSpace") + `?id=${space.id}`)}
                    className="bg-[#111] border border-[#1E1E1E] rounded-lg p-5 hover:border-[#333] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center text-lg"
                        style={{ backgroundColor: space.color || "#5E6AD2" }}
                      >
                        {space.icon || "📁"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1">{space.name}</h3>
                        <p className="text-xs text-[#666]">{space.key}</p>
                      </div>
                    </div>
                    {space.description && (
                      <p className="text-sm text-[#999] line-clamp-2">{space.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSpaces.map((space) => (
                  <div
                    key={space.id}
                    onClick={() => navigate(createPageUrl("ConfluenceSpace") + `?id=${space.id}`)}
                    className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4 hover:border-[#333] transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: space.color || "#5E6AD2" }}
                    >
                      {space.icon || "📁"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{space.name}</h3>
                      <p className="text-xs text-[#666]">{space.key}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}