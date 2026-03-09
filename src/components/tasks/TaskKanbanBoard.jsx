import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const COLUMNS = [
  { id: "todo", label: "To Do", color: "#6B6B6B" },
  { id: "in_progress", label: "In Progress", color: "#FACC15" },
  { id: "in_review", label: "In Review", color: "#60A5FA" },
  { id: "done", label: "Done", color: "#4ADE80" },
];

const priorityColors = {
  urgent: "#F87171",
  high: "#FB923C",
  medium: "#FACC15",
  low: "#60A5FA",
};

export default function TaskKanbanBoard({ tasks, onStatusChange }) {
  const [ordered, setOrdered] = useState({});

  useEffect(() => {
    const grouped = {};
    COLUMNS.forEach((col) => {
      grouped[col.id] = tasks.filter((t) => t.status === col.id);
    });
    setOrdered(grouped);
  }, [tasks]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;

    const next = { ...ordered };
    const srcItems = Array.from(next[srcCol] || []);
    const [moved] = srcItems.splice(source.index, 1);

    if (srcCol === dstCol) {
      srcItems.splice(destination.index, 0, moved);
      next[srcCol] = srcItems;
    } else {
      const dstItems = Array.from(next[dstCol] || []);
      dstItems.splice(destination.index, 0, { ...moved, status: dstCol });
      next[srcCol] = srcItems;
      next[dstCol] = dstItems;
      onStatusChange(draggableId, dstCol);
    }

    setOrdered(next);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = getTasksByStatus(col.id);
          return (
            <div key={col.id} className="flex-shrink-0 w-64 flex flex-col">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-xs font-semibold text-[#999] uppercase tracking-wider">{col.label}</span>
                <span className="text-xs text-[#555] ml-auto">{colTasks.length}</span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[100px] rounded-lg p-2 space-y-2 transition-colors ${
                      snapshot.isDraggingOver ? "bg-[#1A1A1A]" : "bg-[#111111]"
                    }`}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                              snapshot.isDragging
                                ? "border-[#5E6AD2] bg-[#1E1E1E] shadow-lg shadow-black/40"
                                : "border-[#1E1E1E] bg-[#161616] hover:border-[#333]"
                            }`}
                          >
                            <p className="text-sm text-white font-medium leading-snug">{task.title}</p>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {task.priority && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                  style={{
                                    backgroundColor: `${priorityColors[task.priority]}20`,
                                    color: priorityColors[task.priority],
                                  }}
                                >
                                  {task.priority}
                                </span>
                              )}
                              {task.story_points != null && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5E6AD2]/20 text-[#5E6AD2] font-medium">
                                  {task.story_points} pts
                                </span>
                              )}
                              {task.assignee && (
                                <span className="text-[10px] text-[#777] ml-auto">
                                  {task.assignee.split("@")[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-6 text-[#444] text-xs">Drop tasks here</div>
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