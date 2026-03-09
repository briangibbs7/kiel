import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EpicCard from "@/components/backlog/EpicCard";
import TaskCard from "@/components/backlog/TaskCard.jsx";
import CreateEpicModal from "@/components/backlog/CreateEpicModal";

export default function Backlog() {
  const [showCreateEpic, setShowCreateEpic] = useState(false);
  const [expandedEpics, setExpandedEpics] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);

  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["backlog-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["epics", selectedProject],
    queryFn: () =>
      selectedProject
        ? base44.entities.Epic.filter(
            { project_id: selectedProject },
            "-created_date"
          )
        : Promise.resolve([]),
    enabled: !!selectedProject,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", selectedProject],
    queryFn: () =>
      selectedProject
        ? base44.entities.Task.filter(
            { project_id: selectedProject },
            "-created_date"
          )
        : Promise.resolve([]),
    enabled: !!selectedProject,
  });

  const createEpicMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Epic.create({
        ...data,
        project_id: selectedProject,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["epics"] });
      setShowCreateEpic(false);
    },
  });

  const toggleEpic = (epicId) => {
    setExpandedEpics((prev) => ({
      ...prev,
      [epicId]: !prev[epicId],
    }));
  };

  const getTasksForEpic = (epicId) => {
   return tasks.filter((t) => t.epic_id === epicId);
  };

  const getBacklogTasks = () => {
   return tasks.filter((t) => !t.epic_id);
  };

  if (!selectedProject) {
    return (
      <div className="h-full bg-[#0D0D0D] p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="text-lg font-semibold text-white mb-4">
            Select a Project
          </h2>
          <div className="grid gap-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className="p-4 bg-[#111] border border-[#1E1E1E] rounded hover:border-[#5E6AD2] transition-colors text-left"
              >
                <p className="font-medium text-white">{project.name}</p>
                <p className="text-xs text-[#999] mt-1">{project.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {projects.find((p) => p.id === selectedProject)?.name} Backlog
            </h1>
            <p className="text-sm text-[#999] mt-1">
              Manage epics and tasks
            </p>
          </div>
          <Button
            onClick={() => setShowCreateEpic(true)}
            className="bg-[#5E6AD2] hover:bg-[#5E6AD2]/90"
          >
            <Plus size={16} className="mr-2" />
            New Epic
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {/* Epics */}
         {epics.map((epic) => {
           const epicTasks = getTasksForEpic(epic.id);
           const isExpanded = expandedEpics[epic.id];

           return (
             <div key={epic.id} className="bg-[#111] border border-[#1E1E1E] rounded-lg overflow-hidden">
               <button
                 onClick={() => toggleEpic(epic.id)}
                 className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#161616] transition-colors group"
               >
                 <div className="text-[#999] group-hover:text-white">
                   {isExpanded ? (
                     <ChevronDown size={16} />
                   ) : (
                     <ChevronRight size={16} />
                   )}
                 </div>
                 <EpicCard epic={epic} />
               </button>

               {isExpanded && (
                 <div className="border-t border-[#1E1E1E] bg-[#0D0D0D]">
                   <div className="p-4 space-y-2">
                     {epicTasks.length === 0 ? (
                       <p className="text-xs text-[#555] py-4 text-center">
                         No tasks in this epic
                       </p>
                     ) : (
                       epicTasks.map((task) => (
                         <TaskCard key={task.id} task={task} />
                       ))
                     )}
                   </div>
                 </div>
               )}
             </div>
           );
         })}

         {/* Backlog */}
         {getBacklogTasks().length > 0 && (
           <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4">
             <h3 className="text-sm font-semibold text-white mb-3">Backlog</h3>
             <div className="space-y-2">
               {getBacklogTasks().map((task) => (
                 <TaskCard key={task.id} task={task} />
               ))}
             </div>
           </div>
         )}
      </div>

      <CreateEpicModal
        open={showCreateEpic}
        onClose={() => setShowCreateEpic(false)}
        onSubmit={(data) => createEpicMutation.mutate(data)}
      />
    </div>
  );
}