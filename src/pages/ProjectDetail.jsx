import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { HealthBadge } from "../components/shared/StatusBadge";
import IssueRow from "../components/issues/IssueRow";
import IssueDetail from "../components/issues/IssueDetail";
import CreateIssueModal from "../components/shared/CreateIssueModal";

export default function ProjectDetail() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const project = projects.find(p => p.id === projectId);

  const { data: issues = [] } = useQuery({
    queryKey: ["project-issues", projectId],
    queryFn: () => base44.entities.Issue.filter({ project_id: projectId }, "-created_date"),
    enabled: !!projectId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", selectedIssue?.id],
    queryFn: () => base44.entities.Comment.filter({ issue_id: selectedIssue.id }),
    enabled: !!selectedIssue?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const maxNum = issues.reduce((max, i) => Math.max(max, i.issue_number || 0), 0);
      return base44.entities.Issue.create({ ...data, project_id: projectId, issue_number: maxNum + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
      setShowCreate(false);
    },
  });

  const handleStatusChange = async (issueId, data) => {
    await base44.entities.Issue.update(issueId, data);
    setSelectedIssue(prev => ({ ...prev, ...data }));
    queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
  };

  const handleAddComment = async (content) => {
    await base44.entities.Comment.create({ issue_id: selectedIssue.id, content, author: "You" });
    queryClient.invalidateQueries({ queryKey: ["comments", selectedIssue?.id] });
  };

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center text-[#555]">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl("Projects"))} className="text-[#6B6B6B] hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          {project.icon && <span>{project.icon}</span>}
          <h1 className="text-sm font-semibold text-white">{project.name}</h1>
          <span className="text-xs text-[#555] font-mono">{project.prefix}</span>
          <HealthBadge health={project.health} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(true)} className="text-[#6B6B6B] hover:text-white transition-colors">
            <Plus size={16} />
          </button>
          <button className="text-[#555] hover:text-white transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`${selectedIssue ? "w-[420px] flex-shrink-0" : "flex-1"} border-r border-[#1E1E1E] overflow-y-auto`}>
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#555]">
              <p className="text-sm">No issues in this project</p>
              <button onClick={() => setShowCreate(true)} className="text-xs text-[#5E6AD2] mt-2 hover:underline">
                Create an issue
              </button>
            </div>
          ) : (
            issues.map(issue => (
              <IssueRow
                key={issue.id}
                issue={issue}
                projectPrefix={project.prefix}
                onClick={setSelectedIssue}
              />
            ))
          )}
        </div>

        {selectedIssue && (
          <div className="flex-1">
            <IssueDetail
              issue={selectedIssue}
              comments={comments}
              onClose={() => setSelectedIssue(null)}
              onStatusChange={handleStatusChange}
              onAddComment={handleAddComment}
              allIssues={issues}
              onUpdateIssue={async (issueId, data) => {
                await base44.entities.Issue.update(issueId, data);
                setSelectedIssue(prev => ({ ...prev, ...data }));
                queryClient.invalidateQueries({ queryKey: ["project-issues", projectId] });
              }}
            />
          </div>
        )}
      </div>

      <CreateIssueModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        projects={projects}
      />
    </div>
  );
}