import React, { useMemo } from "react";
import { AlertCircle, Link2, CheckCircle2 } from "lucide-react";

export default function DependencyGraph({ tasks }) {
  const graphData = useMemo(() => {
    const nodes = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
    }));

    const edges = [];
    tasks.forEach((task) => {
      if (task.depends_on_task_ids && task.depends_on_task_ids.length > 0) {
        task.depends_on_task_ids.forEach((depId) => {
          edges.push({ from: depId, to: task.id, type: "depends" });
        });
      }
      if (task.blocked_by_task_ids && task.blocked_by_task_ids.length > 0) {
        task.blocked_by_task_ids.forEach((blockId) => {
          edges.push({ from: task.id, to: blockId, type: "blocks" });
        });
      }
    });

    return { nodes, edges };
  }, [tasks]);

  const statusColors = {
    todo: "#6B6B6B",
    in_progress: "#FACC15",
    in_review: "#60A5FA",
    done: "#4ADE80",
  };

  const priorityColors = {
    urgent: "#F87171",
    high: "#FB923C",
    medium: "#FACC15",
    low: "#60A5FA",
  };

  // Group tasks by status for visual layout
  const tasksByStatus = {
    todo: graphData.nodes.filter((n) => n.status === "todo"),
    in_progress: graphData.nodes.filter((n) => n.status === "in_progress"),
    in_review: graphData.nodes.filter((n) => n.status === "in_review"),
    done: graphData.nodes.filter((n) => n.status === "done"),
  };

  const blockedTasks = graphData.nodes.filter((node) => {
    const hasBlockers = graphData.edges.some(
      (edge) => edge.type === "blocks" && edge.to === node.id
    );
    return hasBlockers;
  });

  return (
    <div className="bg-[#0D0D0D] rounded-lg border border-[#1E1E1E] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Dependency Map
        </h3>
        <p className="text-sm text-[#999]">
          Visual view of task dependencies and blockers
        </p>
      </div>

      {/* Blocked Tasks Alert */}
      {blockedTasks.length > 0 && (
        <div className="mb-6 p-4 bg-[#F87171]/10 border border-[#F87171]/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-[#F87171] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-[#F87171] text-sm">
                {blockedTasks.length} blocked task{blockedTasks.length !== 1 ? "s" : ""}
              </h4>
              <p className="text-xs text-[#F87171]/80 mt-1">
                These tasks have dependencies that must be completed first
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Columns */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusColors[status] }}
              />
              <span className="text-xs font-semibold text-[#999] uppercase">
                {status.replace(/_/g, " ")} ({statusTasks.length})
              </span>
            </div>

            <div className="space-y-2">
              {statusTasks.map((task) => {
                const hasBlockers = graphData.edges.some(
                  (edge) =>
                    edge.type === "blocks" && edge.to === task.id
                );
                const hasDependents = graphData.edges.some(
                  (edge) =>
                    edge.type === "depends" && edge.from === task.id
                );

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-all ${
                      hasBlockers
                        ? "border-[#F87171] bg-[#F87171]/10"
                        : "border-[#1E1E1E] bg-[#111]"
                    } hover:border-[#333] group`}
                  >
                    <div className="flex items-start gap-2">
                      {hasBlockers && (
                        <AlertCircle
                          size={14}
                          className="text-[#F87171] flex-shrink-0 mt-0.5"
                        />
                      )}
                      {!hasBlockers && task.status === "done" && (
                        <CheckCircle2
                          size={14}
                          className="text-[#4ADE80] flex-shrink-0 mt-0.5"
                        />
                      )}
                      {!hasBlockers && task.status !== "done" && (
                        <div
                          className="w-2 h-2 rounded-full mt-1"
                          style={{
                            backgroundColor: statusColors[task.status],
                          }}
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {task.title}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          {hasDependents && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#60A5FA]/20 text-[#60A5FA] flex items-center gap-1">
                              <Link2 size={10} />
                              blocked
                            </span>
                          )}
                          {task.priority && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${priorityColors[task.priority]}20`,
                                color: priorityColors[task.priority],
                              }}
                            >
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {statusTasks.length === 0 && (
                <p className="text-xs text-[#555] text-center py-4">
                  No tasks
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-[#1E1E1E]">
        <p className="text-xs font-semibold text-[#999] uppercase mb-3">
          Legend
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-[#F87171]" />
            <span className="text-xs text-[#999]">Blocked by dependencies</span>
          </div>
          <div className="flex items-center gap-2">
            <Link2 size={14} className="text-[#60A5FA]" />
            <span className="text-xs text-[#999]">Has dependents</span>
          </div>
        </div>
      </div>
    </div>
  );
}