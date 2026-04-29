import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Roadmap() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});

  const { data: projects = [] } = useQuery({
    queryKey: ["roadmap-projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["roadmap-epics"],
    queryFn: () => base44.entities.Epic.list("-created_date"),
  });

  const toggleProject = (projectId) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const getProjectEpics = (projectId) => {
    return epics.filter((e) => e.project_id === projectId).sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return new Date(a.start_date) - new Date(b.start_date);
    });
  };

  const filteredProjects = selectedProject
    ? projects.filter((p) => p.id === selectedProject)
    : projects;

  const projectsWithEpics = filteredProjects.filter(
    (p) => getProjectEpics(p.id).length > 0
  );

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: "var(--pm-bg)" }}>
      <div className="px-6 py-4 border-b sticky top-0" style={{ borderColor: "var(--pm-border)", backgroundColor: "var(--pm-bg)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--pm-text)" }}>Roadmap</h1>
            <p className="text-sm mt-1" style={{ color: "var(--pm-text-secondary)" }}>
              Long-term planning and epic timelines
            </p>
          </div>
        </div>

        <div className="w-48">
          <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
            <SelectTrigger className="border" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)", color: "var(--pm-text)" }}>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
              <SelectItem value={null}>All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-6 max-w-full">
        {projectsWithEpics.length === 0 ? (
          <div className="text-center py-12" style={{ color: "var(--pm-text-muted)" }}>
            <p className="text-sm">{selectedProject ? "No epics in this project" : "No epics across projects"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projectsWithEpics.map((project) => {
              const projectEpics = getProjectEpics(project.id);
              const isExpanded = expandedProjects[project.id] ?? true;

              return (
                <div key={project.id} className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--pm-border)" }}>
                  <button
                    onClick={() => toggleProject(project.id)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:opacity-80 transition-opacity group"
                    style={{ backgroundColor: "var(--pm-bg)" }}
                  >
                    <div style={{ color: "var(--pm-text-muted)" }}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || "#5E6AD2" }} />
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold" style={{ color: "var(--pm-text)" }}>{project.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "var(--pm-text-secondary)" }}>
                        {projectEpics.length} epic{projectEpics.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t p-4" style={{ borderColor: "var(--pm-border)", backgroundColor: "var(--pm-bg)" }}>
                      <RoadmapTimeline epics={projectEpics} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}