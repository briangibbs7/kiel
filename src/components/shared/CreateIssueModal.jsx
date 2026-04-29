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
      <DialogContent className="max-w-lg" style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--pm-text)" }}>New Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Issue title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}
              autoFocus
            />
          </div>
          <div>
            <Textarea
              placeholder="Add description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Project</Label>
              <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                <SelectTrigger style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
                  {projects?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.prefix} - {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
                  {["urgent", "high", "medium", "low", "none"].map(p => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
                  {["backlog", "todo", "in_progress", "in_review", "done"].map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Assignee</Label>
              <Input
                placeholder="Name or email"
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                style={{ backgroundColor: "var(--pm-input-bg)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block" style={{ color: "var(--pm-text-muted)" }}>Labels</Label>
            <div className="flex flex-wrap gap-1.5">
              {LABELS.map(label => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className="text-[11px] px-2 py-1 rounded border transition-colors"
                  style={form.labels.includes(label)
                    ? { borderColor: "#5E6AD2", backgroundColor: "rgba(94,106,210,0.15)", color: "#8B95E5" }
                    : { borderColor: "var(--pm-border-light)", color: "var(--pm-text-muted)" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onClose(false)} style={{ color: "var(--pm-text-muted)" }}>
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