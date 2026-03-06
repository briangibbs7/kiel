import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const LABELS = ["Bug", "Performance", "iOS", "Maps", "API", "Reliability", "UI", "Security"];

export default function CreateIssueModal({ open, onClose, onSubmit, projects }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    project_id: "",
    priority: "none",
    status: "backlog",
    labels: [],
    assignee: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
    setForm({ title: "", description: "", project_id: "", priority: "none", status: "backlog", labels: [], assignee: "" });
  };

  const toggleLabel = (label) => {
    setForm(prev => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...prev.labels, label]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-[#333] text-[#E5E5E5] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#E5E5E5]">New Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Issue title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-[#111] border-[#333] text-white placeholder:text-[#555] focus:border-[#5E6AD2]"
              autoFocus
            />
          </div>
          <div>
            <Textarea
              placeholder="Add description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-[#111] border-[#333] text-white placeholder:text-[#555] focus:border-[#5E6AD2] min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Project</Label>
              <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                <SelectTrigger className="bg-[#111] border-[#333] text-white">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {projects?.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-white focus:bg-[#252525] focus:text-white">
                      {p.prefix} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger className="bg-[#111] border-[#333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {["urgent", "high", "medium", "low", "none"].map(p => (
                    <SelectItem key={p} value={p} className="text-white focus:bg-[#252525] focus:text-white capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-[#111] border-[#333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {["backlog", "todo", "in_progress", "in_review", "done"].map(s => (
                    <SelectItem key={s} value={s} className="text-white focus:bg-[#252525] focus:text-white capitalize">
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Assignee</Label>
              <Input
                placeholder="Name or email"
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-[#6B6B6B] mb-1.5 block">Labels</Label>
            <div className="flex flex-wrap gap-1.5">
              {LABELS.map(label => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                    form.labels.includes(label)
                      ? "border-[#5E6AD2] bg-[#5E6AD2]/20 text-[#8B95E5]"
                      : "border-[#333] text-[#6B6B6B] hover:border-[#444]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onClose(false)} className="text-[#6B6B6B] hover:text-white hover:bg-[#252525]">
              Cancel
            </Button>
            <Button type="submit" className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white">
              Create Issue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}