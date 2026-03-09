import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
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
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [reassignUser, setReassignUser] = useState(null);

  const { data: allUsers = [] } = useQuery({
    queryKey: ["all-users-reassign"],
    queryFn: () => base44.entities.User.list(),
    enabled: open,
  });

  const activeUsers = allUsers.filter(
    (u) => u.id !== user?.id && u.status === "active"
  );

  const handleUpdate = () => {
    onUpdate(form);
  };

  const handleDelete = () => {
    if (activeUsers.length > 0) {
      setShowReassignDialog(true);
    } else {
      if (window.confirm(`Remove ${user?.full_name || user?.email}?`)) {
        onDelete();
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (reassignUser) {
      // Reassign issues and tasks to new user
      const [issues, tasks] = await Promise.all([
        base44.asServiceRole.entities.Issue.filter({
          assignee: user?.email,
        }),
        base44.asServiceRole.entities.Task.filter({
          assignee: user?.email,
        }),
      ]);

      // Update all issues
      for (const issue of issues) {
        await base44.asServiceRole.entities.Issue.update(issue.id, {
          assignee: reassignUser.email,
        });
      }

      // Update all tasks
      for (const task of tasks) {
        await base44.asServiceRole.entities.Task.update(task.id, {
          assignee: reassignUser.email,
        });
      }
    }

    // Delete user
    onDelete();
    setShowReassignDialog(false);
    setReassignUser(null);
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
                  <SelectItem value="paused">Paused</SelectItem>
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

      {/* Reassign Issues Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="bg-[#111] border-[#333] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              Reassign Issues & Tasks
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-[#999] mb-4">
            This user has active issues and tasks. Select an active user to reassign them to:
          </p>

          <Select value={reassignUser?.id || ""} onValueChange={(userId) => {
            const selected = activeUsers.find((u) => u.id === userId);
            setReassignUser(selected);
          }}>
            <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white mb-4">
              <SelectValue placeholder="Select user..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#333]">
              {activeUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.full_name || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReassignDialog(false)}
              className="border-[#333] text-[#CCC]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={!reassignUser || isLoading}
              className="bg-[#F87171] hover:bg-[#E85C5C]"
            >
              {isLoading ? "Removing..." : "Delete & Reassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}