import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, Settings2, LayoutGrid, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueRow from "../components/issues/IssueRow";
import IssueDetail from "../components/issues/IssueDetail";
import CreateIssueModal from "../components/shared/CreateIssueModal";

export default function MyIssues() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  // Check URL params for create=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "true") setShowCreate(true);
  }, []);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["my-issues"],
    queryFn: () => base44.entities.Issue.list("-created_date", 50),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", selectedIssue?.id],
    queryFn: () => base44.entities.Comment.filter({ issue_id: selectedIssue.id }),
    enabled: !!selectedIssue?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Get next issue number
      const projectIssues = issues.filter(i => i.project_id === data.project_id);
      const maxNum = projectIssues.reduce((max, i) => Math.max(max, i.issue_number || 0), 0);
      return base44.entities.Issue.create({ ...data, issue_number: maxNum + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-issues"] });
      setShowCreate(false);
    },
  });

  const getPrefix = (projectId) => {
    const p = projects.find(p => p.id === projectId);
    return p?.prefix || "ISS";
  };

  const handleStatusChange = async (issueId, data) => {
    await base44.entities.Issue.update(issueId, data);
    setSelectedIssue(prev => ({ ...prev, ...data }));
    queryClient.invalidateQueries({ queryKey: ["my-issues"] });
  };

  const handleAddComment = async (content) => {
    await base44.entities.Comment.create({
      issue_id: selectedIssue.id,
      content,
      author: "You",
    });
    queryClient.invalidateQueries({ queryKey: ["comments", selectedIssue?.id] });
  };

  return (
    <div className="h-full flex">
      {/* Issue list */}
      <div className={`${selectedIssue ? "w-[420px] flex-shrink-0" : "flex-1"} border-r border-[#1E1E1E] flex flex-col`}>
        <div className="px-5 py-2.5 border-b border-[#1E1E1E] flex items-center justify-between">
          <Tabs defaultValue="assigned" onValueChange={setActiveTab}>
            <TabsList className="bg-transparent h-8 p-0 gap-0">
              <TabsTrigger value="assigned" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-[#6B6B6B] text-xs px-3 h-8 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-white">
                My issues
              </TabsTrigger>
              <TabsTrigger value="created" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-[#6B6B6B] text-xs px-3 h-8 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-white">
                Assigned
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-[#6B6B6B] text-xs px-3 h-8 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-white">
                Created
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreate(true)} className="text-[#6B6B6B] hover:text-white transition-colors">
              <Plus size={16} />
            </button>
            <button className="text-[#555] hover:text-white transition-colors">
              <Filter size={14} />
            </button>
            <button className="text-[#555] hover:text-white transition-colors">
              <Settings2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-0">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="h-10 border-b border-[#1A1A1A] animate-pulse bg-[#111]" />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#555]">
              <ListIcon size={24} className="mb-3" />
              <p className="text-sm">No issues yet</p>
              <button onClick={() => setShowCreate(true)} className="text-xs text-[#5E6AD2] mt-2 hover:underline">
                Create your first issue
              </button>
            </div>
          ) : (
            issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                projectPrefix={getPrefix(issue.project_id)}
                onClick={setSelectedIssue}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedIssue && (
        <div className="flex-1">
          <IssueDetail
            issue={selectedIssue}
            comments={comments}
            onClose={() => setSelectedIssue(null)}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
          />
        </div>
      )}

      <CreateIssueModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        projects={projects}
      />
    </div>
  );
}

function ListIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}