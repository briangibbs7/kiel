import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PERMISSIONS, PERMISSION_LABELS, DEFAULT_ROLES } from "@/lib/permissions";

export default function RoleManagement() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const queryClient = useQueryClient();

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: () => base44.entities.Role.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Role.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      resetForm();
      setShowCreate(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (roleId) => base44.entities.Role.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", permissions: [] });
    setEditingRole(null);
  };

  const handlePermissionChange = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.permissions.length === 0) return;
    createMutation.mutate(formData);
  };

  const permissionKeys = Object.values(PERMISSIONS);

  return (
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Role Management</h1>
            <p className="text-sm text-[#999] mt-1">
              Define roles and permissions for different user groups
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowCreate(true);
            }}
            className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
          >
            <Plus size={16} className="mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-4">
        {roles.length === 0 && !showCreate ? (
          <div className="text-center py-12 text-[#555]">
            <p className="text-sm">No custom roles yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg group hover:border-[#252525] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{role.name}</h3>
                    {role.description && (
                      <p className="text-sm text-[#999] mt-1">
                        {role.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setFormData({
                          name: role.name,
                          description: role.description,
                          permissions: role.permissions,
                        });
                        setShowCreate(true);
                      }}
                      className="p-2 text-[#999] hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(role.id)}
                      className="p-2 text-[#999] hover:text-[#F87171] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="text-xs bg-[#0D0D0D] text-[#999] px-2 py-1 rounded border border-[#1E1E1E]"
                    >
                      {PERMISSION_LABELS[perm]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingRole ? "Edit Role" : "Create Role"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#999] block mb-1">
                  Role Name
                </label>
                <Input
                  required
                  placeholder="e.g., Content Manager"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-[#111] border-[#333] text-white placeholder-[#555]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#999] block mb-1">
                  Description
                </label>
                <Input
                  placeholder="What is this role for?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-[#111] border-[#333] text-white placeholder-[#555]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-3">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 bg-[#111] rounded border border-[#333]">
                {permissionKeys.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center gap-2 cursor-pointer hover:bg-[#0D0D0D] p-2 rounded transition-colors"
                  >
                    <Checkbox
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={() =>
                        handlePermissionChange(permission)
                      }
                    />
                    <span className="text-sm text-[#CCC]">
                      {PERMISSION_LABELS[permission]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowCreate(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-[#5E6AD2]"
              >
                {editingRole ? "Update Role" : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}