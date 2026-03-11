import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List, ChevronRight } from "lucide-react";
import CreateEpicModal from "@/components/admin/CreateEpicModal";

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

  const getProjectName = (projectId) => {
    return projects.find((p) => p.id === projectId)?.name || "No project";
  };

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D]">
      {/* Header */}
      <div className="p-6 border-b border-[#1E1E1E]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Epics</h1>
          <div className="flex gap-2">
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("grid")}
              className="bg-[#5E6AD2]"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("list")}
              className="bg-[#5E6AD2]"
            >
              <List className="w-4 h-4" />
            </Button>
            <CreateEpicModal projects={projects} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#666]" />
              <Input
                placeholder="Search epics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[#1A1A1A] border-[#333] text-white placeholder-[#666]"
              />
            </div>
          </div>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-40 bg-[#1A1A1A] border-[#333] text-white">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#333]">
              <SelectItem value={null}>All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-[#1A1A1A] border-[#333] text-white">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#333]">
              <SelectItem value={null}>All statuses</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredEpics.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-[#999] mb-2">No epics found</p>
              <p className="text-[#666] text-sm">Create an epic to get started</p>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEpics.map((epic) => (
              <div
                key={epic.id}
                onClick={() => setSelectedEpic(epic)}
                className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4 cursor-pointer hover:border-[#333] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white flex-1 pr-2">{epic.title}</h3>
                  <ChevronRight className="w-4 h-4 text-[#666]" />
                </div>
                {epic.description && <p className="text-sm text-[#999] mb-3 line-clamp-2">{epic.description}</p>}
                <div className="flex gap-2 flex-wrap mb-3">
                  <Badge className={`text-xs ${statusColors[epic.status] || statusColors.backlog}`}>
                    {epic.status}
                  </Badge>
                  {epic.priority && <Badge className={`text-xs ${priorityColors[epic.priority] || priorityColors.none}`}>{epic.priority}</Badge>}
                </div>
                <div className="text-xs text-[#666]">
                  <p>{getProjectName(epic.project_id)}</p>
                  <p className="mt-1">{getEpicIssues(epic.id).length} issues</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEpics.map((epic) => (
              <div
                key={epic.id}
                onClick={() => setSelectedEpic(epic)}
                className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-[#333] transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{epic.title}</h3>
                    <Badge className={statusColors[epic.status] || statusColors.backlog}>{epic.status}</Badge>
                    {epic.priority && <Badge className={priorityColors[epic.priority] || priorityColors.none}>{epic.priority}</Badge>}
                  </div>
                  <p className="text-sm text-[#999]">{getProjectName(epic.project_id)}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm text-[#666]">{getEpicIssues(epic.id).length} issues</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#666]" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEpic && (
        <Dialog open={!!selectedEpic} onOpenChange={() => setSelectedEpic(null)}>
          <DialogContent className="bg-[#1A1A1A] border-[#333] max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedEpic.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEpic.description && (
                <div>
                  <h3 className="text-sm font-semibold text-[#CCC] mb-2">Description</h3>
                  <p className="text-[#999]">{selectedEpic.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#CCC] mb-2">Status</h3>
                  <Badge className={statusColors[selectedEpic.status] || statusColors.backlog}>{selectedEpic.status}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#CCC] mb-2">Priority</h3>
                  <Badge className={priorityColors[selectedEpic.priority] || priorityColors.none}>
                    {selectedEpic.priority || "None"}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#CCC] mb-2">Project</h3>
                  <p className="text-[#999]">{getProjectName(selectedEpic.project_id)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#CCC] mb-3">Linked Issues ({getEpicIssues(selectedEpic.id).length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getEpicIssues(selectedEpic.id).length === 0 ? (
                    <p className="text-sm text-[#666]">No issues linked to this epic</p>
                  ) : (
                    getEpicIssues(selectedEpic.id).map((issue) => (
                      <div key={issue.id} className="p-3 bg-[#0D0D0D] border border-[#252525] rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-white text-sm">{issue.title}</p>
                            <p className="text-xs text-[#666] mt-1">{issue.description}</p>
                          </div>
                          <Badge className={statusColors[issue.status] || statusColors.backlog} size="sm">
                            {issue.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}