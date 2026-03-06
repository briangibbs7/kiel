import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function UserManagement() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ email: "", role: "user" });
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const inviteMutation = useMutation({
    mutationFn: (data) =>
      base44.users.inviteUser(data.email, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      setInviteData({ email: "", role: "user" });
      setShowInvite(false);
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteData.email || !inviteData.role) return;
    inviteMutation.mutate(inviteData);
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm text-[#999] mt-1">
              Manage workspace members and permissions
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowInvite(true)}
              className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
            >
              <Plus size={16} className="mr-2" />
              Invite User
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {users.length === 0 ? (
          <div className="text-center py-12 text-[#555]">
            <p className="text-sm">No users yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg flex items-center justify-between group hover:border-[#252525] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#5E6AD2] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {user.full_name?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-white truncate">
                      {user.full_name || "Unnamed User"}
                    </h3>
                    <p className="text-sm text-[#999] truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <div className="flex items-center gap-1">
                    {user.role === "admin" && (
                      <Shield size={14} className="text-[#FACC15]" />
                    )}
                    <span className="text-sm text-[#999] min-w-fit">
                      {user.role}
                    </span>
                  </div>
                  {isAdmin && user.id !== currentUser?.id && (
                    <button
                      onClick={() => {
                        // TODO: Implement role change/user removal
                      }}
                      className="text-[#555] hover:text-[#F87171] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="bg-[#1A1A1A] border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-white">Invite User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="user@example.com"
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData({ ...inviteData, email: e.target.value })
                }
                className="bg-[#111] border-[#333] text-white placeholder-[#555]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Role
              </label>
              <Select
                value={inviteData.role}
                onValueChange={(value) =>
                  setInviteData({ ...inviteData, role: value })
                }
              >
                <SelectTrigger className="bg-[#111] border-[#333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                className="bg-[#5E6AD2]"
              >
                Send Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}