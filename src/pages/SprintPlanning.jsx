import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus, GripVertical, Clock, Target, ChevronDown, ChevronRight, Calendar, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SPRINT_CAPACITY = 80; // default hours per sprint

const priorityColors = {
  urgent: "#F87171", high: "#FB923C", medium: "#FACC15", low: "#60A5FA",
};
const statusColors = {
  todo: "#6B6B6B", in_progress: "#FACC15", in_review: "#60A5FA", done: "#4ADE80",
};

function SprintCapacityBar({ sprintTasks, capacity = SPRINT_CAPACITY }) {
  const totalHours = sprintTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
  const pct = Math.min((totalHours / capacity) * 100, 100);
  const over = totalHours > capacity;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#999]">{totalHours}h / {capacity}h capacity</span>
        <span className={over ? "text-red-400 font-semibold" : "text-[#999]"}>
          {over ? `${totalHours - capacity}h over` : `${capacity - totalHours}h remaining`}
        </span>
      </div>
      <div className="h-2 bg-[#1E1E1E] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${over ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-[#5E6AD2]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TaskCard({ task, provided, snapshot }) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`border rounded-lg px-3 py-2.5 flex items-center gap-2.5 transition-all ${
        snapshot.isDragging
          ? "border-[#5E6AD2] bg-[#1A1A2E] shadow-lg"
          : "border-[#252525] bg-[#111] hover:border-[#333]"
      }`}
    >
      <div {...provided.dragHandleProps} className="text-[#444] hover:text-[#777] cursor-grab flex-shrink-0">
        <GripVertical size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{task.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {task.priority && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: `${priorityColors[task.priority]}20`, color: priorityColors[task.priority] }}>
              {task.priority}
            </span>
          )}
          <span className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${statusColors[task.status]}20`, color: statusColors[task.status] }}>
            {task.status?.replace("_", " ")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-[#555] flex-shrink-0">
        <Clock size={11} />
        <span className="text-[11px]">{task.estimated_hours || 0}h</span>
      </div>
    </div>
  );
}

