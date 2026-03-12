import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Folder, Archive, Settings } from "lucide-react";

export default function ConfluenceSpaces() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    key: "",
    description: "",
    type: "team",
    icon: "📁",
    color: "#5E6AD2",
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "true") {
      setCreateOpen(true);
    }
  }, []);

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => base44.entities.Space.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Space.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      setCreateOpen(false);
      setForm({ name: "", key: "", description: "", type: "team", icon: "📁", color: "#5E6AD2" });
    },
  });

  const filteredSpaces = spaces.filter((space) =>
    space.name?.toLowerCase().includes(search.toLowerCase()) ||
    space.key?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D] overflow-hidden">
      <div className="p-6 border-b border-[#1E1E1E] flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Spaces</h1>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Space
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#666]" />
          <Input
            placeholder="Search spaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1A1A1A] border-[#333] text-white placeholder-[#666]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpaces.map((space) => (
            <div
              key={space.id}
              className="bg-[#111] border border-[#1E1E1E] rounded-lg p-5 hover:border-[#333] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded flex items-center justify-center text-2xl cursor-pointer"
                  style={{ backgroundColor: space.color || "#5E6AD2" }}
                  onClick={() => navigate(createPageUrl("ConfluenceSpace") + `?id=${space.id}`)}
                >
                  {space.icon || "📁"}
                </div>
                <Button size="icon" variant="ghost" className="w-8 h-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              <h3
                className="font-semibold text-white mb-1 cursor-pointer hover:text-[#5E6AD2]"
                onClick={() => navigate(createPageUrl("ConfluenceSpace") + `?id=${space.id}`)}
              >
                {space.name}
              </h3>
              <p className="text-xs text-[#666] mb-3">{space.key}</p>
              {space.description && (
                <p className="text-sm text-[#999] line-clamp-2 mb-3">{space.description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-[#666]">
                <Folder className="w-3 h-3" />
                <span>{space.type}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredSpaces.length === 0 && (
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-8 text-center">
            <Folder className="w-12 h-12 mx-auto mb-3 text-[#666]" />
            <p className="text-[#999] mb-2">No spaces found</p>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create Space</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-[#CCC] block mb-2">Space Name *</label>
              <Input
                placeholder="Engineering, Marketing, etc."
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value, key: e.target.value.toUpperCase().replace(/\s+/g, '') });
                }}
                className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666]"
                required
              />
            </div>

            <div>
              <label className="text-sm text-[#CCC] block mb-2">Space Key *</label>
              <Input
                placeholder="ENG, MKT, etc."
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase() })}
                className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666]"
                required
              />
            </div>

            <div>
              <label className="text-sm text-[#CCC] block mb-2">Description</label>
              <Textarea
                placeholder="What's this space for?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666] h-20"
              />
            </div>

            <div>
              <label className="text-sm text-[#CCC] block mb-2">Type</label>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="knowledge_base">Knowledge Base</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#CCC] block mb-2">Icon</label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="bg-[#0D0D0D] border-[#333] text-white"
                />
              </div>
              <div>
                <label className="text-sm text-[#CCC] block mb-2">Color</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full h-10 rounded border border-[#333] bg-[#0D0D0D]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-[#333] text-[#CCC]"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white">
                {createMutation.isPending ? "Creating..." : "Create Space"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}