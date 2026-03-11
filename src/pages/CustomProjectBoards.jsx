import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, LayoutGrid, Search, Filter, Copy, Star, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const boardTypes = [
  { id: "kanban", label: "Kanban", icon: "📋" },
  { id: "list", label: "List", icon: "📝" },
  { id: "timeline", label: "Timeline", icon: "📅" },
  { id: "calendar", label: "Calendar", icon: "🗓️" },
  { id: "table", label: "Table", icon: "📊" },
];
const groupingOptions = ["status", "assignee", "priority", "label", "epic", "sprint", "none"];
const sortingOptions = ["priority", "due_date", "created", "updated", "title", "assignee"];
const fieldOptions = [
  { id: "assignee", label: "Assignee" },
  { id: "due_date", label: "Due Date" },
  { id: "priority", label: "Priority" },
  { id: "labels", label: "Labels" },
  { id: "story_points", label: "Story Points" },
  { id: "status", label: "Status" },
  { id: "sprint", label: "Sprint" },
];

export default function CustomProjectBoards() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    project_id: "",
    board_type: "kanban",
    grouping: "status",
    sorting: "priority",
    visible_fields: [],
    is_default: false,
    is_shared: false,
  });

  const queryClient = useQueryClient();

  const { data: boards = [] } = useQuery({
    queryKey: ["customBoards"],
    queryFn: () => base44.entities.CustomProjectBoard.list("-updated_date"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomProjectBoard.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customBoards"] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.CustomProjectBoard.update(editingBoard.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customBoards"] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomProjectBoard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customBoards"] });
    },
  });

  const handleCreateClick = () => {
    setEditingBoard(null);
    setForm({
      name: "",
      description: "",
      project_id: "",
      board_type: "kanban",
      grouping: "status",
      sorting: "priority",
      visible_fields: [],
      is_default: false,
      is_shared: false,
    });
    setIsCreateOpen(true);
  };

  const handleEditClick = (board) => {
    setEditingBoard(board);
    setForm(board);
    setIsCreateOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setEditingBoard(null);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.project_id) return;

    if (editingBoard) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="h-screen bg-[#0D0D0D] overflow-auto flex flex-col">
      <div className="sticky top-0 z-10 border-b border-[#252525] bg-[#0D0D0D]">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Custom Boards</h1>
            <p className="text-sm text-[#666] mt-1">
              Create custom project boards with flexible layouts and filters
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
          >
            <Plus size={16} className="mr-2" />
            New Board
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {boards.length === 0 ? (
          <div className="text-center py-12">
            <LayoutGrid className="w-12 h-12 text-[#444] mx-auto mb-4" />
            <p className="text-[#666]">No custom boards yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {boards.map((board) => {
              const project = projects.find((p) => p.id === board.project_id);
              return (
                <div
                  key={board.id}
                  className="p-4 rounded-lg bg-[#161616] border border-[#252525] hover:border-[#333] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white">
                        {board.name}
                      </h3>
                      {board.description && (
                        <p className="text-sm text-[#999] mt-1">
                          {board.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#666]">
                        <span className="px-2 py-1 bg-[#252525] rounded">
                          {board.board_type}
                        </span>
                        <span>
                          {project ? project.name : "Project"}
                        </span>
                        {board.grouping !== "none" && (
                          <span>Grouped by {board.grouping}</span>
                        )}
                        {board.is_default && (
                          <span className="px-2 py-1 bg-[#4ADE80] text-[#0D0D0D] rounded text-xs font-medium">
                            Default
                          </span>
                        )}
                        {board.is_shared && (
                          <span className="px-2 py-1 bg-[#5E6AD2] text-[#CCC] rounded">
                            Shared
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(board)}
                        className="text-[#666] hover:text-white"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(board.id)}
                        className="text-[#F87171] hover:text-[#FF6B6B]"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#111] border-[#333] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingBoard ? "Edit Board" : "Create Custom Board"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Board Name *
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., High Priority Tasks"
                className="bg-[#0D0D0D] border-[#333] text-white"
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
                placeholder="What is this board for?"
                className="bg-[#0D0D0D] border-[#333] text-white h-16"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Project *
              </label>
              <Select
                value={form.project_id}
                onValueChange={(value) =>
                  setForm({ ...form, project_id: value })
                }
              >
                <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#999] block mb-1">
                  Board Type *
                </label>
                <Select
                  value={form.board_type}
                  onValueChange={(value) =>
                    setForm({ ...form, board_type: value })
                  }
                >
                  <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#333]">
                    {boardTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#999] block mb-1">
                  Grouping
                </label>
                <Select
                  value={form.grouping}
                  onValueChange={(value) =>
                    setForm({ ...form, grouping: value })
                  }
                >
                  <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#333]">
                    {groupingOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Sort By
              </label>
              <Select
                value={form.sorting}
                onValueChange={(value) =>
                  setForm({ ...form, sorting: value })
                }
              >
                <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {sortingOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/_/g, " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-2">
                Visible Fields
              </label>
              <div className="space-y-2 bg-[#0D0D0D] border border-[#333] rounded p-3">
                {fieldOptions.map((field) => (
                  <div key={field} className="flex items-center gap-2">
                    <Checkbox
                      checked={form.visible_fields.includes(field)}
                      onCheckedChange={(checked) => {
                        setForm({
                          ...form,
                          visible_fields: checked
                            ? [...form.visible_fields, field]
                            : form.visible_fields.filter((f) => f !== field),
                        });
                      }}
                      className="border-[#555]"
                    />
                    <span className="text-sm text-[#CCC]">
                      {field.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.is_default}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_default: checked })
                }
                className="border-[#555]"
              />
              <span className="text-sm text-[#CCC]">Set as default board</span>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.is_shared}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_shared: checked })
                }
                className="border-[#555]"
              />
              <span className="text-sm text-[#CCC]">Share with team</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="border-[#333]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.project_id}
              className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
            >
              {editingBoard ? "Update Board" : "Create Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}