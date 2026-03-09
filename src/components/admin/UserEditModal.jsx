import React, { useState } from "react";
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
import { Trash2 } from "lucide-react";

export default function UserEditModal({
  open,
  onOpenChange,
  user,
  onUpdate,
  onDelete,
  isLoading,
}) {
  const [form, setForm] = useState({
    role: user?.role || "user",
    status: user?.status || "active",
  });

  const handleUpdate = () => {
    onUpdate(form);
  };

  const handleDelete = () => {
    if (window.confirm(`Remove ${user?.full_name || user?.email}?`)) {
      onDelete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111] border-[#333] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
        </DialogHeader>

        {user && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Name
              </label>
              <Input
                value={user.full_name || ""}
                disabled
                className="bg-[#0D0D0D] border-[#333] text-[#666]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Email
              </label>
              <Input
                value={user.email}
                disabled
                className="bg-[#0D0D0D] border-[#333] text-[#666]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Role
              </label>
              <Select
                value={form.role}
                onValueChange={(value) => setForm({ ...form, role: value })}
              >
                <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  <SelectItem value="user">User (Standard)</SelectItem>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                  <SelectItem value="editor">Editor (Content)</SelectItem>
                  <SelectItem value="viewer">Viewer (Read-Only)</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 justify-between">
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="text-[#F87171] hover:bg-[#2a1a1a]"
          >
            <Trash2 size={16} className="mr-2" />
            Remove
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#333] text-[#CCC]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isLoading}
              className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}