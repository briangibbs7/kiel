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
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-[#333]">
        <DialogHeader>
          <DialogTitle className="text-white">Create Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#999] block mb-1">
              Story
            </label>
            <Select
              value={formData.story_id}
              onValueChange={(value) =>
                setFormData({ ...formData, story_id: value })
              }
            >
              <SelectTrigger className="bg-[#111] border-[#333] text-white">
                <SelectValue placeholder="Select a story..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#333]">
                {stories.map((story) => (
                  <SelectItem key={story.id} value={story.id}>
                    {story.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#999] block mb-1">
              Title
            </label>
            <Input
              required
              placeholder="Task title..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-[#111] border-[#333] text-white placeholder-[#555]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#999] block mb-1">
              Description
            </label>
            <Textarea
              placeholder="Task details..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-[#111] border-[#333] text-white placeholder-[#555] h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="bg-[#111] border-[#333] text-white">
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
              <label className="text-xs font-medium text-[#999] block mb-1">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-[#111] border-[#333] text-white">
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Assignee Email
              </label>
              <Input
                type="email"
                placeholder="dev@example.com"
                value={formData.assignee}
                onChange={(e) =>
                  setFormData({ ...formData, assignee: e.target.value })
                }
                className="bg-[#111] border-[#333] text-white placeholder-[#555]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Est. Hours
              </label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="8"
                value={formData.estimated_hours}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_hours: e.target.value })
                }
                className="bg-[#111] border-[#333] text-white placeholder-[#555]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Story Points
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="5"
                value={formData.story_points}
                onChange={(e) =>
                  setFormData({ ...formData, story_points: e.target.value })
                }
                className="bg-[#111] border-[#333] text-white placeholder-[#555]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#5E6AD2]">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}