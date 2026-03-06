import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TaskDependencyManager({ taskId, storyId }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState("");
  const queryClient = useQueryClient();

  const { data: currentTask } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => base44.entities.Task.filter({ id: taskId }),
  });

  const { data: availableTasks = [] } = useQuery({
    queryKey: ["story-tasks", storyId],
    queryFn: () =>
      base44.entities.Task.filter({ story_id: storyId }, "-created_date"),
  });

  const filteredTasks = availableTasks.filter(
    (t) => t.id !== taskId && !currentTask?.[0]?.depends_on_task_ids?.includes(t.id)
  );

  const addDependencyMutation = useMutation({
    mutationFn: (dependsOnId) => {
      const current = currentTask?.[0];
      const dependencies = [...(current?.depends_on_task_ids || []), dependsOnId];
      return base44.entities.Task.update(taskId, {
        depends_on_task_ids: dependencies,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      setSelectedDependency("");
      setShowAdd(false);
    },
  });

  const removeDependencyMutation = useMutation({
    mutationFn: (dependsOnId) => {
      const current = currentTask?.[0];
      const dependencies = (current?.depends_on_task_ids || []).filter(
        (id) => id !== dependsOnId
      );
      return base44.entities.Task.update(taskId, {
        depends_on_task_ids: dependencies,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });

  const task = currentTask?.[0];
  const dependencies = task?.depends_on_task_ids || [];
  const dependentTasks = availableTasks.filter((t) =>
    dependencies.includes(t.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-[#999] uppercase tracking-wider">
          Dependencies
        </h4>
        {dependencies.length > 0 && (
          <span className="text-xs text-[#999]">{dependencies.length}</span>
        )}
      </div>

      {dependentTasks.length === 0 ? (
        <p className="text-xs text-[#555]">No dependencies</p>
      ) : (
        <div className="space-y-2">
          {dependentTasks.map((depTask) => (
            <div
              key={depTask.id}
              className="p-2 bg-[#0D0D0D] border border-[#1A1A1A] rounded flex items-center justify-between group"
            >
              <p className="text-xs text-white truncate">{depTask.title}</p>
              <button
                onClick={() => removeDependencyMutation.mutate(depTask.id)}
                className="text-[#555] hover:text-[#F87171] opacity-0 group-hover:opacity-100 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <div className="space-y-2">
          <Select value={selectedDependency} onValueChange={setSelectedDependency}>
            <SelectTrigger className="bg-[#0D0D0D] border-[#252525] text-white text-sm">
              <SelectValue placeholder="Select a task..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#333]">
              {filteredTasks.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (selectedDependency) {
                  addDependencyMutation.mutate(selectedDependency);
                }
              }}
              disabled={!selectedDependency}
              className="flex-1 bg-[#5E6AD2] text-white"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAdd(false);
                setSelectedDependency("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAdd(true)}
          className="w-full"
        >
          <Plus size={14} className="mr-1" />
          Add Dependency
        </Button>
      )}

      {dependencies.length > 0 && (
        <div className="mt-3 p-2 bg-[#0D0D0D]/50 border border-[#1E1E1E] rounded flex gap-2">
          <AlertCircle size={14} className="text-[#FACC15] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#999]">
            Complete all dependencies before starting this task.
          </p>
        </div>
      )}
    </div>
  );
}