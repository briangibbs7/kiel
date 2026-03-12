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
    sprint_length_days: 14,
    story_point_options: [1, 2, 3, 5, 8, 13, 21],
    allowed_entity_types: ["task"],
  },
  {
    id: "sales",
    name: "Sales",
    category: "sales",
    description: "For sales initiatives and pipeline management",
    allowed_entity_types: ["story", "task", "issue"],
  },
  {
    id: "hr",
    name: "Human Resources",
    category: "hr",
    description: "For HR initiatives and team management",
    allowed_entity_types: ["story", "task", "issue"],
  },
  {
    id: "business",
    name: "Business Development",
    category: "business",
    description: "For business development and growth initiatives",
    allowed_entity_types: ["story", "task", "issue"],
  },
  {
    id: "finance",
    name: "Finance",
    category: "finance",
    description: "For financial planning and management projects",
    allowed_entity_types: ["story", "task", "issue"],
  },
  {
    id: "software",
    name: "Software Development",
    category: "software",
    description: "For software development projects",
    allowed_entity_types: ["story", "task", "issue"],
  },
  {
    id: "systems",
    name: "Systems",
    category: "systems",
    description: "For systems infrastructure and maintenance",
    allowed_entity_types: ["story", "task", "issue"],
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    category: "manufacturing",
    description: "For manufacturing and production projects",
    allowed_entity_types: ["story", "task", "issue"],
  },
  {
    id: "facilities",
    name: "Facilities",
    category: "facilities",
    description: "For facilities management and operations",
    allowed_entity_types: ["story", "task", "issue"],
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