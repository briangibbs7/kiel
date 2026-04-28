import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { History, X, RotateCcw, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { format } from "date-fns";

function DiffViewer({ current, previous }) {
  return (
    <div className="mt-3 rounded border border-[#2A2A2A] overflow-hidden">
      <div className="px-3 py-1.5 bg-[#1A1A1A] text-[10px] text-[#666] border-b border-[#2A2A2A]">Preview (version content)</div>
      <div
        className="p-3 text-xs text-[#CCC] max-h-48 overflow-y-auto prose-dark"
        dangerouslySetInnerHTML={{ __html: previous }}
      />
    </div>
  );
}

function VersionItem({ version, isLatest, onRevert, currentContent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#2A2A2A] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-3 bg-[#161616] hover:bg-[#1A1A1A] transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-full bg-[#252525] flex items-center justify-center text-xs font-bold text-[#5E6AD2] flex-shrink-0">
          v{version.version_number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{version.title}</p>
          <p className="text-[11px] text-[#666]">
            {version.author} · {format(new Date(version.created_date), "MMM d, yyyy 'at' h:mm a")}
          </p>
          {version.change_summary && (
            <p className="text-[11px] text-[#5E6AD2] mt-0.5 truncate">{version.change_summary}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLatest && (
            <span className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded-full border border-green-800">
              Current
            </span>
          )}
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-[#555]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#555]" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#2A2A2A] bg-[#111] p-3">
          <DiffViewer current={currentContent} previous={version.content} />
          {!isLatest && (
            <button
              onClick={() => onRevert(version)}
              className="mt-3 flex items-center gap-1.5 text-xs bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white px-3 py-1.5 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Revert to this version
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function VersionHistoryPanel({ pageId, currentContent, currentTitle, onRevert, onClose }) {
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["page-versions", pageId],
    queryFn: () =>
      base44.entities.PageVersion.filter({ page_id: pageId }),
    enabled: !!pageId,
  });

  const sorted = [...versions].sort((a, b) => b.version_number - a.version_number);
  const latestVersionNumber = sorted[0]?.version_number;

  return (
    <div className="w-80 flex-shrink-0 border-l border-[#1E1E1E] bg-[#0D0D0D] flex flex-col">
      <div className="p-3 border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#5E6AD2]" />
          <span className="text-sm font-semibold text-white">Version History</span>
          {sorted.length > 0 && (
            <span className="text-[10px] bg-[#252525] text-[#999] px-1.5 py-0.5 rounded-full">
              {sorted.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <p className="text-xs text-[#555] text-center py-6">Loading history...</p>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-8 h-8 mx-auto mb-2 text-[#333]" />
            <p className="text-xs text-[#555]">No saved versions yet.</p>
            <p className="text-xs text-[#444] mt-1">Versions are saved each time you save the page.</p>
          </div>
        ) : (
          sorted.map((version) => (
            <VersionItem
              key={version.id}
              version={version}
              isLatest={version.version_number === latestVersionNumber}
              onRevert={onRevert}
              currentContent={currentContent}
            />
          ))
        )}
      </div>
    </div>
  );
}