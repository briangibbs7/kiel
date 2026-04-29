import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Filter, Settings2, BarChart3, ChevronLeft, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProjectRow from "../components/projects/ProjectRow";
import ProjectTimeline from "../components/projects/ProjectTimeline";
import { HealthBadge } from "../components/shared/StatusBadge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProjectTemplates, { TEMPLATE_ICONS, BUILT_IN_TEMPLATES } from "./ProjectTemplates";
import IconPicker from "../components/projects/IconPicker";

export default function Projects() {
  const [activeTab, setActiveTab] = useState("active");
  const [view, setView] = useState("list");
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplateSelect, setShowTemplateSelect] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState({ name: "", prefix: "", description: "", status: "active", health: "on_track", target_date: "", start_date: "", icon: "📁", lead: "" });
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "true") {
      setShowTemplateSelect(true);
    }
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date")
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["all-issues"],
    queryFn: () => base44.entities.Issue.list("-created_date", 200)
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowCreate(false);
      setShowTemplateSelect(false);
      setSelectedTemplate(null);
      setForm({ name: "", prefix: "", description: "", status: "active", health: "on_track", target_date: "", start_date: "", icon: "📁", lead: "" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId) => 
      base44.entities.Project.update(projectId, { 
        deleted_at: new Date().toISOString() 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setProjectToDelete(null);
    }
  });

  const canDeleteProject = user?.role === "admin";

  const filtered = projects.filter((p) => {
    if (p.deleted_at) return false;
    if (activeTab === "active") return p.status === "active";
    if (activeTab === "planned") return p.status === "planned";
    if (activeTab === "completed") return p.status === "completed";
    return true;
  });

  const getIssueCount = (projectId) => issues.filter((i) => i.project_id === projectId).length;
  const getCompletedIssueCount = (projectId) => issues.filter((i) => i.project_id === projectId && i.status === "done").length;

  const handleProjectClick = (project) => {
    navigate(createPageUrl("ProjectDetail") + `?id=${project.id}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 py-2.5 border-b border-[#1E1E1E] flex items-center justify-between">
        <Tabs defaultValue="active" onValueChange={setActiveTab}>
          <TabsList className="bg-transparent h-8 p-0 gap-0">
            {["all", "active", "planned", "completed"].map((tab) =>
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-[#6B6B6B] text-xs px-3 h-8 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-white capitalize">

                {tab}
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === "list" ? "timeline" : "list")}
            className={`p-1 rounded transition-colors ${
            view === "timeline" ? "text-white bg-[#252525]" : "text-[#6B6B6B] hover:text-white"}`
            }
            title={view === "list" ? "Switch to timeline" : "Switch to list"}>

            <BarChart3 size={16} className="text-slate-50 lucide lucide-chart-column" />
          </button>
          <button 
            onClick={() => navigate(createPageUrl("Tasks") + "?create=true")}
            className="text-[#6B6B6B] hover:text-white transition-colors text-xs font-medium gap-1 flex items-center px-2">
            <Plus size={16} className="text-slate-50 lucide lucide-plus" />
            Task
          </button>
          <button onClick={() => setShowTemplateSelect(true)} className="text-[#6B6B6B] hover:text-white transition-colors">
            <Plus size={16} className="text-slate-50 lucide lucide-plus" />
          </button>
          {canDeleteProject && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[#555] hover:text-white transition-colors">
                  <MoreHorizontal size={16} className="text-slate-50 lucide lucide-more-horizontal" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1A1A1A] border-[#333]">
                <DropdownMenuItem 
                  className="text-[#F87171] focus:text-[#F87171] focus:bg-[#252525]"
                  onClick={() => navigate(createPageUrl("AdminPortal") + "#deleted-projects")}
                >
                  <Trash2 size={14} className="mr-2" />
                  Restore Deleted
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button className="text-[#555] hover:text-white transition-colors">
            <Filter size={14} className="text-slate-50 lucide lucide-filter" />
          </button>
          <button className="text-[#555] hover:text-white transition-colors">
            <Settings2 size={14} className="text-slate-50 lucide lucide-settings2" />
          </button>
        </div>
      </div>

      {view === "list" ?
        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#555]">
              <p className="text-sm">No projects found</p>
              <button onClick={() => setShowTemplateSelect(true)} className="text-xs text-[#5E6AD2] mt-2 hover:underline">
                Create a project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((project) => {
                const issueCount = getIssueCount(project.id);
                const completedCount = getCompletedIssueCount(project.id);
                const progress = issueCount > 0 ? Math.round((completedCount / issueCount) * 100) : 0;
                const healthColors = {
                  on_track: { dot: "bg-[#4ADE80]", text: "text-[#4ADE80]", label: "On Track" },
                  at_risk:  { dot: "bg-[#FACC15]", text: "text-[#FACC15]", label: "At Risk"  },
                  off_track:{ dot: "bg-[#F87171]", text: "text-[#F87171]", label: "Off Track" },
                };
                const health = healthColors[project.health] || healthColors.on_track;
                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="group relative bg-[#111] border border-[#1E1E1E] rounded-xl p-5 cursor-pointer hover:border-[#5E6AD2] transition-all hover:shadow-lg hover:shadow-[#5E6AD2]/5 flex flex-col gap-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {project.icon && <span className="text-2xl flex-shrink-0">{project.icon}</span>}
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#5E6AD2] transition-colors">
                            {project.name}
                          </h3>
                          {project.prefix && (
                            <span className="text-[10px] text-[#555] font-mono">{project.prefix}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
                        <span className={`text-[10px] font-medium ${health.text}`}>{health.label}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-xs text-[#666] line-clamp-2 leading-relaxed">{project.description}</p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-xs text-[#666]">
                      <span>{issueCount} issue{issueCount !== 1 ? "s" : ""}</span>
                      <span className="w-px h-3 bg-[#252525]" />
                      <span>{completedCount} done</span>
                      {project.lead && (
                        <>
                          <span className="w-px h-3 bg-[#252525]" />
                          <span className="truncate">{project.lead.split("@")[0]}</span>
                        </>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#555]">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#5E6AD2] to-[#7C3AED] transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Target date */}
                    {project.target_date && (
                      <div className="text-[10px] text-[#555]">
                        Target: <span className="text-[#888]">{new Date(project.target_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    )}

                    {/* Delete */}
                    {canDeleteProject && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setProjectToDelete(project); }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[#444] hover:text-[#F87171] transition-all p-1"
                        title="Delete project"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      :
        <ProjectTimeline projects={filtered} />
      }

      {/* Template Selection Modal */}
      <Dialog open={showTemplateSelect} onOpenChange={setShowTemplateSelect}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] text-[#E5E5E5] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#E5E5E5]">Select a Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {BUILT_IN_TEMPLATES.map((template) => {
              const IconComponent = TEMPLATE_ICONS[template.category];
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowTemplateSelect(false);
                    setShowCreate(true);
                  }}
                  className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg hover:border-[#5E6AD2] transition-colors text-left">

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-[#1E1E1E] flex items-center justify-center flex-shrink-0">
                      <IconComponent size={20} className="text-[#5E6AD2]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{template.name}</h4>
                      <p className="text-xs text-[#999] mt-1">{template.description}</p>
                    </div>
                  </div>
                </button>);

            })}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowTemplateSelect(false);
                setShowCreate(true);
              }}
              className="text-[#6B6B6B] hover:text-white hover:bg-[#252525]">

              Skip & Create Blank
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent className="bg-[#1A1A1A] border-[#333] text-[#E5E5E5]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#999]">
              "{projectToDelete?.name}" will be moved to trash. You can restore it from the Admin Portal within 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 pt-2">
            <AlertDialogCancel className="border-[#333] text-[#CCC] hover:bg-[#252525]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#F87171] hover:bg-[#FF7A7A] text-white"
              onClick={() => projectToDelete && deleteMutation.mutate(projectToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Project Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] text-[#E5E5E5] max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedTemplate &&
              <button
                onClick={() => {
                  setShowCreate(false);
                  setSelectedTemplate(null);
                  setShowTemplateSelect(true);
                }}
                className="text-[#6B6B6B] hover:text-white transition-colors">

                  <ChevronLeft size={20} />
                </button>
              }
              <DialogTitle className="text-[#E5E5E5]">
                {selectedTemplate ? `New ${selectedTemplate.name} Project` : "New Project"}
              </DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={(e) => {e.preventDefault();if (form.name && form.prefix) createMutation.mutate(form);}} className="space-y-4">
            {!selectedTemplate && (
              <div>
                <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Template</Label>
                <Select value={selectedTemplate?.id || ""} onValueChange={(templateId) => setSelectedTemplate(BUILT_IN_TEMPLATES.find(t => t.id === templateId))}>
                  <SelectTrigger className="bg-[#111] border-[#333] text-white">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#333]">
                    {BUILT_IN_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id} className="text-white focus:bg-[#252525] focus:text-white">
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
            <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
            <div className="grid grid-cols-2 gap-3">
               <div>
                 <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Lead</Label>
                 <Select value={form.lead} onValueChange={(v) => setForm({ ...form, lead: v })}>
                   <SelectTrigger className="bg-[#111] border-[#333] text-white">
                     <SelectValue placeholder="Select lead" />
                   </SelectTrigger>
                   <SelectContent className="bg-[#1A1A1A] border-[#333]">
                     {users.map((user) => (
                       <SelectItem key={user.id} value={user.email} className="text-white focus:bg-[#252525] focus:text-white">
                         {user.full_name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Health</Label>
                 <Select value={form.health} onValueChange={(v) => setForm({ ...form, health: v })}>
                   <SelectTrigger className="bg-[#111] border-[#333] text-white">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-[#1A1A1A] border-[#333]">
                     <SelectItem value="on_track" className="text-white focus:bg-[#252525] focus:text-white">On Track</SelectItem>
                     <SelectItem value="at_risk" className="text-white focus:bg-[#252525] focus:text-white">At Risk</SelectItem>
                     <SelectItem value="off_track" className="text-white focus:bg-[#252525] focus:text-white">Off Track</SelectItem>
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
    </div>);

}