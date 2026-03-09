import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";

const statusOptions = ["todo", "in_progress", "in_review", "done", "cancelled"];
const entityTypes = ["task", "issue", "epic"];
const actionTypes = [
  { value: "notify_reporter", label: "Notify Reporter" },
  { value: "notify_user", label: "Notify User" },
  { value: "slack_notify", label: "Slack Notification" },
  { value: "update_epic_health", label: "Update Epic Health" },
  { value: "send_email", label: "Send Email" },
  { value: "update_field", label: "Update Field" },
];

export default function AutomationBuilder({ open, onClose, onSubmit, projects }) {
  const [automation, setAutomation] = useState({
    name: "",
    description: "",
    trigger_type: "status_change",
    trigger_config: {
      entity_type: "task",
      to_status: "done",
    },
    actions: [],
  });

  const [newAction, setNewAction] = useState({ type: "notify_reporter", config: {} });

  const handleAddAction = () => {
    if (!newAction.type) return;
    setAutomation({
      ...automation,
      actions: [...automation.actions, newAction],
    });
    setNewAction({ type: "notify_reporter", config: {} });
  };

  const handleRemoveAction = (index) => {
    setAutomation({
      ...automation,
      actions: automation.actions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    if (!automation.name.trim() || automation.actions.length === 0) return;
    onSubmit(automation);
    setAutomation({
      name: "",
      description: "",
      trigger_type: "status_change",
      trigger_config: { entity_type: "task", to_status: "done" },
      actions: [],
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#111] border-[#333]">
        <DialogHeader>
          <DialogTitle className="text-white">Create Automation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#999]">Name</label>
            <Input
              value={automation.name}
              onChange={(e) => setAutomation({ ...automation, name: e.target.value })}
              placeholder="e.g., Notify on task completion"
              className="bg-[#0D0D0D] border-[#252525] text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#999]">Description</label>
            <Textarea
              value={automation.description}
              onChange={(e) => setAutomation({ ...automation, description: e.target.value })}
              placeholder="What does this automation do?"
              className="bg-[#0D0D0D] border-[#252525] text-white resize-none"
              rows={2}
            />
          </div>

          {/* Trigger Configuration */}
          <div className="pt-4 border-t border-[#252525]">
            <h4 className="text-sm font-semibold text-white mb-3">Trigger: When Status Changes</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-[#999]">Entity Type</label>
                <Select
                  value={automation.trigger_config.entity_type}
                  onValueChange={(value) =>
                    setAutomation({
                      ...automation,
                      trigger_config: { ...automation.trigger_config, entity_type: value },
                    })
                  }
                >
                  <SelectTrigger className="bg-[#0D0D0D] border-[#252525] text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#333]">
                    {entityTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-xs">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#999]">To Status</label>
                <Select
                  value={automation.trigger_config.to_status}
                  onValueChange={(value) =>
                    setAutomation({
                      ...automation,
                      trigger_config: { ...automation.trigger_config, to_status: value },
                    })
                  }
                >
                  <SelectTrigger className="bg-[#0D0D0D] border-[#252525] text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#333]">
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status} className="text-xs capitalize">
                        {status.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#252525]">
            <h4 className="text-sm font-semibold text-white mb-3">Actions</h4>

            {/* Current Actions */}
            <div className="space-y-2 mb-4">
              {automation.actions.map((action, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#0D0D0D] rounded border border-[#252525]">
                  <span className="text-xs text-[#CCC]">
                    {actionTypes.find((a) => a.value === action.type)?.label}
                  </span>
                  <button
                    onClick={() => handleRemoveAction(idx)}
                    className="text-[#666] hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Action */}
            <div className="space-y-2 p-3 bg-[#0D0D0D] rounded border border-[#252525]">
              <Select value={newAction.type} onValueChange={(value) => setNewAction({ ...newAction, type: value })}>
                <SelectTrigger className="bg-[#111] border-[#333] text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {actionTypes.map((action) => (
                    <SelectItem key={action.value} value={action.value} className="text-xs">
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action-specific config */}
              {newAction.type === "notify_user" && (
                <Input
                  placeholder="User email"
                  value={newAction.config.user_email || ""}
                  onChange={(e) =>
                    setNewAction({
                      ...newAction,
                      config: { ...newAction.config, user_email: e.target.value },
                    })
                  }
                  className="bg-[#111] border-[#333] text-white text-xs"
                />
              )}

              {newAction.type === "slack_notify" && (
                <Input
                  placeholder="Optional: override channel (e.g., #alerts)"
                  value={newAction.config.channel || ""}
                  onChange={(e) =>
                    setNewAction({
                      ...newAction,
                      config: { ...newAction.config, channel: e.target.value },
                    })
                  }
                  className="bg-[#111] border-[#333] text-white text-xs"
                />
              )}

              {newAction.type === "send_email" && (
                <>
                  <Input
                    placeholder="Email address"
                    value={newAction.config.to_email || ""}
                    onChange={(e) =>
                      setNewAction({
                        ...newAction,
                        config: { ...newAction.config, to_email: e.target.value },
                      })
                    }
                    className="bg-[#111] border-[#333] text-white text-xs"
                  />
                  <Input
                    placeholder="Subject"
                    value={newAction.config.subject || ""}
                    onChange={(e) =>
                      setNewAction({
                        ...newAction,
                        config: { ...newAction.config, subject: e.target.value },
                      })
                    }
                    className="bg-[#111] border-[#333] text-white text-xs"
                  />
                </>
              )}

              <Button
                onClick={handleAddAction}
                size="sm"
                className="w-full bg-[#5E6AD2] hover:bg-[#4F5ABF] text-xs"
              >
                <Plus size={12} className="mr-1" /> Add Action
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button onClick={onClose} variant="outline" size="sm" className="bg-[#111] border-[#333] text-white hover:bg-[#252525]">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!automation.name || automation.actions.length === 0}
            size="sm"
            className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
          >
            Create Automation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}