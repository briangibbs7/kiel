import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import EpicCard from "@/components/backlog/EpicCard";
import TaskCard from "@/components/backlog/TaskCard.jsx";

export default function Backlog() {
  const [expandedEpics, setExpandedEpics] = useState({});

  const { data: projects = [] } = useQuery({
    queryKey: ["backlog-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["all-epics"],
    queryFn: () => base44.entities.Epic.list("-created_date"),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["all-backlog-tasks"],
    queryFn: () => base44.entities.Task.list("-created_date"),
  });

  const toggleEpic = (epicId) => {
    setExpandedEpics((prev) => ({
      ...prev,
      [epicId]: !prev[epicId],
    }));
  };

  const getTasksForEpic = (epicId) => {
   return tasks.filter((t) => t.epic_id === epicId);
  };

  const getBacklogTasks = () => {
   return tasks.filter((t) => !t.epic_id);
  };

  const getProjectName = (projectId) => {
    return projects.find((p) => p.id === projectId)?.name || "Unknown Project";
  };

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "var(--pm-bg)" }}>
      <div className="px-6 py-4 border-b sticky top-0" style={{ borderColor: "var(--pm-border)", backgroundColor: "var(--pm-bg)" }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--pm-text)" }}>Backlog</h1>
          <p className="text-sm mt-1" style={{ color: "var(--pm-text-secondary)" }}>
            All backlogs across your projects
          </p>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {projects.map((project) => {
          const projectEpics = epics.filter((e) => e.project_id === project.id);
          if (projectEpics.length === 0) return null;

          return (
            <div key={project.id} className="space-y-3">
              <h2 className="text-sm font-semibold px-2" style={{ color: "var(--pm-text-secondary)" }}>{project.name}</h2>
              {projectEpics.map((epic) => {
                const epicTasks = getTasksForEpic(epic.id);
                const isExpanded = expandedEpics[epic.id];

                return (
                  <div key={epic.id} className="border rounded-lg overflow-hidden" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
                    <button
                      onClick={() => toggleEpic(epic.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:opacity-80 transition-opacity group"
                    >
                      <div style={{ color: "var(--pm-text-muted)" }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                      <EpicCard epic={epic} />
                    </button>

                    {isExpanded && (
                      <div className="border-t p-4 space-y-2" style={{ borderColor: "var(--pm-border)", backgroundColor: "var(--pm-bg)" }}>
                        {epicTasks.length === 0 ? (
                          <p className="text-xs py-4 text-center" style={{ color: "var(--pm-text-muted)" }}>
                            No tasks in this epic
                          </p>
                        ) : (
                          epicTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {getBacklogTasks().length > 0 && (
          <div className="border rounded-lg p-4" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--pm-text)" }}>Backlog (No Epic)</h3>
            <div className="space-y-2">
              {getBacklogTasks().map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}