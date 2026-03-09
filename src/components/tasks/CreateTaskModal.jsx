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
  stories,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    story_id: "",
    priority: "medium",
    status: "todo",
    assignee: "",
    estimated_hours: "",
    story_points: "",
    due_date: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.story_id) {
      alert("Please select a story");
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
      story_id: "",
      priority: "medium",
      status: "todo",
      assignee: "",
      estimated_hours: "",
      story_points: "",
      due_date: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-[#333] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Story Selection */}
          <div>
            <label className="text-xs font-semibold text-[#CCC] uppercase tracking-wider block mb-2">
              Story *
            </label>
            <Select
              value={formData.story_id}
              onValueChange={(value) =>
                setFormData({ ...formData, story_id: value })
              }
            >
              <SelectTrigger className="bg-[#111] border-[#333] text-white hover:border-[#444] transition-colors">
                <SelectValue placeholder="Select a story..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                {stories && stories.map((story) => (
                  <SelectItem key={story.id} value={story.id}>
                    {story.title}
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
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
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
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
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
              <Input
                type="email"
                placeholder="dev@example.com"
                value={formData.assignee}
                onChange={(e) =>
                  setFormData({ ...formData, assignee: e.target.value })
                }
                className="bg-[#111] border-[#333] text-white placeholder-[#555] focus:border-[#5E6AD2]"
              />
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