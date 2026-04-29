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
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D]">
        <div>
          <h1 className="text-2xl font-bold text-white">Backlog</h1>
          <p className="text-sm text-[#999] mt-1">
            All backlogs across your projects
          </p>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {/* Epics grouped by project */}
        {projects.map((project) => {
          const projectEpics = epics.filter((e) => e.project_id === project.id);
          if (projectEpics.length === 0) return null;

          return (
            <div key={project.id} className="space-y-3">
              <h2 className="text-sm font-semibold text-[#CCC] px-2">{project.name}</h2>
              {projectEpics.map((epic) => {
                const epicTasks = getTasksForEpic(epic.id);
                const isExpanded = expandedEpics[epic.id];

                return (
                  <div key={epic.id} className="bg-[#111] border border-[#1E1E1E] rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleEpic(epic.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#161616] transition-colors group"
                    >
                      <div className="text-[#999] group-hover:text-white">
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </div>
                      <EpicCard epic={epic} />
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[#1E1E1E] bg-[#0D0D0D]">
                        <div className="p-4 space-y-2">
                          {epicTasks.length === 0 ? (
                            <p className="text-xs text-[#555] py-4 text-center">
                              No tasks in this epic
                            </p>
                          ) : (
                            epicTasks.map((task) => (
                              <TaskCard key={task.id} task={task} />
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Global backlog (tasks without epic) */}
        {getBacklogTasks().length > 0 && (
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Backlog (No Epic)</h3>
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