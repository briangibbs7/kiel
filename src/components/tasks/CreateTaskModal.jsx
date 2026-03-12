import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

export default function CreateTaskModal({
  open,
  onClose,
  onSubmit,
  epics,
  users = [],
  project = null,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    epic_id: "",
    project_id: "",
    priority: "medium",
    status: "todo",
    assignee: "",
    estimated_hours: "",
    story_points: "",
    due_date: "",
    sprint_id: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Please enter a title");
      return;
    }
    onSubmit({
      ...formData,
      estimated_hours: formData.estimated_hours
        ? parseInt(formData.estimated_hours)
        : undefined,
      story_points: formData.story_points
        ? parseInt(formData.story_points)
        : undefined,
    });
    setFormData({
      title: "",
      description: "",
      epic_id: "",
      project_id: "",
      priority: "medium",
      status: "todo",
      assignee: "",
      estimated_hours: "",
      story_points: "",
      due_date: "",
      sprint_id: null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-[#333] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Epic Selection */}
          <div>
            <label className="text-xs font-semibold text-[#CCC] uppercase tracking-wider block mb-2">
              Epic
            </label>
            <Select
              value={formData.epic_id}
              onValueChange={(value) =>
                setFormData({ ...formData, epic_id: value })
              }
            >
              <SelectTrigger className="bg-[#111] border-[#333] text-white hover:border-[#444] transition-colors">
                <SelectValue placeholder="Select an epic..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                {epics && epics.map((epic) => (
                  <SelectItem key={epic.id} value={epic.id} className="text-white">
                    {epic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-[#CCC] uppercase tracking-wider block mb-2">
              Title *
            </label>
            <Input
              required
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-[#111] border-[#333] text-white placeholder-[#555] focus:border-[#5E6AD2]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-[#CCC] uppercase tracking-wider block mb-2">
              Description
            </label>
            <Textarea
              placeholder="Add details about this task..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-[#111] border-[#333] text-white placeholder-[#555] h-20 resize-none focus:border-[#5E6AD2]"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#CCC] uppercase tracking-wider block mb-2">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="bg-[#111] border-[#333] text-white hover:border-[#444] transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                   <SelectItem value="low" className="text-white">Low</SelectItem>
                   <SelectItem value="medium" className="text-white">Medium</SelectItem>
                   <SelectItem value="high" className="text-white">High</SelectItem>
                   <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                 </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#CCC] uppercase tracking-wider block mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-[#111] border-[#333] text-white hover:border-[#444] transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                   <SelectItem value="todo" className="text-white">To Do</SelectItem>
                   <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                   <SelectItem value="in_review" className="text-white">In Review</SelectItem>
                   <SelectItem value="done" className="text-white">Done</SelectItem>
                 </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#CCC] uppercase tracking-wider block mb-2">
                Assignee
              </label>
              <Select
                value={formData.assignee}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignee: value })
                }
              >
                <SelectTrigger className="bg-[#111] border-[#333] text-white hover:border-[#444] transition-colors">
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {users && users.map((user) => (
                    <SelectItem key={user.id} value={user.email} className="text-white">
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#CCC] uppercase tracking-wider block mb-2">
                Due Date
              </label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="bg-[#111] border-[#333] text-white placeholder-[#555] pl-9 focus:border-[#5E6AD2]"
                />
              </div>
            </div>
          </div>

          {/* Estimation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#CCC] uppercase tracking-wider block mb-2">
                Est. Hours
              </label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 8"
                value={formData.estimated_hours}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_hours: e.target.value })
                }
                className="bg-[#111] border-[#333] text-white placeholder-[#555] focus:border-[#5E6AD2]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#CCC] uppercase tracking-wider block mb-2">
                Story Points
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 5"
                value={formData.story_points}
                onChange={(e) =>
                  setFormData({ ...formData, story_points: e.target.value })
                }
                className="bg-[#111] border-[#333] text-white placeholder-[#555] focus:border-[#5E6AD2]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-[#252525]">
            <Button variant="outline" onClick={onClose} className="border-[#333] text-[#999] hover:bg-[#111]">
              Cancel
            </Button>
            <Button type="submit" className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90 text-white">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}