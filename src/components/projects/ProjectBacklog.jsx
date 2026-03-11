import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Play, CheckCircle2, ChevronDown, ChevronRight, Calendar, Flag } from "lucide-react";
import { format } from "date-fns";

const priorityColors = {
  urgent: "#F87171", high: "#FB923C", medium: "#FACC15", low: "#60A5FA", none: "#555",
};
const statusColors = {
  backlog: "#555", todo: "#6B6B6B", in_progress: "#FACC15", in_review: "#60A5FA", done: "#4ADE80", cancelled: "#F87171",
};

function BacklogIssueRow({ issue, index, onIssueClick }) {
  return (
    <Draggable draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onIssueClick?.(issue)}
          className={`flex items-center gap-3 px-3 py-2 rounded-md border transition-all text-sm group cursor-pointer ${
            snapshot.isDragging
              ? "border-[#5E6AD2] bg-[#1E1E1E] shadow-xl rotate-[0.5deg]"
              : "border-[#1A1A1A] bg-[#0D0D0D] hover:border-[#2A2A2A] hover:bg-[#111]"
          }`}
        >
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[issue.status] || "#555" }} />
          {issue.issue_number && (
            <span className="text-[10px] font-mono text-[#444] flex-shrink-0">#{issue.issue_number}</span>
          )}
          <span className="flex-1 text-[#CCC] group-hover:text-white truncate text-sm">{issue.title}</span>
          {issue.priority && issue.priority !== "none" && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded capitalize flex-shrink-0"
              style={{ backgroundColor: `${priorityColors[issue.priority]}20`, color: priorityColors[issue.priority] }}
            >
              {issue.priority}
            </span>
          )}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded capitalize flex-shrink-0"
            style={{ backgroundColor: `${statusColors[issue.status]}18`, color: statusColors[issue.status] }}
          >
            {issue.status?.replace(/_/g, " ")}
          </span>
          {issue.assignee && (
            <span className="text-[10px] text-[#555] flex-shrink-0 truncate max-w-[70px]">
              {issue.assignee.split("@")[0]}
            </span>
          )}
        </div>
      )}
    </Draggable>
  );
}

