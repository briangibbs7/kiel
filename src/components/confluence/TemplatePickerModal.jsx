import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Users, BarChart3, ClipboardList, Lightbulb, CheckSquare, Layers, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_ICONS = {
  meeting_notes: Users,
  project_plan: BarChart3,
  requirements: ClipboardList,
  decision: Lightbulb,
  retrospective: CheckSquare,
  product_spec: Layers,
  how_to: BookOpen,
  blank: FileText,
  custom: FileText,
};

const CATEGORY_COLORS = {
  meeting_notes: "#5E6AD2",
  project_plan: "#4ADE80",
  requirements: "#60A5FA",
  decision: "#FACC15",
  retrospective: "#A78BFA",
  product_spec: "#FB923C",
  how_to: "#22D3EE",
  blank: "#666",
  custom: "#999",
};

const BUILT_IN = [
  { id: "meeting-notes", name: "Meeting Notes", description: "Agenda, discussion, decisions & action items", category: "meeting_notes", content: `<h2>Meeting Notes</h2><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p><h3>Agenda</h3><ol><li></li></ol><h3>Discussion</h3><p></p><h3>Decisions</h3><ul><li></li></ul><h3>Action Items</h3><ul><li>[ ] Action - Owner - Due</li></ul>` },
  { id: "project-plan", name: "Project Plan", description: "Scope, milestones, team and success metrics", category: "project_plan", content: `<h2>Project Plan</h2><p><strong>Owner:</strong> </p><p><strong>Target Date:</strong> </p><h3>Objectives</h3><p></p><h3>Milestones</h3><ul><li></li></ul><h3>Risks</h3><ul><li></li></ul>` },
  { id: "decision", name: "Decision Record", description: "Document decisions with context and options", category: "decision", content: `<h2>Decision Record</h2><p><strong>Status:</strong> Proposed</p><h3>Context</h3><p></p><h3>Decision</h3><p></p><h3>Options Considered</h3><h4>Option A</h4><p>Pros: </p><p>Cons: </p>` },
  { id: "how-to", name: "How-To Guide", description: "Step-by-step instructions", category: "how_to", content: `<h2>How To: [Title]</h2><h3>Prerequisites</h3><ul><li></li></ul><h3>Steps</h3><ol><li></li></ol><h3>Troubleshooting</h3><p></p>` },
  { id: "retrospective", name: "Retrospective", description: "Team feedback and action items", category: "retrospective", content: `<h2>Retrospective</h2><h3>What Went Well ✅</h3><ul><li></li></ul><h3>What Could Improve 🔧</h3><ul><li></li></ul><h3>Action Items 🎯</h3><ul><li></li></ul>` },
  { id: "blank", name: "Blank Page", description: "Start from scratch", category: "blank", content: "" },
];

export default function TemplatePickerModal({ open, onClose, onSelect }) {
  const [selected, setSelected] = useState(null);

  const { data: customTemplates = [] } = useQuery({
    queryKey: ["page-templates"],
    queryFn: () => base44.entities.Template.list(),
    enabled: open,
  });

  const allTemplates = [
    ...BUILT_IN,
    ...customTemplates.map((t) => ({ ...t, _custom: true })),
  ];

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected);
    setSelected(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-[#333] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#999] -mt-2 mb-3">Select a template to pre-fill the page, or start blank.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
          {allTemplates.map((t) => {
            const Icon = CATEGORY_ICONS[t.category] || FileText;
            const color = CATEGORY_COLORS[t.category] || "#999";
            const isSelected = selected?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? "border-[#5E6AD2] bg-[#5E6AD2]/10"
                    : "border-[#252525] bg-[#111] hover:border-[#333] hover:bg-[#161616]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "22" }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <span className="text-sm font-medium text-white truncate">{t.name}</span>
                  {t._custom && <span className="ml-auto text-[10px] text-[#5E6AD2] bg-[#5E6AD2]/10 px-1.5 py-0.5 rounded">Custom</span>}
                </div>
                <p className="text-xs text-[#666] line-clamp-2">{t.description || "Custom template"}</p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#252525]">
          <Button variant="ghost" onClick={onClose} className="text-[#999]">Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={!selected}
            className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
          >
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}