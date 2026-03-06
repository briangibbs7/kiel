import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Layout, LayoutGrid, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import IssueRow from "../components/issues/IssueRow";
import IssueDetail from "../components/issues/IssueDetail";
import CreateIssueModal from "../components/shared/CreateIssueModal";
import IssueTableView from "../components/issues/IssueTableView";
import IssueKanbanView from "../components/issues/IssueKanbanView";
import IssueCalendarView from "../components/issues/IssueCalendarView";
import IssueViewControls from "../components/issues/IssueViewControls";

export default function MyIssues() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [viewMode, setViewMode] = useState("list");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [columns, setColumns] = useState(["id", "title", "status", "priority", "assignee"]);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const queryClient = useQueryClient();

  // Check URL params for create=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "true") setShowCreate(true);
  }, []);

  const { data: allIssues = [], isLoading } = useQuery({
    queryKey: ["my-issues"],
    queryFn: () => base44.entities.Issue.list("-created_date", 100)
  });

  // Filter and sort issues
  const issues = allIssues.filter((issue) => {
    if (filters.status && !filters.status.includes(issue.status)) return false;
    if (filters.priority && !filters.priority.includes(issue.priority)) return false;
    return true;
  }).sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (sortBy === "created_date") {
      aVal = new Date(a.created_date);
      bVal = new Date(b.created_date);
    }
    if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list()
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", selectedIssue?.id],
    queryFn: () => base44.entities.Comment.filter({ issue_id: selectedIssue.id }),
    enabled: !!selectedIssue?.id
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Get next issue number
      const projectIssues = issues.filter((i) => i.project_id === data.project_id);
      const maxNum = projectIssues.reduce((max, i) => Math.max(max, i.issue_number || 0), 0);
      return base44.entities.Issue.create({ ...data, issue_number: maxNum + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-issues"] });
      setShowCreate(false);
    }
  });

  const getPrefix = (projectId) => {
    const p = projects.find((p) => p.id === projectId);
    return p?.prefix || "ISS";
  };

  const handleStatusChange = async (issueId, data) => {
    await base44.entities.Issue.update(issueId, data);
    setSelectedIssue((prev) => ({ ...prev, ...data }));
    queryClient.invalidateQueries({ queryKey: ["my-issues"] });
  };

  const handleAddComment = async (content) => {
    await base44.entities.Comment.create({
      issue_id: selectedIssue.id,
      content,
      author: "You"
    });
    queryClient.invalidateQueries({ queryKey: ["comments", selectedIssue?.id] });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIssues.length} issue(s)?`)) return;
    for (const id of selectedIssues) {
      await base44.entities.Issue.delete(id);
    }
    setSelectedIssues([]);
    queryClient.invalidateQueries({ queryKey: ["my-issues"] });
  };

  const handleDragEnd = async (result) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const issue = issues.find((i) => i.id === draggableId);
    if (issue && issue.status !== destination.droppableId) {
      await base44.entities.Issue.update(draggableId, { status: destination.droppableId });
      queryClient.invalidateQueries({ queryKey: ["my-issues"] });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-2.5 border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-[#111] p-1 rounded">
            <button
              onClick={() => setViewMode("list")} className="bg-[#1E1E1E] text-slate-100 p-1.5 text-xs rounded"

              title="List view">

              <Layout size={14} />
            </button>
            <button
              onClick={() => setViewMode("kanban")} className="bg-[#1E1E1E] text-slate-100 p-1.5 text-xs rounded hover:bg-[#1A1A1A]"

              title="Kanban view">

              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("calendar")} className="bg-[#1E1E1E] text-slate-100 p-1.5 text-xs rounded hover:bg-[#1A1A1A]"

              title="Calendar view">

              <Calendar size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(true)} className="text-[#6B6B6B] hover:text-white transition-colors">
            <Plus size={16} className="text-slate-100 lucide lucide-plus" />
          </button>
          <IssueViewControls
            columns={columns}
            onColumnsChange={setColumns}
            filters={filters}
            onFiltersChange={setFilters}
            selectedCount={selectedIssues.length}
            onBulkDelete={handleBulkDelete} />

        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex">
        <div className={`${selectedIssue ? "flex-1 min-w-0" : "flex-1"} flex flex-col border-r border-[#1E1E1E]`}>
          {isLoading ?
          <div className="space-y-0 flex-1">
              {Array(8).fill(0).map((_, i) =>
            <div key={i} className="h-10 border-b border-[#1A1A1A] animate-pulse bg-[#111]" />
            )}
            </div> :
          issues.length === 0 ?
          <div className="flex flex-col items-center justify-center h-full text-[#555]">
              <ListIcon size={24} className="mb-3" />
              <p className="text-sm">No issues yet</p>
              <button onClick={() => setShowCreate(true)} className="text-xs text-[#5E6AD2] mt-2 hover:underline">
                Create your first issue
              </button>
            </div> :
          viewMode === "list" ?
          <IssueTableView
            issues={issues}
            projects={projects}
            selectedIssues={selectedIssues}
            onSelectIssue={setSelectedIssues}
            onIssueClick={setSelectedIssue}
            columns={columns}
            onSort={(col, order) => {
              setSortBy(col);
              setSortOrder(order);
            }}
            sortBy={sortBy}
            sortOrder={sortOrder} /> :

          viewMode === "kanban" ?
          <DragDropContext onDragEnd={handleDragEnd}>
              <IssueKanbanView
              issues={issues}
              projects={projects}
              onIssueClick={setSelectedIssue}
              onStatusChange={handleStatusChange} />

            </DragDropContext> :

          <IssueCalendarView
            issues={issues}
            projects={projects}
            onIssueClick={setSelectedIssue}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth} />

          }
        </div>

        {/* Detail panel */}
        {selectedIssue &&
        <div className="w-[420px] flex-shrink-0 border-r border-[#1E1E1E]">
            <IssueDetail
            issue={selectedIssue}
            comments={comments}
            onClose={() => setSelectedIssue(null)}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
            allIssues={issues}
            onUpdateIssue={async (issueId, data) => {
              await base44.entities.Issue.update(issueId, data);
              setSelectedIssue((prev) => ({ ...prev, ...data }));
              queryClient.invalidateQueries({ queryKey: ["my-issues"] });
            }} />

          </div>
        }
      </div>

      <CreateIssueModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        projects={projects} />

    </div>);

}

function ListIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>);

}