export default function SprintPlanning() {
  const queryClient = useQueryClient();
  const [showNewSprint, setShowNewSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [newSprintGoal, setNewSprintGoal] = useState("");
  const [newSprintStart, setNewSprintStart] = useState("");
  const [newSprintEnd, setNewSprintEnd] = useState("");
  const [newSprintProject, setNewSprintProject] = useState("");
  const [expandedSprints, setExpandedSprints] = useState({});

  const { data: tasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 500),
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ["all-sprints"],
    queryFn: () => base44.entities.Sprint.list("-created_date", 100),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const createSprintMutation = useMutation({
    mutationFn: (data) => base44.entities.Sprint.create(data),
    onSuccess: (sprint) => {
      queryClient.invalidateQueries({ queryKey: ["all-sprints"] });
      setShowNewSprint(false);
      setNewSprintName("");
      setNewSprintGoal("");
      setNewSprintStart("");
      setNewSprintEnd("");
      setNewSprintProject("");
      // Auto-expand new sprint
      setExpandedSprints(prev => ({ ...prev, [sprint.id]: true }));
    },
  });

  const assignSprintMutation = useMutation({
    mutationFn: ({ taskId, sprint_id }) => base44.entities.Task.update(taskId, { sprint_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
    },
  });

  // Unassigned tasks (no sprint_id)
  const unassignedTasks = useMemo(
    () => tasks.filter((t) => !t.sprint_id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [tasks]
  );

  // Active/planned sprints only (not completed)
  const activeSprints = useMemo(
    () => sprints.filter((s) => s.status !== "completed"),
    [sprints]
  );

  const getSprintTasks = (sprintId) =>
    tasks.filter((t) => t.sprint_id === sprintId);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const targetSprintId = destination.droppableId === "unassigned" ? null : destination.droppableId;
    assignSprintMutation.mutate({ taskId: draggableId, sprint_id: targetSprintId });
  };

  const handleCreateSprint = () => {
    if (!newSprintName.trim()) return;
    createSprintMutation.mutate({
      name: newSprintName.trim(),
      goal: newSprintGoal.trim() || undefined,
      start_date: newSprintStart || undefined,
      end_date: newSprintEnd || undefined,
      project_id: newSprintProject || undefined,
      status: "planned",
    });
  };

  const toggleSprint = (sprintId) => {
    setExpandedSprints(prev => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  return (
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D] z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Sprint Planning</h1>
            <p className="text-sm text-[#999] mt-1">
              Drag unassigned tasks into sprints to plan capacity
            </p>
          </div>
          <Button onClick={() => setShowNewSprint(true)} className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90">
            <Plus size={16} className="mr-2" />
            New Sprint
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="p-6 flex gap-6 items-start">
          {/* Unassigned Backlog */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-[#111] border border-[#1E1E1E] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1E1E1E]">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <Zap size={15} className="text-[#FACC15]" />
                    Unassigned
                  </h2>
                  <span className="text-xs bg-[#1E1E1E] text-[#999] px-2 py-0.5 rounded-full">
                    {unassignedTasks.length} tasks
                  </span>
                </div>
                <p className="text-xs text-[#555] mt-1">
                  {unassignedTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0)}h estimated
                </p>
              </div>
              <Droppable droppableId="unassigned">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 space-y-2 min-h-[100px] transition-colors ${snapshot.isDraggingOver ? "bg-[#1A1A1A]" : ""}`}
                  >
                    {unassignedTasks.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-xs text-[#444] text-center py-6">All tasks are assigned to sprints</p>
                    )}
                    {unassignedTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <TaskCard task={task} provided={provided} snapshot={snapshot} />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Sprints */}
          <div className="flex-1 space-y-4">
            {activeSprints.length === 0 && (
              <div className="text-center py-20 text-[#555]">
                <Target size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No active sprints yet.</p>
                <p className="text-xs mt-1">Create a sprint to start planning.</p>
              </div>
            )}
            {activeSprints.map((sprint) => {
              const sprintTasks = getSprintTasks(sprint.id);
              const isExpanded = expandedSprints[sprint.id] !== false; // default expanded
              const project = projects.find(p => p.id === sprint.project_id);

              return (
                <div key={sprint.id} className="bg-[#111] border border-[#1E1E1E] rounded-xl overflow-hidden">
                  {/* Sprint header */}
                  <div className="px-4 py-3 border-b border-[#1E1E1E]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => toggleSprint(sprint.id)}
                          className="text-[#555] hover:text-white transition-colors flex-shrink-0"
                        >
                          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white truncate">{sprint.name}</h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                              sprint.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-[#252525] text-[#999]"
                            }`}>
                              {sprint.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {project && (
                              <span className="text-[11px] text-[#5E6AD2]">{project.name}</span>
                            )}
                            {sprint.start_date && sprint.end_date && (
                              <span className="text-[11px] text-[#555] flex items-center gap-1">
                                <Calendar size={10} />
                                {sprint.start_date} → {sprint.end_date}
                              </span>
                            )}
                          </div>
                          {sprint.goal && (
                            <p className="text-xs text-[#666] mt-1 truncate">{sprint.goal}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-[#555] flex-shrink-0 mt-1">
                        {sprintTasks.length} task{sprintTasks.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {/* Capacity bar */}
                    <div className="mt-3">
                      <SprintCapacityBar sprintTasks={sprintTasks} />
                    </div>
                  </div>

                  {/* Sprint droppable */}
                  {isExpanded && (
                    <Droppable droppableId={sprint.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3 space-y-2 min-h-[60px] transition-colors ${snapshot.isDraggingOver ? "bg-[#1A1A2E]" : ""}`}
                        >
                          {sprintTasks.length === 0 && !snapshot.isDraggingOver && (
                            <p className="text-xs text-[#333] text-center py-4">
                              Drag tasks here to add to this sprint
                            </p>
                          )}
                          {sprintTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <TaskCard task={task} provided={provided} snapshot={snapshot} />
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* New Sprint Dialog */}
      <Dialog open={showNewSprint} onOpenChange={setShowNewSprint}>
        <DialogContent className="bg-[#161616] border-[#2A2A2A] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create Sprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-[#999] mb-1 block">Sprint Name *</label>
              <Input
                value={newSprintName}
                onChange={e => setNewSprintName(e.target.value)}
                placeholder="e.g. Sprint 1"
                className="bg-[#1A1A1A] border-[#333] text-white"
                onKeyDown={e => e.key === "Enter" && handleCreateSprint()}
              />
            </div>
            <div>
              <label className="text-xs text-[#999] mb-1 block">Project</label>
              <Select value={newSprintProject} onValueChange={setNewSprintProject}>
                <SelectTrigger className="bg-[#1A1A1A] border-[#333] text-white">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-white">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-[#999] mb-1 block">Goal</label>
              <Input
                value={newSprintGoal}
                onChange={e => setNewSprintGoal(e.target.value)}
                placeholder="Sprint goal..."
                className="bg-[#1A1A1A] border-[#333] text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#999] mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={newSprintStart}
                  onChange={e => setNewSprintStart(e.target.value)}
                  className="bg-[#1A1A1A] border-[#333] text-white"
                />
              </div>
              <div>
                <label className="text-xs text-[#999] mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={newSprintEnd}
                  onChange={e => setNewSprintEnd(e.target.value)}
                  className="bg-[#1A1A1A] border-[#333] text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNewSprint(false)} className="text-[#999]">Cancel</Button>
            <Button
              onClick={handleCreateSprint}
              disabled={!newSprintName.trim() || createSprintMutation.isPending}
              className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
            >
              Create Sprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}