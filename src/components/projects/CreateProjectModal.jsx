import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateProjectModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  users,
  templates,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    prefix: "",
    lead: "",
    icon: "📦",
    color: "#5E6AD2",
    status: "active",
  });

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        description: "",
        prefix: "",
        lead: "",
        icon: "📦",
        color: "#5E6AD2",
        status: "active",
      });
    }
  }, [open]);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.prefix.trim() || !form.lead) {
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111] border-[#333] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#999] block mb-1">
              Project Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Website Redesign"
              className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#555]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Prefix *
              </label>
              <Input
                value={form.prefix}
                onChange={(e) =>
                  setForm({ ...form, prefix: e.target.value.toUpperCase() })
                }
                placeholder="e.g., WEB"
                maxLength="3"
                className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#555] uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Icon
              </label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="📦"
                maxLength="2"
                className="bg-[#0D0D0D] border-[#333] text-white text-center text-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#999] block mb-1">
              Project Lead *
            </label>
            <Select value={form.lead} onValueChange={(value) => setForm({ ...form, lead: value })}>
              <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                <SelectValue placeholder="Select lead..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.email}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#999] block mb-1">
              Description
            </label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="What is this project about?"
              className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#555] h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <span className="text-xs text-[#666]">{form.color}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Status
              </label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#333] text-[#CCC]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading || !form.name.trim() || !form.prefix.trim() || !form.lead
            }
            className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
          >
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}