import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
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

const reportTypes = ["burndown", "workload", "progress", "resolution_time", "custom"];
const metricsOptions = ["completion_rate", "velocity", "cycle_time", "team_capacity", "issue_trends", "story_points"];

export default function CustomReports() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "burndown",
    metrics: [],
    project_ids: [],
    is_shared: false,
  });

  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ["customReports"],
    queryFn: () => base44.entities.CustomReport.list("-updated_date"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customReports"] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.CustomReport.update(editingReport.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customReports"] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customReports"] });
    },
  });

  const handleCreateClick = () => {
    setEditingReport(null);
    setForm({
      name: "",
      description: "",
      type: "burndown",
      metrics: [],
      project_ids: [],
      is_shared: false,
    });
    setIsCreateOpen(true);
  };

  const handleEditClick = (report) => {
    setEditingReport(report);
    setForm(report);
    setIsCreateOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setEditingReport(null);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || form.project_ids.length === 0) return;

    if (editingReport) {
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
            <h1 className="text-2xl font-bold text-white">Custom Reports</h1>
            <p className="text-sm text-[#666] mt-1">
              Create and manage custom project reports
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
          >
            <Plus size={16} className="mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#666]">No custom reports yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-lg bg-[#161616] border border-[#252525] hover:border-[#333] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">
                      {report.name}
                    </h3>
                    {report.description && (
                      <p className="text-sm text-[#999] mt-1">
                        {report.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#666]">
                      <span className="px-2 py-1 bg-[#252525] rounded">
                        {report.type}
                      </span>
                      <span>{report.project_ids?.length || 0} projects</span>
                      {report.is_shared && (
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
                      className="text-[#666] hover:text-white"
                      title="View"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(report)}
                      className="text-[#666] hover:text-white"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(report.id)}
                      className="text-[#F87171] hover:text-[#FF6B6B]"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#111] border-[#333] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingReport ? "Edit Report" : "Create Custom Report"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Report Name *
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Sprint Progress"
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
                placeholder="What is this report for?"
                className="bg-[#0D0D0D] border-[#333] text-white h-20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-1">
                Report Type *
              </label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm({ ...form, type: value })}
              >
                <SelectTrigger className="bg-[#0D0D0D] border-[#333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-2">
                Projects *
              </label>
              <div className="space-y-2 bg-[#0D0D0D] border border-[#333] rounded p-3 max-h-40 overflow-y-auto">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={form.project_ids.includes(project.id)}
                      onCheckedChange={(checked) => {
                        setForm({
                          ...form,
                          project_ids: checked
                            ? [...form.project_ids, project.id]
                            : form.project_ids.filter((id) => id !== project.id),
                        });
                      }}
                      className="border-[#555]"
                    />
                    <span className="text-sm text-[#CCC]">{project.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#999] block mb-2">
                Metrics
              </label>
              <div className="space-y-2 bg-[#0D0D0D] border border-[#333] rounded p-3">
                {metricsOptions.map((metric) => (
                  <div
                    key={metric}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={form.metrics.includes(metric)}
                      onCheckedChange={(checked) => {
                        setForm({
                          ...form,
                          metrics: checked
                            ? [...form.metrics, metric]
                            : form.metrics.filter((m) => m !== metric),
                        });
                      }}
                      className="border-[#555]"
                    />
                    <span className="text-sm text-[#CCC]">
                      {metric.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
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
              disabled={!form.name.trim() || form.project_ids.length === 0}
              className="bg-[#5E6AD2] hover:bg-[#4F5ABF]"
            >
              {editingReport ? "Update Report" : "Create Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}