function SprintSection({ sprint, issues, isExpanded, onToggle, onStart, onComplete, onIssueClick }) {
  const done = issues.filter(i => i.status === "done" || i.status === "cancelled").length;
  const progress = issues.length > 0 ? Math.round((done / issues.length) * 100) : 0;
  const isCompleted = sprint.status === "completed";

  return (
    <div className={`border rounded-lg overflow-hidden ${isCompleted ? "border-[#1A1A1A] opacity-60" : "border-[#1E1E1E]"}`}>
      {/* Sprint header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-[#111] hover:bg-[#141414] transition-colors">
        <button onClick={onToggle} className="text-[#555] hover:text-white transition-colors flex-shrink-0">
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: sprint.status === "active" ? "#4ADE80" : sprint.status === "completed" ? "#444" : "#FACC15" }}
        />
        <span className="text-sm font-medium text-white flex-1">{sprint.name}</span>

        {sprint.status === "active" && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4ADE80]/10 text-[#4ADE80] font-medium">Active</span>
        )}

        {sprint.start_date && sprint.end_date && (
          <span className="text-[11px] text-[#555] flex items-center gap-1 flex-shrink-0">
            <Calendar size={10} />
            {format(new Date(sprint.start_date), "MMM d")} – {format(new Date(sprint.end_date), "MMM d")}
          </span>
        )}

        <span className="text-[11px] text-[#555] flex-shrink-0">{issues.length} issues</span>

        {issues.length > 0 && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-16 h-1 bg-[#1E1E1E] rounded-full overflow-hidden">
              <div className="h-full bg-[#4ADE80] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-[#555]">{progress}%</span>
          </div>
        )}

        {sprint.status === "planned" && (
          <button
            onClick={(e) => { e.stopPropagation(); onStart(); }}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded bg-[#5E6AD2]/10 text-[#5E6AD2] hover:bg-[#5E6AD2]/20 transition-colors flex-shrink-0"
          >
            <Play size={9} /> Start
          </button>
        )}
        {sprint.status === "active" && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(); }}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded bg-[#4ADE80]/10 text-[#4ADE80] hover:bg-[#4ADE80]/20 transition-colors flex-shrink-0"
          >
            <CheckCircle2 size={9} /> Complete
          </button>
        )}
      </div>

      {/* Sprint issues (droppable) */}
      {isExpanded && (
        <Droppable droppableId={`sprint-${sprint.id}`} isDropDisabled={isCompleted}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-2 space-y-1 min-h-[52px] transition-colors ${
                snapshot.isDraggingOver ? "bg-[#1C1C2E]" : "bg-[#090909]"
              }`}
            >
              {issues.length === 0 && !snapshot.isDraggingOver && (
                <p className="text-[11px] text-[#333] text-center py-3">Drag issues here to add to sprint</p>
              )}
              {issues.map((issue, i) => (
                <BacklogIssueRow key={issue.id} issue={issue} index={i} onIssueClick={onIssueClick} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}

export default function ProjectBacklog({ projectId, issues, tasks, onIssueClick, onTaskClick }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState({});
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const items = tasks || issues || [];
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => { setLocalItems(items); }, [items]);

  const { data: sprints = [] } = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => base44.entities.Sprint.filter({ project_id: projectId }, "created_date"),
    enabled: !!projectId,
  });

  // Auto-expand active sprint
  useEffect(() => {
    const active = sprints.find(s => s.status === "active");
    if (active) setExpanded(prev => ({ ...prev, [active.id]: true }));
  }, [sprints]);

  const getSprintItems = (sprintId) => localItems.filter(i => i.sprint_id === sprintId);
  const backlogItems = localItems.filter(i => !i.sprint_id);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const dstId = destination.droppableId;
    const newSprintId = dstId === "backlog" ? null : dstId.replace("sprint-", "");

    // Optimistic update
    setLocalItems(prev =>
      prev.map(i => i.id === draggableId ? { ...i, sprint_id: newSprintId } : i)
    );

    const entity = tasks ? "Task" : "Issue";
    await base44.entities[entity].update(draggableId, { sprint_id: newSprintId });
    queryClient.invalidateQueries({ queryKey: tasks ? ["project-tasks", projectId] : ["project-issues", projectId] });
  };

  const handleCreateSprint = async () => {
    if (!newName.trim()) return;
    await base44.entities.Sprint.create({
      name: newName,
      project_id: projectId,
      status: "planned",
      ...(newStart && { start_date: newStart }),
      ...(newEnd && { end_date: newEnd }),
    });
    queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    setNewName(""); setNewStart(""); setNewEnd(""); setShowCreateSprint(false);
  };

  const handleStartSprint = async (sprint) => {
    await base44.entities.Sprint.update(sprint.id, { status: "active" });
    queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
  };

  const handleCompleteSprint = async (sprint) => {
    await base44.entities.Sprint.update(sprint.id, { status: "completed" });
    queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
  };

  const toggleExpanded = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const activeSprints = sprints.filter(s => s.status !== "completed");
  const completedSprints = sprints.filter(s => s.status === "completed");

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full overflow-y-auto p-5 space-y-3">

        {/* Sprints header */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-[#555] uppercase tracking-wider">Sprints</span>
          <button
            onClick={() => setShowCreateSprint(v => !v)}
            className="flex items-center gap-1 text-xs text-[#5E6AD2] hover:text-[#7C8FE8] transition-colors"
          >
            <Plus size={12} /> New Sprint
          </button>
        </div>

        {/* Create sprint inline form */}
        {showCreateSprint && (
          <div className="border border-[#252525] bg-[#111] rounded-lg p-3 space-y-2">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreateSprint()}
              placeholder="Sprint name (e.g. Sprint 1)"
              className="w-full bg-[#0D0D0D] border border-[#252525] rounded-md px-3 py-1.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#5E6AD2]"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-[#555] mb-1 block">Start date</label>
                <input
                  type="date"
                  value={newStart}
                  onChange={e => setNewStart(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#252525] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#5E6AD2]"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-[#555] mb-1 block">End date</label>
                <input
                  type="date"
                  value={newEnd}
                  onChange={e => setNewEnd(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#252525] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#5E6AD2]"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreateSprint(false)} className="text-xs px-3 py-1.5 text-[#666] hover:text-white transition-colors">Cancel</button>
              <button onClick={handleCreateSprint} className="text-xs px-3 py-1.5 bg-[#5E6AD2] text-white rounded-md hover:bg-[#5E6AD2]/90">Create</button>
            </div>
          </div>
        )}

        {/* Active + planned sprints */}
        {activeSprints.length === 0 && !showCreateSprint && (
          <div className="text-center py-8 text-[#333] text-sm border border-dashed border-[#1A1A1A] rounded-lg">
            No sprints yet — create one to start planning
          </div>
        )}
        {activeSprints.map(sprint => (
          <SprintSection
            key={sprint.id}
            sprint={sprint}
            issues={getSprintItems(sprint.id)}
            isExpanded={expanded[sprint.id] !== false}
            onToggle={() => toggleExpanded(sprint.id)}
            onStart={() => handleStartSprint(sprint)}
            onComplete={() => handleCompleteSprint(sprint)}
            onIssueClick={onIssueClick || onTaskClick}
          />
        ))}

        {/* Backlog */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-semibold text-[#555] uppercase tracking-wider">Backlog</span>
          <span className="text-[11px] text-[#333]">{backlogItems.length} items</span>
        </div>

        <Droppable droppableId="backlog">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-1 min-h-[60px] rounded-lg p-2 border transition-colors ${
                snapshot.isDraggingOver ? "bg-[#1C1C2E] border-[#5E6AD2]/30" : "bg-[#090909] border-[#161616]"
              }`}
            >
              {backlogItems.length === 0 && !snapshot.isDraggingOver && (
                <p className="text-[11px] text-[#2A2A2A] text-center py-4">All items are in a sprint</p>
              )}
              {backlogItems.map((issue, i) => (
                <BacklogIssueRow key={issue.id} issue={issue} index={i} onIssueClick={onIssueClick || onTaskClick} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Completed sprints */}
        {completedSprints.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-3">
              <span className="text-[11px] font-semibold text-[#333] uppercase tracking-wider">Completed Sprints</span>
            </div>
            {completedSprints.map(sprint => (
              <SprintSection
                key={sprint.id}
                sprint={sprint}
                issues={getSprintIssues(sprint.id)}
                isExpanded={expanded[sprint.id] || false}
                onToggle={() => toggleExpanded(sprint.id)}
                onIssueClick={onIssueClick}
              />
            ))}
          </>
        )}
      </div>
    </DragDropContext>
  );
}