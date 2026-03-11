import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Rocket } from "lucide-react";

export default function CreateEpicModal({ projects = [] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    project_id: "",
    priority: "none",
    status: "backlog",
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data };
      if (!payload.project_id) delete payload.project_id;
      return base44.asServiceRole.entities.Epic.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-epics"] });
      setForm({ title: "", description: "", project_id: "", priority: "none", status: "backlog" });
      setOpen(false);
    },
    onError: (error) => {
      console.error("Epic creation error:", error);
      alert(`Failed to create epic: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Epic title is required");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-[#CCC] block mb-2">Title *</label>
            <Input
              placeholder="Epic title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666]"
              required
            />
          </div>

          <div>
            <label className="text-sm text-[#CCC] block mb-2">Description</label>
            <Textarea
              placeholder="Epic description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#666] h-24"
            />
          </div>

          <div>
            <label className="text-sm text-[#CCC] block mb-2">Project</label>
            <Select value={form.project_id} onValueChange={(value) => setForm({ ...form, project_id: value })}>
              <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                <SelectValue placeholder="Select project (optional)" />
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
            <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
              <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                <SelectValue />
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
              type="button"
              variant="outline"
              className="flex-1 border-[#333] text-[#CCC]"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating..." : "Create Epic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}