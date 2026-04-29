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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    story_point_options: [1, 2, 3, 5, 8, 13, 21, 34],
    allowed_entity_types: ["task"],
    sprints: [
      { name: "Sprint 1", goal: "Foundation & Setup",        fibonacci_capacity: 13 },
      { name: "Sprint 2", goal: "Core Feature Development",  fibonacci_capacity: 21 },
      { name: "Sprint 3", goal: "Integration & APIs",        fibonacci_capacity: 34 },
      { name: "Sprint 4", goal: "Testing & QA",              fibonacci_capacity: 21 },
      { name: "Sprint 5", goal: "Performance & Hardening",   fibonacci_capacity: 13 },
      { name: "Sprint 6", goal: "Release & Retrospective",   fibonacci_capacity: 8  },
    ],
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
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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
                 onClick={() => setSelectedTemplate(template)}
                 className="p-6 bg-[#111] border border-[#1E1E1E] rounded-lg hover:border-[#5E6AD2] transition-colors group cursor-pointer"
               >
                 <div className="flex items-start justify-between mb-3">
                   <div className="w-12 h-12 rounded-lg bg-[#1E1E1E] flex items-center justify-center group-hover:bg-[#252525] transition-colors">
                     <IconComponent
                       size={24}
                       className="text-[#5E6AD2]"
                     />
                   </div>
                 </div>

                 <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#5E6AD2] transition-colors">
                   {template.name}
                 </h3>
                 <p className="text-sm text-[#999] mb-4">
                   {template.description}
                 </p>

                 <Button
                   onClick={(e) => {
                     e.stopPropagation();
                     handleSelectTemplate(template);
                   }}
                   className="w-full bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
                 >
                   Use Template
                 </Button>
               </div>
             );
           })}
         </div>

         {/* Template Details Modal */}
         <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
           <DialogContent className="max-w-2xl bg-[#111] border-[#1E1E1E]">
             {selectedTemplate && (
               <>
                 <DialogHeader>
                   <div className="flex items-center gap-3">
                     {React.createElement(TEMPLATE_ICONS[selectedTemplate.category], {
                       size: 32,
                       className: "text-[#5E6AD2]",
                     })}
                     <div>
                       <DialogTitle className="text-2xl text-white">
                         {selectedTemplate.name}
                       </DialogTitle>
                       <DialogDescription className="text-[#999]">
                         {selectedTemplate.description}
                       </DialogDescription>
                     </div>
                   </div>
                 </DialogHeader>

                 <div className="space-y-4 py-4">
                   {selectedTemplate.sprint_length_days && (
                     <div className="p-3 bg-[#1E1E1E] rounded border border-[#252525]">
                       <p className="text-xs text-[#666] uppercase tracking-wide">Sprint Length</p>
                       <p className="text-white font-semibold mt-1">
                         {selectedTemplate.sprint_length_days} days
                       </p>
                     </div>
                   )}

                   {selectedTemplate.story_point_options && (
                     <div className="p-3 bg-[#1E1E1E] rounded border border-[#252525]">
                       <p className="text-xs text-[#666] uppercase tracking-wide">Story Point Options</p>
                       <div className="flex gap-2 flex-wrap mt-2">
                         {selectedTemplate.story_point_options.map((point) => (
                           <span
                             key={point}
                             className="px-3 py-1 bg-[#252525] text-[#CCC] text-sm rounded"
                           >
                             {point}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}

                   {selectedTemplate.sprints && (
                     <div className="p-3 bg-[#1E1E1E] rounded border border-[#252525]">
                       <p className="text-xs text-[#666] uppercase tracking-wide mb-2">Sprint Plan (Fibonacci Capacity)</p>
                       <div className="space-y-1.5">
                         {selectedTemplate.sprints.map((sprint, i) => (
                           <div key={i} className="flex items-center justify-between text-sm">
                             <span className="text-[#CCC]">
                               <span className="text-[#666] mr-2">{sprint.name}</span>
                               {sprint.goal}
                             </span>
                             <span className="ml-4 px-2 py-0.5 bg-[#5E6AD2]/20 text-[#5E6AD2] rounded text-xs font-mono font-semibold flex-shrink-0">
                               {sprint.fibonacci_capacity} pts
                             </span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {selectedTemplate.allowed_entity_types && (
                     <div className="p-3 bg-[#1E1E1E] rounded border border-[#252525]">
                       <p className="text-xs text-[#666] uppercase tracking-wide">Allowed Entity Types</p>
                       <div className="flex gap-2 flex-wrap mt-2">
                         {selectedTemplate.allowed_entity_types.map((type) => (
                           <span
                             key={type}
                             className="px-3 py-1 bg-[#252525] text-[#5E6AD2] text-sm rounded capitalize"
                           >
                             {type}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>

                 <div className="flex gap-3 justify-end">
                   <Button
                     variant="outline"
                     onClick={() => setSelectedTemplate(null)}
                     className="border-[#252525] text-[#CCC] hover:bg-[#1E1E1E]"
                   >
                     Close
                   </Button>
                   <Button
                     onClick={() => {
                       handleSelectTemplate(selectedTemplate);
                       setSelectedTemplate(null);
                     }}
                     className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
                   >
                     Use This Template
                   </Button>
                 </div>
               </>
             )}
           </DialogContent>
         </Dialog>
      </div>
    </div>
  );
}