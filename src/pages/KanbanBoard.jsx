import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PriorityIcon, IssueStatusIcon } from "@/components/shared/StatusBadge";
import { LayoutGrid, ListTodo, Layers } from "lucide-react";

const TASK_COLUMNS = [
  { id: "todo",        label: "To Do",       color: "#6B6B6B" },
  { id: "in_progress", label: "In Progress",  color: "#FACC15" },
  { id: "in_review",   label: "In Review",    color: "#60A5FA" },
  { id: "done",        label: "Done",         color: "#4ADE80" },
];

const ISSUE_COLUMNS = [
  { id: "backlog",     label: "Backlog",      color: "#555555" },
  { id: "todo",        label: "To Do",        color: "#6B6B6B" },
  { id: "in_progress", label: "In Progress",  color: "#FACC15" },
  { id: "in_review",   label: "In Review",    color: "#60A5FA" },
  { id: "done",        label: "Done",         color: "#4ADE80" },
];

const priorityColors = {
  urgent: "#F87171", high: "#FB923C", medium: "#FACC15", low: "#60A5FA",
};

function KanbanColumn({ column, items, type, onItemClick }) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
        <span className="text-xs font-semibold text-[#999] uppercase tracking-wider">{column.label}</span>
        <span className="ml-auto text-xs text-[#555] bg-[#1A1A1A] px-1.5 py-0.5 rounded">{items.length}</span>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[120px] rounded-xl p-2 space-y-2 transition-colors ${
              snapshot.isDraggingOver ? "bg-[#1C1C2E] ring-1 ring-[#5E6AD2]/40" : "bg-[#111111]"
            }`}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onItemClick && onItemClick(item)}
                    className={`p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing group ${
                      snapshot.isDragging
                        ? "border-[#5E6AD2] bg-[#1E1E1E] shadow-2xl shadow-black/60 rotate-1"
                        : "border-[#1E1E1E] bg-[#161616] hover:border-[#333] hover:bg-[#1A1A1A]"
                    }`}
                  >
                    {type === "issue" && item.issue_number && (
                      <span className="text-[10px] font-mono text-[#555] mb-1 block">#{item.issue_number}</span>
                    )}
                    <p className="text-sm text-white font-medium leading-snug line-clamp-2">{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {item.priority && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize"
                          style={{
                            backgroundColor: `${priorityColors[item.priority]}20`,
                            color: priorityColors[item.priority],
                          }}
                        >
                          {item.priority}
                        </span>
                      )}
                      {type === "task" && item.story_points != null && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5E6AD2]/20 text-[#5E6AD2] font-medium">
                          {item.story_points}pts
                        </span>
                      )}
                      {item.due_date && (
                        <span className="text-[10px] text-[#666]">
                          {new Date(item.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                      {item.assignee && (
                        <span className="ml-auto text-[10px] text-[#666] truncate max-w-[80px]">
                          {item.assignee.split("@")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {items.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-16 text-[#333] text-xs border border-dashed border-[#1E1E1E] rounded-lg">
                Drop here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default function KanbanBoard() {
  const [mode, setMode] = useState("tasks"); // "tasks" | "issues"
  const [taskBoard, setTaskBoard] = useState({});
  const [issueBoard, setIssueBoard] = useState({});
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["kanban-tasks"],
    queryFn: () => base44.entities.Task.list("-updated_date", 300),
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["kanban-issues"],
    queryFn: () => base44.entities.Issue.list("-updated_date", 300),
  });

  useEffect(() => {
    const grouped = {};
    TASK_COLUMNS.forEach((col) => {
      grouped[col.id] = tasks.filter((t) => t.status === col.id);
    });
    setTaskBoard(grouped);
  }, [tasks]);

  useEffect(() => {
    const grouped = {};
    ISSUE_COLUMNS.forEach((col) => {
      grouped[col.id] = issues.filter((i) => i.status === col.id);
    });
    setIssueBoard(grouped);
  }, [issues]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;
    const isTask = mode === "tasks";
    const board = isTask ? { ...taskBoard } : { ...issueBoard };

    const srcItems = Array.from(board[srcCol] || []);
    const [moved] = srcItems.splice(source.index, 1);

    if (srcCol === dstCol) {
      srcItems.splice(destination.index, 0, moved);
      board[srcCol] = srcItems;
    } else {
      const dstItems = Array.from(board[dstCol] || []);
      const updatedItem = { ...moved, status: dstCol };
      dstItems.splice(destination.index, 0, updatedItem);
      board[srcCol] = srcItems;
      board[dstCol] = dstItems;

      // Optimistic update
      if (isTask) {
        setTaskBoard({ ...board });
        await base44.entities.Task.update(draggableId, { status: dstCol });
        queryClient.invalidateQueries({ queryKey: ["kanban-tasks"] });
      } else {
        setIssueBoard({ ...board });
        await base44.entities.Issue.update(draggableId, { status: dstCol });
        queryClient.invalidateQueries({ queryKey: ["kanban-issues"] });
      }
      return;
    }

    if (isTask) setTaskBoard({ ...board });
    else setIssueBoard({ ...board });
  };

  const columns = mode === "tasks" ? TASK_COLUMNS : ISSUE_COLUMNS;
  const board = mode === "tasks" ? taskBoard : issueBoard;

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E] flex-shrink-0">
        <div className="flex items-center gap-3">
          <LayoutGrid size={18} className="text-[#5E6AD2]" />
          <h1 className="text-base font-semibold text-white">Kanban Board</h1>
        </div>
        <div className="flex items-center gap-1 bg-[#161616] border border-[#252525] rounded-lg p-1">
          <button
            onClick={() => setMode("tasks")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === "tasks" ? "bg-[#5E6AD2] text-white" : "text-[#777] hover:text-white"
            }`}
          >
            <ListTodo size={13} />
            Tasks
          </button>
          <button
            onClick={() => setMode("issues")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === "issues" ? "bg-[#5E6AD2] text-white" : "text-[#777] hover:text-white"
            }`}
          >
            <Layers size={13} />
            Issues
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-max">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                items={board[col.id] || []}
                type={mode === "tasks" ? "task" : "issue"}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}