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
import { X } from "lucide-react";

const roleOptions = ["site_admin", "organization_admin", "admin", "editor", "viewer", "user"];

export default function GroupModal({
  open,
  onOpenChange,
  group,
  projects,
  onSubmit,
  isLoading,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    roles: [],
    project_ids: [],
  });

  useEffect(() => {
    if (group) {
      setForm(group);
    } else {
      setForm({
        name: "",
        description: "",
        roles: [],
        project_ids: [],
      });
    }
  }, [group, open]);

  const handleSubmit = () => {
    if (!form.name.trim() || form.roles.length === 0) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111] border-[#333] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {group ? "Edit Group" : "Create Group"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#999] block mb-1">
              Group Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Engineering Team"
              className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#555]"
            />
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
              placeholder="What is this group for?"
              className="bg-[#0D0D0D] border-[#333] text-white placeholder-[#555] h-20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#999] block mb-2">
              Roles *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.roles.map((role) => (
                <div
                  key={role}
                  className="flex items-center gap-1 bg-[#5E6AD2] text-white text-xs px-2 py-1 rounded"
                >
                  {role}
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        roles: form.roles.filter((r) => r !== role),
                      })
                    }
                    className="hover:opacity-70"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <Select>
              <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                <SelectValue placeholder="Add role..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                {roleOptions
                  .filter((r) => !form.roles.includes(r))
                  .map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      onSelect={() => {
                        if (!form.roles.includes(role)) {
                          setForm({
                            ...form,
                            roles: [...form.roles, role],
                          });
                        }
                      }}
                    >
                      {role}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#999] block mb-2">
              Project Access
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {projects.map((project) => (
                <label
                  key={project.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.project_ids.includes(project.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({
                          ...form,
                          project_ids: [...form.project_ids, project.id],
                        });
                      } else {
                        setForm({
                          ...form,
                          project_ids: form.project_ids.filter(
                            (p) => p !== project.id
                          ),
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border-[#333] bg-[#0D0D0D] text-[#5E6AD2]"
                  />
                  <span className="text-xs text-[#CCC]">
                    {project.icon} {project.name}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-[#666] mt-1">
              Leave empty for access to all projects
            </p>
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
            disabled={isLoading || !form.name.trim() || form.roles.length === 0}
            className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
          >
            {isLoading ? "Saving..." : group ? "Update" : "Create"} Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}