import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Rocket, FolderPlus, Slack } from "lucide-react";
import SlackIntegrationSettings from "@/components/admin/SlackIntegrationSettings";

export default function AdminPortal() {
  const queryClient = useQueryClient();
  const [epicOpen, setEpicOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [epicForm, setEpicForm] = useState({
    title: "",
    description: "",
    project_id: "",
    priority: "none",
  });
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    prefix: "",
    status: "active",
    icon: "📋",
    color: "#5E6AD2",
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => base44.asServiceRole.entities.Project.list(),
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["all-epics"],
    queryFn: () => base44.asServiceRole.entities.Epic.list("-created_date", 100),
  });

  const createEpicMutation = useMutation({
    mutationFn: (data) => base44.asServiceRole.entities.Epic.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-epics"] });
      setEpicForm({ title: "", description: "", project_id: "", priority: "none" });
      setEpicOpen(false);
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data) => base44.asServiceRole.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-projects"] });
      setProjectForm({ name: "", description: "", prefix: "", status: "active", icon: "📋", color: "#5E6AD2" });
      setProjectOpen(false);
    },
  });

  const handleCreateEpic = () => {
    if (!epicForm.title.trim()) {
      alert("Epic title is required");
      return;
    }
    createEpicMutation.mutate(epicForm);
  };

  const handleCreateProject = () => {
    if (!projectForm.name.trim() || !projectForm.prefix.trim()) {
      alert("Project name and prefix are required");
      return;
    }
    createProjectMutation.mutate(projectForm);
  };

  return (
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
        <p className="text-sm text-[#999] mt-1">Create and manage epics and projects</p>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Slack Integration */}
        <div className="mb-8 bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Slack className="w-5 h-5 text-[#36C5F0]" />
            <h2 className="text-lg font-semibold text-white">Slack Integration</h2>
          </div>
          <SlackIntegrationSettings />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Epic Section */}
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-5 h-5 text-[#A78BFA]" />
              <h2 className="text-lg font-semibold text-white">Create Epic</h2>
            </div>
            <p className="text-sm text-[#999] mb-4">Organize work into large initiatives</p>

            <Dialog open={epicOpen} onOpenChange={setEpicOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Epic
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1A1A] border-[#333] max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Epic</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#CCC] block mb-2">Title *</label>
                    <Input
                      placeholder="Epic title"
                      value={epicForm.title}
                      onChange={(e) => setEpicForm({ ...epicForm, title: e.target.value })}
                      className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#CCC] block mb-2">Description</label>
                    <Textarea
                      placeholder="Epic description"
                      value={epicForm.description}
                      onChange={(e) => setEpicForm({ ...epicForm, description: e.target.value })}
                      className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666] h-24"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#CCC] block mb-2">Project</label>
                    <Select value={epicForm.project_id} onValueChange={(value) => setEpicForm({ ...epicForm, project_id: value })}>
                      <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#333]">
                        <SelectItem value={null}>No project</SelectItem>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-[#CCC] block mb-2">Priority</label>
                    <Select value={epicForm.priority} onValueChange={(value) => setEpicForm({ ...epicForm, priority: value })}>
                      <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#333]">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-[#333] text-[#CCC]"
                      onClick={() => setEpicOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-[#5E6AD2] hover:bg-[#6E7AE2]"
                      onClick={handleCreateEpic}
                      disabled={createEpicMutation.isPending}
                    >
                      {createEpicMutation.isPending ? "Creating..." : "Create Epic"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-[#CCC] mb-3">Recent Epics</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {epics.length === 0 ? (
                  <p className="text-xs text-[#555]">No epics yet</p>
                ) : (
                  epics.slice(0, 5).map((epic) => (
                    <div key={epic.id} className="p-2 bg-[#0D0D0D] border border-[#252525] rounded text-sm text-[#CCC]">
                      {epic.title}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Create Project Section */}
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderPlus className="w-5 h-5 text-[#60A5FA]" />
              <h2 className="text-lg font-semibold text-white">Create Project</h2>
            </div>
            <p className="text-sm text-[#999] mb-4">Start a new project workspace</p>

            <Dialog open={projectOpen} onOpenChange={setProjectOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-[#60A5FA] hover:bg-[#70B5FA] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1A1A] border-[#333] max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#CCC] block mb-2">Project Name *</label>
                    <Input
                      placeholder="Project name"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#CCC] block mb-2">Project Prefix *</label>
                    <Input
                      placeholder="e.g., ENG, MOB, SALES"
                      value={projectForm.prefix}
                      onChange={(e) => setProjectForm({ ...projectForm, prefix: e.target.value.toUpperCase() })}
                      maxLength="10"
                      className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#CCC] block mb-2">Description</label>
                    <Textarea
                      placeholder="Project description"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666] h-24"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-[#CCC] block mb-2">Icon</label>
                      <Input
                        placeholder="📋"
                        value={projectForm.icon}
                        onChange={(e) => setProjectForm({ ...projectForm, icon: e.target.value })}
                        maxLength="2"
                        className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666]"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#CCC] block mb-2">Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={projectForm.color}
                          onChange={(e) => setProjectForm({ ...projectForm, color: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <span className="text-xs text-[#666]">{projectForm.color}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-[#CCC] block mb-2">Status</label>
                    <Select value={projectForm.status} onValueChange={(value) => setProjectForm({ ...projectForm, status: value })}>
                      <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#333]">
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-[#333] text-[#CCC]"
                      onClick={() => setProjectOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-[#60A5FA] hover:bg-[#70B5FA]"
                      onClick={handleCreateProject}
                      disabled={createProjectMutation.isPending}
                    >
                      {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-[#CCC] mb-3">Recent Projects</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {projects.length === 0 ? (
                  <p className="text-xs text-[#555]">No projects yet</p>
                ) : (
                  projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="p-2 bg-[#0D0D0D] border border-[#252525] rounded text-sm text-[#CCC]">
                      {project.icon} {project.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}