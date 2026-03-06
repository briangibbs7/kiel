import React from "react";
import { Filter, Settings2, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const availableColumns = [
  { id: "id", label: "ID" },
  { id: "title", label: "Title" },
  { id: "status", label: "Status" },
  { id: "priority", label: "Priority" },
  { id: "assignee", label: "Assignee" },
  { id: "due_date", label: "Due Date" },
  { id: "labels", label: "Labels" },
];

const statusOptions = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

const priorityOptions = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "none", label: "None" },
];

export default function IssueViewControls({
  columns,
  onColumnsChange,
  filters,
  onFiltersChange,
  selectedCount,
  onBulkDelete,
}) {
  return (
    <div className="flex items-center gap-2">
      {selectedCount > 0 && (
        <button
          onClick={onBulkDelete}
          className="text-xs px-2 py-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 flex items-center gap-2"
        >
          <Trash2 size={14} />
          Delete ({selectedCount})
        </button>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <button className="text-[#555] hover:text-white transition-colors p-1">
            <Filter size={14} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-[#1A1A1A] border-[#333] p-3">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[#999] block mb-2">Status</label>
              <div className="space-y-1">
                {statusOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-xs text-[#CCC] cursor-pointer">
                    <Checkbox
                      checked={filters.status?.includes(opt.value) || false}
                      onCheckedChange={(checked) => {
                        const newStatus = checked
                          ? [...(filters.status || []), opt.value]
                          : (filters.status || []).filter(s => s !== opt.value);
                        onFiltersChange({ ...filters, status: newStatus.length ? newStatus : undefined });
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-2">Priority</label>
              <div className="space-y-1">
                {priorityOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-xs text-[#CCC] cursor-pointer">
                    <Checkbox
                      checked={filters.priority?.includes(opt.value) || false}
                      onCheckedChange={(checked) => {
                        const newPriority = checked
                          ? [...(filters.priority || []), opt.value]
                          : (filters.priority || []).filter(p => p !== opt.value);
                        onFiltersChange({ ...filters, priority: newPriority.length ? newPriority : undefined });
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <button className="text-[#555] hover:text-white transition-colors p-1">
            <Settings2 size={14} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 bg-[#1A1A1A] border-[#333] p-3">
          <label className="text-xs font-medium text-[#999] block mb-2">Columns</label>
          <div className="space-y-1">
            {availableColumns.map((col) => (
              <label key={col.id} className="flex items-center gap-2 text-xs text-[#CCC] cursor-pointer">
                <Checkbox
                  checked={columns.includes(col.id)}
                  onCheckedChange={(checked) => {
                    const newColumns = checked
                      ? [...columns, col.id]
                      : columns.filter(c => c !== col.id);
                    onColumnsChange(newColumns);
                  }}
                />
                {col.label}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}