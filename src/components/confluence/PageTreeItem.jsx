import React, { useState } from "react";
import { FileText, ChevronRight, ChevronDown, Plus, Trash } from "lucide-react";

export default function PageTreeItem({ page, allPages, selectedPage, onPageClick, onCreateChild, onDeletePage, depth = 0 }) {
  const children = allPages.filter((p) => p.parent_page_id === page.id);
  const [expanded, setExpanded] = useState(true);
  const hasChildren = children.length > 0;
  const isActive = selectedPage?.id === page.id;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer transition-colors group ${
          isActive ? "bg-[#1E1E1E] text-white" : "text-[#999] hover:bg-[#161616] hover:text-white"
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onPageClick(page)}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className={`flex-shrink-0 w-4 h-4 flex items-center justify-center ${hasChildren ? "text-[#666] hover:text-white" : "opacity-0 pointer-events-none"}`}
        >
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 truncate text-sm">{page.title}</span>

        {/* Action buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onCreateChild(page); }}
            title="Add subpage"
            className="p-0.5 rounded hover:bg-[#333]"
          >
            <Plus className="w-3 h-3 text-[#888] hover:text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
            title="Delete"
            className="p-0.5 rounded hover:bg-[#333]"
          >
            <Trash className="w-3 h-3 text-[#888] hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {children.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              allPages={allPages}
              selectedPage={selectedPage}
              onPageClick={onPageClick}
              onCreateChild={onCreateChild}
              onDeletePage={onDeletePage}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}