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
  const [form, setForm] = useState({ name: "", prefix: "", description: "", health: "planning", target_date: "", start_date: "", icon: "📁", lead: "" });
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
      setForm({ name: "", prefix: "", description: "", health: "planning", target_date: "", start_date: "", icon: "📁", lead: "" });
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
    <div className="h-full flex flex-col" style={{ backgroundColor: "var(--pm-bg)" }}>
      <div className="px-5 py-2.5 border-b flex items-center justify-between" style={{ borderColor: "var(--pm-border)" }}>
        <Tabs defaultValue="active" onValueChange={setActiveTab}>
          <TabsList className="bg-transparent h-8 p-0 gap-0">
            {["all", "active", "planned", "completed"].map((tab) =>
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs px-3 h-8 rounded-none data-[state=active]:border-b-2 capitalize"
              style={{ color: "var(--pm-text-muted)" }}>
                {tab}
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === "list" ? "timeline" : "list")} className="p-1 rounded transition-colors hover:opacity-80" style={{ color: "var(--pm-text-muted)" }}>
            <BarChart3 size={16} />
          </button>
          <button onClick={() => navigate(createPageUrl("Tasks") + "?create=true")} className="text-xs font-medium gap-1 flex items-center px-2 hover:opacity-80 transition-opacity" style={{ color: "var(--pm-text-muted)" }}>
            <Plus size={16} /> Task
          </button>
          <button onClick={() => setShowTemplateSelect(true)} className="hover:opacity-80 transition-opacity" style={{ color: "var(--pm-text-muted)" }}>
            <Plus size={16} />
          </button>
          {canDeleteProject && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:opacity-80 transition-opacity" style={{ color: "var(--pm-text-muted)" }}>
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
                <DropdownMenuItem className="text-[#F87171] focus:text-[#F87171]" onClick={() => navigate(createPageUrl("AdminPortal") + "#deleted-projects")}>
                  <Trash2 size={14} className="mr-2" /> Restore Deleted
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button className="hover:opacity-80 transition-opacity" style={{ color: "var(--pm-text-muted)" }}><Filter size={14} /></button>
          <button className="hover:opacity-80 transition-opacity" style={{ color: "var(--pm-text-muted)" }}><Settings2 size={14} /></button>
        </div>
      </div>

      {view === "list" ? (
        <>
          <div className="flex items-center gap-4 px-4 py-2 border-b text-[10px] uppercase tracking-wider font-semibold" style={{ borderColor: "var(--pm-border)", color: "var(--pm-text-muted)" }}>
            <span className="flex-1">Name</span>
            <span className="w-20 text-center">Target</span>
            <span className="w-24">Health</span>
            <span className="w-16 text-center">Issues</span>
            <span className="w-4" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full" style={{ color: "var(--pm-text-muted)" }}>
                <p className="text-sm">No projects found</p>
                <button onClick={() => setShowTemplateSelect(true)} className="text-xs text-[#5E6AD2] mt-2 hover:underline">Create a project</button>
              </div>
            ) : (
              filtered.map((project) => (
                <div key={project.id} className="flex items-center">
                  <ProjectRow project={project} issueCount={getIssueCount(project.id)} completedIssueCount={getCompletedIssueCount(project.id)} onClick={handleProjectClick} />
                  {canDeleteProject && (
                    <div className="w-12 flex justify-center pr-2">
                      <button onClick={() => setProjectToDelete(project)} className="p-1 hover:opacity-80 transition-opacity" style={{ color: "var(--pm-text-muted)" }} title="Delete project">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <ProjectTimeline projects={filtered} />
      )}

      {/* Template Selection Modal */}
      <Dialog open={showTemplateSelect} onOpenChange={setShowTemplateSelect}>
        <DialogContent className="max-w-2xl" style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--pm-text)" }}>Select a Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {BUILT_IN_TEMPLATES.map((template) => {
              const IconComponent = TEMPLATE_ICONS[template.category];
              return (
                <button
                  key={template.id}
                  onClick={() => { setSelectedTemplate(template); setShowTemplateSelect(false); setShowCreate(true); }}
                  className="p-4 border rounded-lg hover:border-[#5E6AD2] transition-colors text-left"
                  style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--pm-border)" }}>
                      <IconComponent size={20} className="text-[#5E6AD2]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm" style={{ color: "var(--pm-text)" }}>{template.name}</h4>
                      <p className="text-xs mt-1" style={{ color: "var(--pm-text-secondary)" }}>{template.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setShowTemplateSelect(false); setShowCreate(true); }} style={{ color: "var(--pm-text-muted)" }}>
              Skip & Create Blank
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "var(--pm-text)" }}>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: "var(--pm-text-secondary)" }}>
              "{projectToDelete?.name}" will be moved to trash. You can restore it from the Admin Portal within 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 pt-2">
            <AlertDialogCancel style={{ borderColor: "var(--pm-border-light)", color: "var(--pm-text-secondary)" }}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-[#F87171] hover:bg-[#FF7A7A] text-white" onClick={() => projectToDelete && deleteMutation.mutate(projectToDelete.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Project Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md" style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedTemplate && (
                <button onClick={() => { setShowCreate(false); setSelectedTemplate(null); setShowTemplateSelect(true); }} className="hover:opacity-80 transition-opacity" style={{ color: "var(--pm-text-muted)" }}>
                  <ChevronLeft size={20} />
                </button>
              )}
              <DialogTitle style={{ color: "var(--pm-text)" }}>
                {selectedTemplate ? `New ${selectedTemplate.name} Project` : "New Project"}
              </DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (form.name && form.prefix) createMutation.mutate(form); }} className="space-y-4">
            {!selectedTemplate && (
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Template</Label>
                <Select value={selectedTemplate?.id || ""} onValueChange={(templateId) => setSelectedTemplate(BUILT_IN_TEMPLATES.find(t => t.id === templateId))}>
                  <SelectTrigger style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
                    {BUILT_IN_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }} placeholder="Project name" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Prefix</Label>
                <Input value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value.toUpperCase() })} style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }} placeholder="ENG" maxLength={5} />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }} className="min-h-[60px]" placeholder="Optional" />
            </div>
            <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Lead</Label>
                <Select value={form.lead} onValueChange={(v) => setForm({ ...form, lead: v })}>
                  <SelectTrigger style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
                    {users.map((u) => <SelectItem key={u.id} value={u.email}>{u.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Health</Label>
                <Select value={form.health} onValueChange={(v) => setForm({ ...form, health: v })}>
                  <SelectTrigger style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} style={{ color: "var(--pm-text-muted)" }}>Cancel</Button>
              <Button type="submit" className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>);

}