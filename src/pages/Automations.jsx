import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Power, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AutomationBuilder from "@/components/automations/AutomationBuilder";
import { createPageUrl } from "@/utils";

const triggerDescriptions = {
  status_change: "When status changes",
  task_created: "When task is created",
  issue_created: "When issue is created",
  epic_created: "When epic is created",
};

const actionLabels = {
  notify_reporter: "Notify reporter",
  notify_user: "Notify user",
  update_epic_health: "Update epic health",
  send_email: "Send email",
  update_field: "Update field",
};

export default function Automations() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showBuilder, setShowBuilder] = useState(false);

  const { data: automations = [] } = useQuery({
    queryKey: ["automations"],
    queryFn: () => base44.entities.Automation.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Automation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      setShowBuilder(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (automation) =>
      base44.entities.Automation.update(automation.id, { is_active: !automation.is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Automation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });

  return (
    <div className="h-full bg-[#0D0D0D] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(createPageUrl("Projects"))}
            className="text-[#6B6B6B] hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">Automations</h1>
          <span className="text-xs text-[#666] bg-[#111] px-2 py-1 rounded">
            {automations.length} automation{automations.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Button
          onClick={() => setShowBuilder(true)}
          className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
          size="sm"
        >
          <Plus size={14} className="mr-2" /> New Automation
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {automations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center mb-3">
              <span className="text-xl">⚙️</span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No automations yet</h2>
            <p className="text-sm text-[#666] mb-4 max-w-sm">
              Create automations to automatically perform actions when certain events occur in your projects.
            </p>
            <Button
              onClick={() => setShowBuilder(true)}
              className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
              size="sm"
            >
              <Plus size={14} className="mr-2" /> Create First Automation
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 max-w-4xl">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="p-4 bg-[#111] border border-[#1E1E1E] rounded-lg hover:border-[#252525] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-white">{automation.name}</h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-1 rounded ${
                          automation.is_active
                            ? "bg-[#1a3a2a] text-[#4ADE80]"
                            : "bg-[#2a1a1a] text-[#999]"
                        }`}
                      >
                        {automation.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {automation.description && (
                      <p className="text-xs text-[#999] mb-3">{automation.description}</p>
                    )}

                    {/* Trigger */}
                    <div className="mb-3">
                      <p className="text-[10px] text-[#666] mb-1">Trigger</p>
                      <p className="text-xs text-[#CCC]">
                        {triggerDescriptions[automation.trigger_type] || automation.trigger_type}
                        {automation.trigger_config?.entity_type && (
                          <span className="text-[#999]"> on {automation.trigger_config.entity_type}</span>
                        )}
                        {automation.trigger_config?.to_status && (
                          <span className="text-[#999]"> → {automation.trigger_config.to_status}</span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div>
                      <p className="text-[10px] text-[#666] mb-1">Actions ({automation.actions?.length || 0})</p>
                      <div className="flex flex-wrap gap-1">
                        {automation.actions?.map((action, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#252525] text-[#CCC] px-2 py-1 rounded"
                          >
                            {actionLabels[action.type] || action.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleMutation.mutate(automation)}
                      title={automation.is_active ? "Disable" : "Enable"}
                      className="p-2 rounded hover:bg-[#252525] transition-colors"
                    >
                      <Power
                        size={16}
                        className={automation.is_active ? "text-[#4ADE80]" : "text-[#666]"}
                      />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(automation.id)}
                      title="Delete"
                      className="p-2 text-[#999] hover:text-[#F87171] hover:bg-[#252525] rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AutomationBuilder
        open={showBuilder}
        onClose={() => setShowBuilder(false)}
        onSubmit={(data) => createMutation.mutate(data)}
      />
    </div>
  );
}