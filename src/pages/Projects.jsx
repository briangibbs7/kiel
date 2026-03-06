import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Filter, Settings2 } from "lucide-react";
import ProjectRow from "../components/projects/ProjectRow";
import { HealthBadge } from "../components/shared/StatusBadge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Projects() {
  const [activeTab, setActiveTab] = useState("active");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", prefix: "", description: "", health: "on_track", target_date: "", start_date: "", icon: "📁", lead: "" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["all-issues"],
    queryFn: () => base44.entities.Issue.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowCreate(false);
      setForm({ name: "", prefix: "", description: "", health: "on_track", target_date: "", start_date: "", icon: "📁", lead: "" });
    },
  });

  const filtered = projects.filter(p => {
    if (activeTab === "active") return p.status === "active";
    if (activeTab === "planned") return p.status === "planned";
    if (activeTab === "completed") return p.status === "completed";
    return true;
  });

  const getIssueCount = (projectId) => issues.filter(i => i.project_id === projectId).length;

  const handleProjectClick = (project) => {
    navigate(createPageUrl("ProjectDetail") + `?id=${project.id}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 py-2.5 border-b border-[#1E1E1E] flex items-center justify-between">
        <Tabs defaultValue="active" onValueChange={setActiveTab}>
          <TabsList className="bg-transparent h-8 p-0 gap-0">
            {["all", "active", "planned", "completed"].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-[#6B6B6B] text-xs px-3 h-8 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-white capitalize"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(true)} className="text-[#6B6B6B] hover:text-white transition-colors">
            <Plus size={16} />
          </button>
          <button className="text-[#555] hover:text-white transition-colors">
            <Filter size={14} />
          </button>
          <button className="text-[#555] hover:text-white transition-colors">
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {/* Table header */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-[#1E1E1E] text-[10px] text-[#555] uppercase tracking-wider font-semibold">
        <span className="flex-1">Name</span>
        <span className="w-20 text-center">Target</span>
        <span className="w-24">Health</span>
        <span className="w-16 text-center">Issues</span>
        <span className="w-4" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#555]">
            <p className="text-sm">No projects found</p>
            <button onClick={() => setShowCreate(true)} className="text-xs text-[#5E6AD2] mt-2 hover:underline">
              Create a project
            </button>
          </div>
        ) : (
          filtered.map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              issueCount={getIssueCount(project.id)}
              onClick={handleProjectClick}
            />
          ))
        )}
      </div>

      {/* Create Project Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] text-[#E5E5E5] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E5E5E5]">New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#111] border-[#333] text-white" placeholder="Project name" />
              </div>
              <div>
                <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Prefix</Label>
                <Input value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value.toUpperCase() })} className="bg-[#111] border-[#333] text-white" placeholder="ENG" maxLength={5} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#111] border-[#333] text-white min-h-[60px]" placeholder="Optional" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Lead</Label>
                <Input value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} className="bg-[#111] border-[#333] text-white" placeholder="Name" />
              </div>
              <div>
                <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Health</Label>
                <Select value={form.health} onValueChange={(v) => setForm({ ...form, health: v })}>
                  <SelectTrigger className="bg-[#111] border-[#333] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#333]">
                    <SelectItem value="on_track" className="text-white focus:bg-[#252525] focus:text-white">On track</SelectItem>
                    <SelectItem value="at_risk" className="text-white focus:bg-[#252525] focus:text-white">At risk</SelectItem>
                    <SelectItem value="off_track" className="text-white focus:bg-[#252525] focus:text-white">Off track</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="text-[#6B6B6B] hover:text-white hover:bg-[#252525]">Cancel</Button>
              <Button type="submit" className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}