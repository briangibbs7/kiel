import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const COLUMNS = [
  { id: "backlog",     label: "Backlog",      color: "#555555" },
  { id: "todo",        label: "To Do",        color: "#6B6B6B" },
  { id: "in_progress", label: "In Progress",  color: "#FACC15" },
  { id: "in_review",   label: "In Review",    color: "#60A5FA" },
  { id: "done",        label: "Done",         color: "#4ADE80" },
  { id: "cancelled",   label: "Cancelled",    color: "#F87171" },
];

const priorityColors = {
  urgent: "#F87171", high: "#FB923C", medium: "#FACC15", low: "#60A5FA",
};

export default function ProjectKanban({ issues, tasks, projectId, onIssueClick, onTaskClick }) {
  const [board, setBoard] = useState({});
  const queryClient = useQueryClient();

  // Support both issues and tasks
  const items = issues || tasks || [];

  useEffect(() => {
    const grouped = {};
    COLUMNS.forEach((col) => {
      grouped[col.id] = items.filter((i) => i.status === col.id);
    });
    setBoard(grouped);
  }, [items]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;
    const newBoard = { ...board };
    const srcItems = Array.from(newBoard[srcCol] || []);
    const [moved] = srcItems.splice(source.index, 1);

    if (srcCol === dstCol) {
      srcItems.splice(destination.index, 0, moved);
      newBoard[srcCol] = srcItems;
    } else {
      const dstItems = Array.from(newBoard[dstCol] || []);
      dstItems.splice(destination.index, 0, { ...moved, status: dstCol });
      newBoard[srcCol] = srcItems;
      newBoard[dstCol] = dstItems;
      setBoard(newBoard);
      
      // Update either Issue or Task entity based on which is being used
      if (issues) {
        await base44.entities.Issue.update(draggableId, { status: dstCol });
        queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
      } else if (tasks) {
        await base44.entities.Task.update(draggableId, { status: dstCol });
        queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      }
      return;
    }
    setBoard(newBoard);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full min-w-max p-5">
        {COLUMNS.map((col) => {
          const items = board[col.id] || [];
          return (
            <div key={col.id} className="flex-shrink-0 w-64 flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                <span className="text-xs font-semibold text-[#999] uppercase tracking-wider">{col.label}</span>
                <span className="ml-auto text-xs text-[#555] bg-[#1A1A1A] px-1.5 py-0.5 rounded">{items.length}</span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[80px] rounded-xl p-2 space-y-2 transition-colors ${
                      snapshot.isDraggingOver ? "bg-[#1C1C2E] ring-1 ring-[#5E6AD2]/40" : "bg-[#111111]"
                    }`}
                  >
                    {items.map((issue, index) => (
                      <Draggable key={issue.id} draggableId={issue.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              if (onIssueClick) onIssueClick(issue);
                              if (onTaskClick) onTaskClick(issue);
                            }}
                            className={`p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                              snapshot.isDragging
                                ? "border-[#5E6AD2] bg-[#1E1E1E] shadow-2xl shadow-black/60 rotate-1"
                                : "border-[#1E1E1E] bg-[#161616] hover:border-[#333] hover:bg-[#1A1A1A]"
                            }`}
                          >
                            {issue.issue_number && (
                              <span className="text-[10px] font-mono text-[#555] mb-1 block">#{issue.issue_number}</span>
                            )}
                            <p className="text-sm text-white font-medium leading-snug line-clamp-2">{issue.title}</p>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {issue.priority && issue.priority !== "none" && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize"
                                  style={{
                                    backgroundColor: `${priorityColors[issue.priority]}20`,
                                    color: priorityColors[issue.priority],
                                  }}
                                >
                                  {issue.priority}
                                </span>
                              )}
                              {issue.due_date && (
                                <span className="text-[10px] text-[#666]">
                                  {new Date(issue.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              )}
                              {issue.assignee && (
                                <span className="ml-auto text-[10px] text-[#666] truncate max-w-[80px]">
                                  {issue.assignee.split("@")[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-14 text-[#333] text-xs border border-dashed border-[#1E1E1E] rounded-lg">
                        Drop here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}