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
import InitiativeCard from "../components/initiatives/InitiativeCard";
import { HealthBadge } from "../components/shared/StatusBadge";

export default function Initiatives() {
  const [activeView, setActiveView] = useState("feed");
  const [activeTab, setActiveTab] = useState("active");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", health: "on_track", target: "", lead: "", icon: "🚀" });
  const queryClient = useQueryClient();

  const { data: initiatives = [] } = useQuery({
    queryKey: ["initiatives"],
    queryFn: () => base44.entities.Initiative.list("-created_date")
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Initiative.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["initiatives"] });
      setShowCreate(false);
      setForm({ name: "", description: "", health: "on_track", target: "", lead: "", icon: "🚀" });
    }
  });

  const filtered = initiatives.filter((i) => {
    if (activeTab === "active") return i.status === "active";
    if (activeTab === "planned") return i.status === "planned";
    if (activeTab === "completed") return i.status === "completed";
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 py-2.5 border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tabs defaultValue="feed" onValueChange={setActiveView}>
            <TabsList className="bg-transparent h-8 p-0 gap-0">
              <TabsTrigger value="feed" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-[#6B6B6B] text-xs px-3 h-8 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-white">
                Initiatives
              </TabsTrigger>
              <TabsTrigger value="table" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-[#6B6B6B] text-xs px-3 h-8 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-white">
                Active
              </TabsTrigger>
              <TabsTrigger value="planned" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-[#6B6B6B] text-xs px-3 h-8 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-white">
                Planned
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-[#6B6B6B] text-xs px-3 h-8 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-white">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(true)} className="text-[#6B6B6B] hover:text-white transition-colors">
            <Plus size={16} className="text-slate-50 lucide lucide-plus" />
          </button>
          <button className="text-[#555] hover:text-white transition-colors">
            <Filter size={14} className="text-slate-50 lucide lucide-filter" />
          </button>
          <button className="text-[#555] hover:text-white transition-colors">
            <Settings2 size={14} className="text-slate-50 lucide lucide-settings2" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeView === "feed" ? (
        /* Feed view - like the Pulse/Initiatives feed */
        <div className="max-w-2xl mx-auto py-6">
            {filtered.length === 0 ?
          <div className="flex flex-col items-center justify-center py-20 text-[#555]">
                <p className="text-sm">No initiatives yet</p>
                <button onClick={() => setShowCreate(true)} className="text-xs text-[#5E6AD2] mt-2 hover:underline">
                  Create an initiative
                </button>
              </div> :

          <>
                <div className="px-5 mb-4">
                  <span className="text-xs text-[#555] font-medium">Today</span>
                </div>
                {filtered.map((initiative) =>
            <InitiativeCard key={initiative.id} initiative={initiative} />
            )}
              </>
          }
          </div>) : (

        /* Table view */
        <div>
            <div className="flex items-center gap-4 px-4 py-2 border-b border-[#1E1E1E] text-[10px] text-[#555] uppercase tracking-wider font-semibold">
              <span className="flex-1">Name</span>
              <span className="w-20 text-center">Target</span>
              <span className="w-24">Health</span>
              <span className="w-20 text-center">Projects</span>
              <span className="w-16 text-center">Lead</span>
            </div>
            {filtered.map((initiative) =>
          <div key={initiative.id} className="flex items-center gap-4 px-4 py-3 border-b border-[#1E1E1E] hover:bg-[#1A1A1A] cursor-pointer transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {initiative.icon && <span>{initiative.icon}</span>}
                  <span className="text-sm text-[#E5E5E5] truncate">{initiative.name}</span>
                </div>
                <span className="text-xs text-[#6B6B6B] w-20 text-center">{initiative.target || "—"}</span>
                <div className="w-24">
                  <HealthBadge health={initiative.health} />
                </div>
                <span className="text-xs text-[#6B6B6B] w-20 text-center">
                  {initiative.project_ids?.length || 0}
                </span>
                <span className="text-xs text-[#6B6B6B] w-16 text-center truncate">{initiative.lead || "—"}</span>
              </div>
          )}
          </div>)
        }
      </div>

      {/* Create Initiative Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] text-[#E5E5E5] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E5E5E5]">New Initiative</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {e.preventDefault();createMutation.mutate(form);}} className="space-y-4">
            <div>
              <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#111] border-[#333] text-white" placeholder="Initiative name" />
            </div>
            <div>
              <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#111] border-[#333] text-white min-h-[60px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Target</Label>
                <Input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className="bg-[#111] border-[#333] text-white" placeholder="2026, Q2 2026..." />
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
              <div>
                <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Lead</Label>
                <Input value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} className="bg-[#111] border-[#333] text-white" placeholder="Name" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="text-[#6B6B6B] hover:text-white hover:bg-[#252525]">Cancel</Button>
              <Button type="submit" className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>);

}