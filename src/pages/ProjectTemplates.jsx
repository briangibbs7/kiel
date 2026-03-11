import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Code2,
  Briefcase,
  Users,
  TrendingUp,
  DollarSign,
  Cpu,
  Wrench,
  Factory,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const TEMPLATE_ICONS = {
  engineering: Code2,
  sales: TrendingUp,
  hr: Users,
  business: Briefcase,
  finance: DollarSign,
  software: Cpu,
  systems: Wrench,
  manufacturing: Factory,
  facilities: Building2,
};

export const BUILT_IN_TEMPLATES = [
  {
    id: "eng",
    name: "Engineering",
    category: "engineering",
    description: "For engineering projects with design, development, and testing phases",
    default_epics: [
      { title: "Architecture & Design", priority: "high" },
      { title: "Core Development", priority: "high" },
      { title: "Testing & QA", priority: "high" },
      { title: "Documentation", priority: "medium" },
      { title: "Deployment & Launch", priority: "high" },
    ],
    sprint_length_days: 14,
    story_point_options: [1, 2, 3, 5, 8, 13, 21],
    allowed_entity_types: ["epic", "task"],
  },
  {
    id: "sales",
    name: "Sales",
    category: "sales",
    description: "For sales initiatives and pipeline management",
    default_epics: [
      { title: "Market Research", priority: "medium" },
      { title: "Lead Generation", priority: "high" },
      { title: "Sales Strategy", priority: "high" },
      { title: "Client Onboarding", priority: "medium" },
      { title: "Revenue Tracking", priority: "high" },
    ],
    allowed_entity_types: ["epic", "story", "task", "issue"],
  },
  {
    id: "hr",
    name: "Human Resources",
    category: "hr",
    description: "For HR initiatives and team management",
    default_epics: [
      { title: "Recruitment", priority: "high" },
      { title: "Onboarding", priority: "high" },
      { title: "Training & Development", priority: "medium" },
      { title: "Compliance", priority: "high" },
      { title: "Employee Engagement", priority: "medium" },
    ],
    allowed_entity_types: ["epic", "story", "task", "issue"],
  },
  {
    id: "business",
    name: "Business Development",
    category: "business",
    description: "For business development and growth initiatives",
    default_epics: [
      { title: "Partnership Development", priority: "high" },
      { title: "Market Expansion", priority: "high" },
      { title: "Product Strategy", priority: "medium" },
      { title: "Vendor Management", priority: "medium" },
      { title: "Growth Metrics", priority: "high" },
    ],
    allowed_entity_types: ["epic", "story", "task", "issue"],
  },
  {
    id: "finance",
    name: "Finance",
    category: "finance",
    description: "For financial planning and management projects",
    default_epics: [
      { title: "Budgeting & Planning", priority: "high" },
      { title: "Cost Management", priority: "high" },
      { title: "Financial Reporting", priority: "high" },
      { title: "Audit & Compliance", priority: "high" },
      { title: "Forecasting", priority: "medium" },
    ],
    allowed_entity_types: ["epic", "story", "task", "issue"],
  },
  {
    id: "software",
    name: "Software Development",
    category: "software",
    description: "For software development projects",
    default_epics: [
      { title: "Requirements & Planning", priority: "high" },
      { title: "Frontend Development", priority: "high" },
      { title: "Backend Development", priority: "high" },
      { title: "Integration & Testing", priority: "high" },
      { title: "Performance Optimization", priority: "medium" },
    ],
    allowed_entity_types: ["epic", "story", "task", "issue"],
  },
  {
    id: "systems",
    name: "Systems",
    category: "systems",
    description: "For systems infrastructure and maintenance",
    default_epics: [
      { title: "Infrastructure Setup", priority: "high" },
      { title: "Monitoring & Alerts", priority: "high" },
      { title: "Security & Hardening", priority: "high" },
      { title: "Backup & Recovery", priority: "high" },
      { title: "Maintenance & Updates", priority: "medium" },
    ],
    allowed_entity_types: ["epic", "story", "task", "issue"],
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    category: "manufacturing",
    description: "For manufacturing and production projects",
    default_epics: [
      { title: "Process Design", priority: "high" },
      { title: "Equipment Setup", priority: "high" },
      { title: "Quality Control", priority: "high" },
      { title: "Production Planning", priority: "high" },
      { title: "Supply Chain", priority: "medium" },
    ],
    allowed_entity_types: ["epic", "story", "task", "issue"],
  },
  {
    id: "facilities",
    name: "Facilities",
    category: "facilities",
    description: "For facilities management and operations",
    default_epics: [
      { title: "Space Planning", priority: "medium" },
      { title: "Maintenance & Repairs", priority: "high" },
      { title: "Safety & Compliance", priority: "high" },
      { title: "Operations & Scheduling", priority: "high" },
      { title: "Vendor Management", priority: "medium" },
    ],
    allowed_entity_types: ["epic", "story", "task", "issue"],
  },
];

export default function ProjectTemplates() {
  const navigate = useNavigate();

  const handleSelectTemplate = (template) => {
    // Store template data and navigate to project creation
    sessionStorage.setItem("projectTemplate", JSON.stringify(template));
    navigate(createPageUrl("Projects") + "?create=true");
  };

  return (
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D]">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Templates</h1>
          <p className="text-sm text-[#999] mt-1">
            Choose a template to quickly set up a new project
          </p>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUILT_IN_TEMPLATES.map((template) => {
            const IconComponent = TEMPLATE_ICONS[template.category];
            return (
              <div
                key={template.id}
                className="p-6 bg-[#111] border border-[#1E1E1E] rounded-lg hover:border-[#252525] transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-[#1E1E1E] flex items-center justify-center group-hover:bg-[#252525] transition-colors">
                    <IconComponent
                      size={24}
                      className="text-[#5E6AD2]"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-[#999] mb-4">
                  {template.description}
                </p>

                <div className="mb-4">
                  <p className="text-xs font-medium text-[#999] mb-2">
                    Includes {template.default_epics.length} epics:
                  </p>
                  <div className="space-y-1">
                    {template.default_epics.slice(0, 3).map((epic, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-[#666] flex items-center gap-2"
                      >
                        <div className="w-1 h-1 rounded-full bg-[#5E6AD2]" />
                        {epic.title}
                      </div>
                    ))}
                    {template.default_epics.length > 3 && (
                      <div className="text-xs text-[#555] mt-1">
                        +{template.default_epics.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleSelectTemplate(template)}
                  className="w-full bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
                >
                  Use Template
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}