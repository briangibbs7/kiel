import React from "react";
import { IssueStatusIcon, PriorityIcon } from "@/components/shared/StatusBadge";
import { Draggable, Droppable } from "@hello-pangea/dnd";

const statuses = ["backlog", "todo", "in_progress", "in_review", "done"];

export default function IssueKanbanView({ issues, projects, onIssueClick, onStatusChange }) {
  const getPrefix = (projectId) => {
    const p = projects.find(p => p.id === projectId);
    return p?.prefix || "ISS";
  };

  const groupedIssues = statuses.reduce((acc, status) => {
    acc[status] = issues.filter(i => i.status === status);
    return acc;
  }, {});

  return (
    <div className="flex gap-4 overflow-x-auto flex-1 p-4">
      {statuses.map((status) => (
        <Droppable key={status} droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-shrink-0 w-80 rounded-lg ${snapshot.isDraggingOver ? "bg-[#1A1A1A]" : "bg-[#111]"} border border-[#1E1E1E] flex flex-col`}
            >
              <div className="px-4 py-3 border-b border-[#1E1E1E]">
                <h3 className="font-medium text-sm capitalize">{status.replace("_", " ")}</h3>
                <p className="text-xs text-[#666] mt-1">{groupedIssues[status].length} issues</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 p-3">
                {groupedIssues[status].map((issue, index) => (
                  <Draggable key={issue.id} draggableId={issue.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => onIssueClick(issue)}
                        className={`p-3 rounded border border-[#252525] cursor-pointer transition-all ${
                          snapshot.isDragging ? "bg-[#1E1E1E] shadow-lg" : "bg-[#0D0D0D] hover:bg-[#161616]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-mono text-[#666]">{getPrefix(issue.project_id)}-{issue.issue_number}</span>
                          <PriorityIcon priority={issue.priority} size={12} />
                        </div>
                        <p className="text-sm font-medium text-[#CCC] mb-2 line-clamp-2">{issue.title}</p>
                        {issue.assignee && <p className="text-xs text-[#666]">{issue.assignee}</p>}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      ))}
    </div>
  );
}