import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List, ChevronRight, Edit } from "lucide-react";
import CreateEpicModal from "@/components/admin/CreateEpicModal";
import EditEpicModal from "@/components/admin/EditEpicModal";
import EpicActivityFeed from "@/components/activity/EpicActivityFeed";

const priorityColors = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
  none: "bg-gray-100 text-gray-800",
};

const statusColors = {
  backlog: "bg-[#333] text-[#CCC]",
  todo: "bg-[#444] text-[#EEE]",
  in_progress: "bg-blue-900 text-blue-200",
  in_review: "bg-purple-900 text-purple-200",
  done: "bg-green-900 text-green-200",
};

export default function EpicsPage() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedEpic, setSelectedEpic] = useState(null);
  const [editingEpic, setEditingEpic] = useState(null);

  const { data: epics = [] } = useQuery({
    queryKey: ["all-epics"],
    queryFn: () => base44.entities.Epic.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["all-issues"],
    queryFn: () => base44.entities.Issue.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => base44.entities.Task.list(),
  });

  const filteredEpics = useMemo(() => {
    return epics.filter((epic) => {
      const matchSearch = epic.title?.toLowerCase().includes(search.toLowerCase());
      const matchProject = !filterProject || epic.project_id === filterProject;
      const matchStatus = !filterStatus || epic.status === filterStatus;
      return matchSearch && matchProject && matchStatus;
    });
  }, [epics, search, filterProject, filterStatus]);

  const getEpicIssues = (epicId) => {
    return issues.filter((issue) => issue.epic_id === epicId);
  };

  const getEpicTasks = (epicId) => {
    return tasks.filter((task) => task.epic_id === epicId);
  };

  const getEpicStoryPoints = (epicId) => {
    const epicTasks = getEpicTasks(epicId);
    return epicTasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
  };

  const getProjectName = (projectId) => {
    return projects.find((p) => p.id === projectId)?.name || "No project";
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "var(--pm-bg)" }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: "var(--pm-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--pm-text)" }}>Epics</h1>
          <div className="flex gap-2">
            <Button variant={view === "grid" ? "default" : "outline"} size="icon" onClick={() => setView("grid")} className="bg-[#5E6AD2]"><Grid className="w-4 h-4" /></Button>
            <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")} className="bg-[#5E6AD2]"><List className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--pm-text-muted)" }} />
              <Input placeholder="Search epics..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }} />
            </div>
          </div>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-40" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
              <SelectItem value={null}>All projects</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border-light)", color: "var(--pm-text)" }}>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
              <SelectItem value={null}>All statuses</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredEpics.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="mb-2" style={{ color: "var(--pm-text-secondary)" }}>No epics found</p>
              <p className="text-sm" style={{ color: "var(--pm-text-muted)" }}>Create an epic to get started</p>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEpics.map((epic) => (
              <div key={epic.id} onClick={() => setSelectedEpic(epic)} className="border rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold flex-1 pr-2" style={{ color: "var(--pm-text)" }}>{epic.title}</h3>
                  <ChevronRight className="w-4 h-4" style={{ color: "var(--pm-text-muted)" }} />
                </div>
                {epic.description && <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--pm-text-secondary)" }}>{epic.description}</p>}
                <div className="flex gap-2 flex-wrap mb-3">
                  <Badge className={`text-xs ${statusColors[epic.status] || statusColors.backlog}`}>{epic.status}</Badge>
                  {epic.priority && <Badge className={`text-xs ${priorityColors[epic.priority] || priorityColors.none}`}>{epic.priority}</Badge>}
                </div>
                <div className="text-xs" style={{ color: "var(--pm-text-muted)" }}>
                  <p>{getProjectName(epic.project_id)}</p>
                  <div className="mt-2 space-y-1">
                    <p>{getEpicIssues(epic.id).length} issues</p>
                    <p>{getEpicTasks(epic.id).length} tasks</p>
                    <p>{getEpicStoryPoints(epic.id)} story points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEpics.map((epic) => (
              <div key={epic.id} onClick={() => setSelectedEpic(epic)} className="border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold" style={{ color: "var(--pm-text)" }}>{epic.title}</h3>
                    <Badge className={statusColors[epic.status] || statusColors.backlog}>{epic.status}</Badge>
                    {epic.priority && <Badge className={priorityColors[epic.priority] || priorityColors.none}>{epic.priority}</Badge>}
                  </div>
                  <p className="text-sm" style={{ color: "var(--pm-text-secondary)" }}>{getProjectName(epic.project_id)}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm" style={{ color: "var(--pm-text-muted)" }}>{getEpicIssues(epic.id).length} issues • {getEpicTasks(epic.id).length} tasks • {getEpicStoryPoints(epic.id)} pts</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: "var(--pm-text-muted)" }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEpic && (
        <Dialog open={!!selectedEpic} onOpenChange={() => setSelectedEpic(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: "var(--pm-popover)", borderColor: "var(--pm-border-light)" }}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle style={{ color: "var(--pm-text)" }}>{selectedEpic.title}</DialogTitle>
                <Button size="sm" variant="outline" onClick={() => { setEditingEpic(selectedEpic); setSelectedEpic(null); }} style={{ borderColor: "var(--pm-border-light)", color: "var(--pm-text-secondary)" }}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEpic.description && (
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--pm-text-secondary)" }}>Description</h3>
                  <p style={{ color: "var(--pm-text-secondary)" }}>{selectedEpic.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--pm-text-secondary)" }}>Status</h3>
                  <Badge className={statusColors[selectedEpic.status] || statusColors.backlog}>{selectedEpic.status}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--pm-text-secondary)" }}>Priority</h3>
                  <Badge className={priorityColors[selectedEpic.priority] || priorityColors.none}>{selectedEpic.priority || "None"}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--pm-text-secondary)" }}>Project</h3>
                  <p style={{ color: "var(--pm-text-secondary)" }}>{getProjectName(selectedEpic.project_id)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-3 border rounded" style={{ backgroundColor: "var(--pm-bg)", borderColor: "var(--pm-border-light)" }}>
                {[["Issues", getEpicIssues(selectedEpic.id).length], ["Tasks", getEpicTasks(selectedEpic.id).length], ["Story Points", getEpicStoryPoints(selectedEpic.id)]].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs" style={{ color: "var(--pm-text-muted)" }}>{label}</p>
                    <p className="text-lg font-semibold" style={{ color: "var(--pm-text)" }}>{val}</p>
                  </div>
                ))}
              </div>
              {[["Linked Issues", getEpicIssues(selectedEpic.id)], ["Linked Tasks", getEpicTasks(selectedEpic.id)]].map(([label, items]) => (
                <div key={label}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--pm-text-secondary)" }}>{label} ({items.length})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--pm-text-muted)" }}>None linked</p>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="p-3 border rounded" style={{ backgroundColor: "var(--pm-bg)", borderColor: "var(--pm-border-light)" }}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm" style={{ color: "var(--pm-text)" }}>{item.title}</p>
                              {item.description && <p className="text-xs mt-1" style={{ color: "var(--pm-text-muted)" }}>{item.description}</p>}
                            </div>
                            <Badge className={statusColors[item.status] || statusColors.backlog} size="sm">{item.status}</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--pm-text-secondary)" }}>Activity</h3>
                <EpicActivityFeed epic={selectedEpic} issues={getEpicIssues(selectedEpic.id)} tasks={getEpicTasks(selectedEpic.id)} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <EditEpicModal
        epic={editingEpic}
        open={!!editingEpic}
        onClose={() => setEditingEpic(null)}
        projects={projects}
      />
    </div>
  );
}