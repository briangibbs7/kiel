import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Power, Edit2 } from "lucide-react";

const eventTypeOptions = [
  { value: "status_changes", label: "Status Changes" },
  { value: "milestone_alerts", label: "Milestone Alerts" },
  { value: "project_updates", label: "Project Updates" },
  { value: "issue_assignments", label: "Issue Assignments" },
];

export default function SlackIntegrationSettings() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [form, setForm] = useState({
    workspace_name: "",
    webhook_url: "",
    channel: "#notifications",
    event_types: ["status_changes"],
  });

  const { data: slackConfigs = [] } = useQuery({
    queryKey: ["slack-configs"],
    queryFn: () => base44.asServiceRole.entities.SlackConfig.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.asServiceRole.entities.SlackConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slack-configs"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      base44.asServiceRole.entities.SlackConfig.update(editingConfig.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slack-configs"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.SlackConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slack-configs"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (config) =>
      base44.asServiceRole.entities.SlackConfig.update(config.id, {
        is_active: !config.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slack-configs"] });
    },
  });

  const resetForm = () => {
    setForm({
      workspace_name: "",
      webhook_url: "",
      channel: "#notifications",
      event_types: ["status_changes"],
    });
    setEditingConfig(null);
    setShowDialog(false);
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setForm(config);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!form.workspace_name.trim() || !form.webhook_url.trim()) return;

    if (editingConfig) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Slack Integration</h3>
          <p className="text-xs text-[#999] mt-1">
            Configure Slack webhooks to receive real-time notifications
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          size="sm"
          className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
        >
          <Plus size={14} className="mr-1" /> Add Webhook
        </Button>
      </div>

      <div className="space-y-2">
        {slackConfigs.length === 0 ? (
          <div className="p-3 bg-[#0D0D0D] border border-[#1E1E1E] rounded text-sm text-[#666]">
            No Slack webhooks configured yet
          </div>
        ) : (
          slackConfigs.map((config) => (
            <div
              key={config.id}
              className="p-3 bg-[#111] border border-[#1E1E1E] rounded flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-white">{config.workspace_name}</h4>
                  <span className="text-[10px] text-[#666]">{config.channel}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      config.is_active
                        ? "bg-[#1a3a2a] text-[#4ADE80]"
                        : "bg-[#2a1a1a] text-[#999]"
                    }`}
                  >
                    {config.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {config.event_types?.map((event) => (
                    <span key={event} className="text-[10px] bg-[#252525] text-[#999] px-1.5 py-0.5 rounded">
                      {eventTypeOptions.find((o) => o.value === event)?.label || event}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                <button
                  onClick={() => toggleMutation.mutate(config)}
                  className="p-1.5 text-[#666] hover:text-[#4ADE80] hover:bg-[#252525] rounded transition-colors"
                >
                  <Power size={14} />
                </button>
                <button
                  onClick={() => handleEdit(config)}
                  className="p-1.5 text-[#666] hover:text-white hover:bg-[#252525] rounded transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(config.id)}
                  className="p-1.5 text-[#666] hover:text-[#F87171] hover:bg-[#252525] rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#111] border-[#333] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingConfig ? "Edit Slack Webhook" : "Add Slack Webhook"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#999] mb-1.5 block font-semibold">
                Workspace Name
              </label>
              <Input
                value={form.workspace_name}
                onChange={(e) => setForm({ ...form, workspace_name: e.target.value })}
                placeholder="e.g., Engineering"
                className="bg-[#0D0D0D] border-[#252525] text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-[#999] mb-1.5 block font-semibold">
                Webhook URL
              </label>
              <Input
                type="password"
                value={form.webhook_url}
                onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
                placeholder="https://hooks.slack.com/services/..."
                className="bg-[#0D0D0D] border-[#252525] text-white text-sm"
              />
              <p className="text-[10px] text-[#666] mt-1">
                Get from{" "}
                <a
                  href="https://api.slack.com/messaging/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5E6AD2] hover:underline"
                >
                  Slack App Settings
                </a>
              </p>
            </div>

            <div>
              <label className="text-xs text-[#999] mb-1.5 block font-semibold">
                Default Channel
              </label>
              <Input
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
                placeholder="#notifications"
                className="bg-[#0D0D0D] border-[#252525] text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-[#999] mb-1.5 block font-semibold">
                Event Types
              </label>
              <div className="space-y-1">
                {eventTypeOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.event_types.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({
                            ...form,
                            event_types: [...form.event_types, option.value],
                          });
                        } else {
                          setForm({
                            ...form,
                            event_types: form.event_types.filter((t) => t !== option.value),
                          });
                        }
                      }}
                      className="w-4 h-4 rounded border-[#333] bg-[#0D0D0D] text-[#5E6AD2]"
                    />
                    <span className="text-xs text-[#CCC]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              onClick={() => setShowDialog(false)}
              variant="outline"
              size="sm"
              className="bg-[#0D0D0D] border-[#252525] text-white hover:bg-[#252525]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              size="sm"
              className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
            >
              {editingConfig ? "Update" : "Add"} Webhook
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}