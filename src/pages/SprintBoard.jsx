import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Play, CheckCircle2, MoreHorizontal, Calendar, User, Flag, ChevronDown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

const STATUSES = [
  { id: "todo", label: "To Do", color: "#666" },
  { id: "in_progress", label: "In Progress", color: "#60A5FA" },
  { id: "in_review", label: "In Review", color: "#A78BFA" },
  { id: "done", label: "Done", color: "#4ADE80" },
];

const PRIORITY_COLORS = { urgent: "#F87171", high: "#FB923C", medium: "#FACC15", low: "#666" };

function IssueCard({ issue, index, onClick }) {
  return (
    <Draggable draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(issue)}
          className={`bg-[#161616] border rounded-lg p-3 cursor-pointer transition-colors mb-2 ${
            snapshot.isDragging ? "border-[#5E6AD2] shadow-lg shadow-[#5E6AD2]/20" : "border-[#252525] hover:border-[#333]"
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm text-white font-medium leading-tight">{issue.title}</p>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ backgroundColor: PRIORITY_COLORS[issue.priority] || "#666" }}
              title={issue.priority}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {issue.assignee && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-[#5E6AD2] flex items-center justify-center text-[8px] font-bold text-white">
                  {issue.assignee[0]?.toUpperCase()}
                </div>
              </div>
            )}
            {issue.due_date && (
              <span className="flex items-center gap-1 text-[10px] text-[#666]">
                <Calendar className="w-2.5 h-2.5" />
                {format(new Date(issue.due_date), "MMM d")}
              </span>
            )}
            {issue.labels?.slice(0, 2).map((l) => (
              <span key={l} className="text-[9px] bg-[#252525] text-[#888] px-1.5 py-0.5 rounded">{l}</span>
            ))}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function SprintBoard() {
  const [selectedProject, setSelectedProject] = useState("");
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [sprintForm, setSprintForm] = useState({ name: "", start_date: "", end_date: "", goal: "" });
  const [issueForm, setIssueForm] = useState({ title: "", priority: "medium", assignee: "" });
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: () => base44.entities.Project.list() });
  const { data: sprints = [] } = useQuery({ queryKey: ["sprints"], queryFn: () => base44.entities.Sprint.list("-created_date") });
  const { data: issues = [] } = useQuery({ queryKey: ["all-issues-board"], queryFn: () => base44.entities.Issue.list("-created_date", 300) });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => base44.entities.User.list() });

  const project = projects.find((p) => p.id === selectedProject);
  const projectSprints = sprints.filter((s) => s.project_id === selectedProject);
  const activeSprint = projectSprints.find((s) => s.status === "active");
  const sprintIssues = issues.filter((i) => i.sprint_id === activeSprint?.id);

  const createSprintMutation = useMutation({
    mutationFn: (data) => base44.entities.Sprint.create({ ...data, project_id: selectedProject, status: "planned" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sprints"] }); setShowCreateSprint(false); setSprintForm({ name: "", start_date: "", end_date: "", goal: "" }); },
  });

  const startSprintMutation = useMutation({
    mutationFn: (id) => base44.entities.Sprint.update(id, { status: "active", start_date: new Date().toISOString().split("T")[0] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sprints"] }),
  });

  const completeSprintMutation = useMutation({
    mutationFn: (id) => base44.entities.Sprint.update(id, { status: "completed", end_date: new Date().toISOString().split("T")[0] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sprints"] }),
  });

  const createIssueMutation = useMutation({
    mutationFn: (data) => base44.entities.Issue.create({ ...data, project_id: selectedProject, sprint_id: activeSprint?.id, status: "todo" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["all-issues-board"] }); setShowCreateIssue(false); setIssueForm({ title: "", priority: "medium", assignee: "" }); },
  });

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Issue.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-issues-board"] }),
  });

  const handleDragEnd = (result) => {
    const { draggableId, destination } = result;
    if (!destination) return;
    const issue = sprintIssues.find((i) => i.id === draggableId);
    if (issue && issue.status !== destination.droppableId) {
      updateIssueMutation.mutate({ id: draggableId, data: { status: destination.droppableId } });
    }
  };

  const byStatus = useMemo(() => {
    const map = {};
    STATUSES.forEach((s) => { map[s.id] = sprintIssues.filter((i) => i.status === s.id); });
    return map;
  }, [sprintIssues]);

  const plannedSprints = projectSprints.filter((s) => s.status === "planned");

  const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.story_points || 0), 0);
  const donePoints = sprintIssues.filter((i) => i.status === "done").reduce((sum, i) => sum + (i.story_points || 0), 0);

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D]">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#1E1E1E] flex items-center gap-4 flex-shrink-0">
        <h1 className="text-sm font-semibold text-white">Sprint Board</h1>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-[#1A1A1A] border border-[#333] text-white rounded px-2 py-1 text-sm"
        >
          <option value="">Select project...</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
        </select>

        {selectedProject && (
          <div className="flex items-center gap-2 ml-auto">
            {activeSprint ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-white font-medium">{activeSprint.name}</span>
                  {activeSprint.end_date && (
                    <span className="text-xs text-[#666]">ends {format(new Date(activeSprint.end_date), "MMM d")}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => showCreateIssue ? null : setShowCreateIssue(true)}
                  className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white h-7 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Issue
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => confirm("Complete this sprint?") && completeSprintMutation.mutate(activeSprint.id)}
                  className="border-green-500/40 text-green-400 hover:bg-green-900/20 h-7 text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Complete Sprint
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowCreateSprint(true)}
                className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white h-7 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Sprint
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {!selectedProject ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Target className="w-12 h-12 mx-auto mb-3 text-[#333]" />
            <p className="text-[#666] text-sm">Select a project to manage sprints</p>
          </div>
        </div>
      ) : !activeSprint ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Play className="w-12 h-12 mx-auto mb-3 text-[#333]" />
            <p className="text-white font-semibold mb-1">No active sprint</p>
            {plannedSprints.length > 0 ? (
              <div className="space-y-2 mt-4">
                {plannedSprints.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 bg-[#111] border border-[#1E1E1E] rounded-lg px-4 py-3">
                    <span className="text-sm text-white flex-1">{s.name}</span>
                    <Button
                      size="sm"
                      onClick={() => startSprintMutation.mutate(s.id)}
                      className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white h-7 text-xs"
                    >
                      <Play className="w-3 h-3 mr-1" /> Start
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#666]">Create a sprint to start tracking work</p>
            )}
            <Button
              onClick={() => setShowCreateSprint(true)}
              variant="outline"
              className="border-[#333] text-[#999] mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Sprint
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Sprint stats */}
          {(totalPoints > 0 || sprintIssues.length > 0) && (
            <div className="px-5 py-2 border-b border-[#1E1E1E] flex items-center gap-6 text-xs text-[#666]">
              <span>{sprintIssues.length} issues</span>
              {totalPoints > 0 && <span>{donePoints}/{totalPoints} story points</span>}
              {totalPoints > 0 && (
                <div className="flex-1 max-w-40 h-1.5 bg-[#252525] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4ADE80] rounded-full transition-all" style={{ width: `${Math.round((donePoints / totalPoints) * 100)}%` }} />
                </div>
              )}
              {activeSprint.goal && (
                <span className="text-[#5E6AD2] flex items-center gap-1">
                  <Target className="w-3 h-3" /> {activeSprint.goal}
                </span>
              )}
            </div>
          )}

          {/* Kanban board */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-0">
              {STATUSES.map((status) => (
                <Droppable droppableId={status.id} key={status.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-w-[220px] flex flex-col border-r border-[#1E1E1E] last:border-r-0 transition-colors ${snapshot.isDraggingOver ? "bg-[#111]" : ""}`}
                    >
                      <div className="px-4 py-3 border-b border-[#1E1E1E] flex items-center gap-2 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                        <span className="text-xs font-semibold text-[#CCC] uppercase tracking-wider">{status.label}</span>
                        <span className="text-xs text-[#555] ml-auto">{byStatus[status.id]?.length || 0}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3">
                        {byStatus[status.id]?.map((issue, idx) => (
                          <IssueCard key={issue.id} issue={issue} index={idx} onClick={setSelectedIssue} />
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Create Sprint Dialog */}
      <Dialog open={showCreateSprint} onOpenChange={setShowCreateSprint}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] text-white max-w-md">
          <DialogHeader><DialogTitle>Create Sprint</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-[#999] mb-1.5 block">Sprint Name</Label>
              <Input value={sprintForm.name} onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })} className="bg-[#111] border-[#333] text-white" placeholder="Sprint 1" />
            </div>
            <div>
              <Label className="text-xs text-[#999] mb-1.5 block">Sprint Goal (optional)</Label>
              <Input value={sprintForm.goal} onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })} className="bg-[#111] border-[#333] text-white" placeholder="What's the goal of this sprint?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-[#999] mb-1.5 block">Start Date</Label>
                <Input type="date" value={sprintForm.start_date} onChange={(e) => setSprintForm({ ...sprintForm, start_date: e.target.value })} className="bg-[#111] border-[#333] text-white" />
              </div>
              <div>
                <Label className="text-xs text-[#999] mb-1.5 block">End Date</Label>
                <Input type="date" value={sprintForm.end_date} onChange={(e) => setSprintForm({ ...sprintForm, end_date: e.target.value })} className="bg-[#111] border-[#333] text-white" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateSprint(false)} className="text-[#999]">Cancel</Button>
            <Button onClick={() => sprintForm.name && createSprintMutation.mutate(sprintForm)} disabled={!sprintForm.name || createSprintMutation.isPending} className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white">Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Issue Dialog */}
      <Dialog open={showCreateIssue} onOpenChange={setShowCreateIssue}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] text-white max-w-md">
          <DialogHeader><DialogTitle>Add Issue to Sprint</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-[#999] mb-1.5 block">Title</Label>
              <Input value={issueForm.title} onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })} className="bg-[#111] border-[#333] text-white" placeholder="Issue title..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-[#999] mb-1.5 block">Priority</Label>
                <select value={issueForm.priority} onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })} className="w-full bg-[#111] border border-[#333] text-white rounded px-2 py-2 text-sm">
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <Label className="text-xs text-[#999] mb-1.5 block">Assignee</Label>
                <select value={issueForm.assignee} onChange={(e) => setIssueForm({ ...issueForm, assignee: e.target.value })} className="w-full bg-[#111] border border-[#333] text-white rounded px-2 py-2 text-sm">
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u.id} value={u.email}>{u.full_name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateIssue(false)} className="text-[#999]">Cancel</Button>
            <Button onClick={() => issueForm.title && createIssueMutation.mutate(issueForm)} disabled={!issueForm.title || createIssueMutation.isPending} className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white">Add Issue</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}