import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, Search } from "lucide-react";
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
import UserDashboard from "@/components/admin/UserDashboard";
import UserCard from "@/components/admin/UserCard";
import UserEditModal from "@/components/admin/UserEditModal";
import GroupList from "@/components/admin/GroupList";

export default function UserManagement() {
  const [showInvite, setShowInvite] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [inviteData, setInviteData] = useState({ email: "", role: "user" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: () => base44.asServiceRole.entities.Group.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => base44.asServiceRole.entities.Project.list(),
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

  const updateUserMutation = useMutation({
    mutationFn: (data) =>
      base44.asServiceRole.entities.User.update(selectedUser.id, {
        role: data.role,
        status: data.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      setShowEditModal(false);
      setSelectedUser(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () =>
      base44.asServiceRole.entities.User.delete(selectedUser.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      setShowEditModal(false);
      setSelectedUser(null);
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) => base44.asServiceRole.entities.Group.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: (data) =>
      base44.asServiceRole.entities.Group.update(data.id, {
        name: data.name,
        description: data.description,
        roles: data.roles,
        project_ids: data.project_ids,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.Group.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteData.email || !inviteData.role) return;
    inviteMutation.mutate(inviteData);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm text-[#999] mt-1">
              Manage workspace members and permissions
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                onClick={() => navigate(createPageUrl("RoleManagement"))}
                variant="outline"
                className="border-[#333]"
              >
                <Settings size={16} className="mr-2" />
                Manage Roles
              </Button>
            )}
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
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Groups Section */}
        {isAdmin && (
          <GroupList
            groups={groups}
            projects={projects}
            onCreateGroup={(data) => createGroupMutation.mutate(data)}
            onUpdateGroup={(id, data) =>
              updateGroupMutation.mutate({ id, ...data })
            }
            onDeleteGroup={(id) => deleteGroupMutation.mutate(id)}
            isLoading={
              createGroupMutation.isPending ||
              updateGroupMutation.isPending ||
              deleteGroupMutation.isPending
            }
          />
        )}

        {/* Dashboard Stats */}
        <UserDashboard users={users} />

        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111] border-[#252525] text-white placeholder-[#666] pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="bg-[#111] border-[#252525] text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-[#111] border-[#252525] text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#555]">
              {searchQuery || filterRole !== "all" || filterStatus !== "all"
                ? "No users match your filters"
                : "No users yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={() => {
                  setSelectedUser(user);
                  setShowEditModal(true);
                }}
              />
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
                  <SelectItem value="user">User (Standard)</SelectItem>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                  <SelectItem value="editor">Editor (Content)</SelectItem>
                  <SelectItem value="viewer">Viewer (Read-Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowInvite(false)}
                className="border-[#333]"
              >
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

      {/* Edit User Modal */}
      <UserEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        user={selectedUser}
        onUpdate={(data) => updateUserMutation.mutate(data)}
        onDelete={() => deleteUserMutation.mutate()}
        isLoading={updateUserMutation.isPending || deleteUserMutation.isPending}
      />
    </div>
  );
}