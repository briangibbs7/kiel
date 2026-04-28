import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, Plus, Star, Users, BookOpen, Lightbulb, ClipboardList, BarChart3, CheckSquare, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const BUILT_IN_TEMPLATES = [
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Capture agenda, discussion points, decisions, and action items",
    category: "meeting_notes",
    icon: Users,
    color: "#5E6AD2",
    content: `<h2>Meeting Notes</h2>
<p><strong>Date:</strong> </p>
<p><strong>Attendees:</strong> </p>
<p><strong>Facilitator:</strong> </p>
<h3>Agenda</h3>
<ol><li>Item 1</li><li>Item 2</li></ol>
<h3>Discussion Points</h3>
<p></p>
<h3>Decisions Made</h3>
<ul><li></li></ul>
<h3>Action Items</h3>
<ul><li>[ ] Action - Owner - Due date</li></ul>
<h3>Next Meeting</h3>
<p></p>`
  },
  {
    id: "project-plan",
    name: "Project Plan",
    description: "Define scope, milestones, team, and success metrics",
    category: "project_plan",
    icon: BarChart3,
    color: "#4ADE80",
    content: `<h2>Project Plan</h2>
<h3>Overview</h3>
<p><strong>Project Name:</strong> </p>
<p><strong>Owner:</strong> </p>
<p><strong>Start Date:</strong> </p>
<p><strong>Target Date:</strong> </p>
<h3>Objectives</h3>
<p></p>
<h3>Scope</h3>
<h4>In Scope</h4>
<ul><li></li></ul>
<h4>Out of Scope</h4>
<ul><li></li></ul>
<h3>Milestones</h3>
<ul><li>Milestone 1 - Date</li><li>Milestone 2 - Date</li></ul>
<h3>Team</h3>
<ul><li>Role - Name</li></ul>
<h3>Risks</h3>
<ul><li>Risk - Mitigation</li></ul>
<h3>Success Metrics</h3>
<ul><li></li></ul>`
  },
  {
    id: "requirements",
    name: "Requirements Doc",
    description: "Document functional and non-functional requirements",
    category: "requirements",
    icon: ClipboardList,
    color: "#60A5FA",
    content: `<h2>Requirements Document</h2>
<p><strong>Version:</strong> 1.0</p>
<p><strong>Status:</strong> Draft</p>
<h3>Introduction</h3>
<p></p>
<h3>Functional Requirements</h3>
<h4>FR-001</h4>
<p><strong>Title:</strong> </p>
<p><strong>Description:</strong> </p>
<p><strong>Priority:</strong> High | Medium | Low</p>
<h3>Non-Functional Requirements</h3>
<ul><li>Performance: </li><li>Security: </li><li>Scalability: </li></ul>
<h3>Acceptance Criteria</h3>
<ul><li>Given... When... Then...</li></ul>`
  },
  {
    id: "decision",
    name: "Decision Record",
    description: "Document architectural or product decisions with context",
    category: "decision",
    icon: Lightbulb,
    color: "#FACC15",
    content: `<h2>Decision Record</h2>
<p><strong>Date:</strong> </p>
<p><strong>Status:</strong> Proposed | Accepted | Deprecated</p>
<p><strong>Deciders:</strong> </p>
<h3>Context</h3>
<p>What is the issue we're seeing that motivates this decision?</p>
<h3>Decision</h3>
<p>What is the change we're proposing or have agreed to implement?</p>
<h3>Options Considered</h3>
<h4>Option 1</h4>
<p><strong>Pros:</strong> </p><p><strong>Cons:</strong> </p>
<h4>Option 2</h4>
<p><strong>Pros:</strong> </p><p><strong>Cons:</strong> </p>
<h3>Consequences</h3>
<p>What becomes easier or more difficult to do because of this change?</p>`
  },
  {
    id: "retrospective",
    name: "Retrospective",
    description: "Sprint or project retrospective with team feedback",
    category: "retrospective",
    icon: CheckSquare,
    color: "#A78BFA",
    content: `<h2>Retrospective</h2>
<p><strong>Sprint/Period:</strong> </p>
<p><strong>Date:</strong> </p>
<p><strong>Team:</strong> </p>
<h3>What Went Well ✅</h3>
<ul><li></li></ul>
<h3>What Could Be Improved 🔧</h3>
<ul><li></li></ul>
<h3>Action Items 🎯</h3>
<ul><li>Action - Owner - Due</li></ul>
<h3>Team Mood</h3>
<p>😊 😐 😞</p>`
  },
  {
    id: "product-spec",
    name: "Product Spec",
    description: "Full product specification with user stories and wireframes",
    category: "product_spec",
    icon: Layers,
    color: "#FB923C",
    content: `<h2>Product Specification</h2>
<h3>Problem Statement</h3>
<p></p>
<h3>Proposed Solution</h3>
<p></p>
<h3>User Stories</h3>
<p>As a [user], I want to [action], so that [outcome].</p>
<ul><li></li></ul>
<h3>UX / Wireframes</h3>
<p>[Add wireframe images or links here]</p>
<h3>Technical Approach</h3>
<p></p>
<h3>Launch Plan</h3>
<ul><li>Alpha: </li><li>Beta: </li><li>GA: </li></ul>
<h3>Success Metrics</h3>
<ul><li></li></ul>`
  },
  {
    id: "how-to",
    name: "How-To Guide",
    description: "Step-by-step instructions for a process or procedure",
    category: "how_to",
    icon: BookOpen,
    color: "#22D3EE",
    content: `<h2>How To: [Title]</h2>
<h3>Overview</h3>
<p>Brief description of what this guide covers.</p>
<h3>Prerequisites</h3>
<ul><li>Prerequisite 1</li><li>Prerequisite 2</li></ul>
<h3>Steps</h3>
<ol>
<li><strong>Step 1:</strong> Description</li>
<li><strong>Step 2:</strong> Description</li>
<li><strong>Step 3:</strong> Description</li>
</ol>
<h3>Troubleshooting</h3>
<h4>Common Issue 1</h4>
<p>Solution: </p>
<h3>Related Resources</h3>
<ul><li></li></ul>`
  },
  {
    id: "blank",
    name: "Blank Page",
    description: "Start from scratch with an empty page",
    category: "blank",
    icon: FileText,
    color: "#666",
    content: ""
  }
];

export default function ConfluenceTemplates() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [useTemplate, setUseTemplate] = useState(null);
  const [form, setForm] = useState({ spaceId: "", title: "" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => base44.entities.Space.list(),
  });

  const createPageMutation = useMutation({
    mutationFn: (data) => base44.entities.Page.create(data),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      navigate(createPageUrl("ConfluenceSpace") + `?id=${page.space_id}`);
    },
  });

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "meeting_notes", label: "Meetings" },
    { id: "project_plan", label: "Planning" },
    { id: "requirements", label: "Requirements" },
    { id: "decision", label: "Decisions" },
    { id: "retrospective", label: "Retrospectives" },
    { id: "product_spec", label: "Product" },
    { id: "how_to", label: "How-To" },
    { id: "blank", label: "Blank" },
  ];

  const filtered = selectedCategory === "all"
    ? BUILT_IN_TEMPLATES
    : BUILT_IN_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleUseTemplate = () => {
    if (!form.spaceId || !form.title) return;
    createPageMutation.mutate({
      title: form.title,
      content: useTemplate.content,
      space_id: form.spaceId,
      status: "draft",
      template_id: useTemplate.id,
    });
  };

  return (
    <div className="h-full bg-[#0D0D0D] overflow-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#1E1E1E] flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-1">Templates</h1>
        <p className="text-sm text-[#999]">Start faster with professionally designed templates</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Category sidebar */}
        <aside className="w-52 flex-shrink-0 border-r border-[#1E1E1E] p-4 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#5E6AD2] text-white"
                  : "text-[#999] hover:bg-[#161616] hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </aside>

        {/* Template grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="bg-[#111] border border-[#1E1E1E] rounded-lg p-5 hover:border-[#2A2A2A] transition-colors group cursor-pointer"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: template.color + "22" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: template.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm">{template.name}</h3>
                      <p className="text-xs text-[#999] mt-0.5 line-clamp-2">{template.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUseTemplate(template);
                      setForm({ spaceId: spaces[0]?.id || "", title: template.name });
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] text-white max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#999] mb-4">{previewTemplate?.description}</p>
          <div
            className="prose prose-invert max-w-none text-sm text-[#CCC] bg-[#111] rounded-lg p-4 overflow-auto max-h-80"
            dangerouslySetInnerHTML={{ __html: previewTemplate?.content || "<p>Empty page</p>" }}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setPreviewTemplate(null)} className="text-[#999]">Close</Button>
            <Button
              className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
              onClick={() => {
                setUseTemplate(previewTemplate);
                setForm({ spaceId: spaces[0]?.id || "", title: previewTemplate.name });
                setPreviewTemplate(null);
              }}
            >
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Use Template Dialog */}
      <Dialog open={!!useTemplate} onOpenChange={() => setUseTemplate(null)}>
        <DialogContent className="bg-[#1A1A1A] border-[#333] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Create from "{useTemplate?.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-[#999] mb-1.5 block">Page Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-[#111] border-[#333] text-white"
                placeholder="Enter page title..."
              />
            </div>
            <div>
              <Label className="text-xs text-[#999] mb-1.5 block">Space</Label>
              <Select value={form.spaceId} onValueChange={(v) => setForm({ ...form, spaceId: v })}>
                <SelectTrigger className="bg-[#111] border-[#333] text-white">
                  <SelectValue placeholder="Select a space" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#333]">
                  {spaces.map((space) => (
                    <SelectItem key={space.id} value={space.id} className="text-white focus:bg-[#252525]">
                      {space.icon} {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setUseTemplate(null)} className="text-[#999]">Cancel</Button>
            <Button
              onClick={handleUseTemplate}
              disabled={!form.title || !form.spaceId || createPageMutation.isPending}
              className="bg-[#5E6AD2] hover:bg-[#6E7AE2] text-white"
            >
              {createPageMutation.isPending ? "Creating..." : "Create Page"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}