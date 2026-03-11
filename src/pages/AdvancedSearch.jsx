import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueStatusIcon, PriorityIcon } from "../components/shared/StatusBadge";
import { format } from "date-fns";

export default function AdvancedSearch() {
  const [filters, setFilters] = useState([
    { field: 'status', operator: 'is', value: '' }
  ]);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const { data: issues = [] } = useQuery({
    queryKey: ['issues'],
    queryFn: () => base44.entities.Issue.list()
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  // Apply filters to issues
  const filteredResults = useMemo(() => {
    let filtered = [...issues];

    filters.forEach(filter => {
      if (!filter.field || !filter.value) return;

      filtered = filtered.filter(issue => {
        const fieldValue = issue[filter.field];

        switch (filter.operator) {
          case 'is':
            return fieldValue === filter.value;
          case 'is not':
            return fieldValue !== filter.value;
          case 'contains':
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'equals':
            return fieldValue === filter.value;
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [filters, issues]);

  const handleSearch = () => {
    setResults(filteredResults);
    setHasSearched(true);
  };

  const addFilter = () => {
    setFilters([...filters, { field: 'status', operator: 'is', value: '' }]);
  };

  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index, key, val) => {
    const newFilters = [...filters];
    newFilters[index][key] = val;
    setFilters(newFilters);
  };

  const getProjectName = (projectId) => {
    return projects.find(p => p.id === projectId)?.name || projectId;
  };

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D]">
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <h1 className="text-lg font-semibold text-white flex items-center gap-2">
          <Search size={20} />
          Advanced Search (JQL)
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl">
          {/* Query Builder */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white mb-3">Query Filters</h2>
            <div className="space-y-2 mb-3">
              {filters.map((filter, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select
                    value={filter.field}
                    onChange={(e) => updateFilter(index, 'field', e.target.value)}
                    className="px-3 py-2 bg-[#161616] border border-[#252525] rounded text-white text-sm"
                  >
                    <option value="">Select field</option>
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                    <option value="assignee">Assignee</option>
                    <option value="project_id">Project</option>
                    <option value="title">Title</option>
                  </select>

                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                    className="px-3 py-2 bg-[#161616] border border-[#252525] rounded text-white text-sm"
                  >
                    <option value="is">is</option>
                    <option value="is not">is not</option>
                    <option value="contains">contains</option>
                  </select>

                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="px-3 py-2 bg-[#161616] border border-[#252525] rounded text-white text-sm flex-1"
                  />

                  <button
                    onClick={() => removeFilter(index)}
                    className="p-2 text-[#555] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={addFilter}
                variant="outline"
                className="border-[#252525] gap-2"
              >
                <Plus size={14} />
                Add Filter
              </Button>
              <Button
                onClick={handleSearch}
                className="bg-[#5E6AD2] hover:bg-[#6B78E5]"
              >
                Search ({filteredResults.length})
              </Button>
            </div>
          </div>

          {/* Results */}
          {hasSearched && (
            <div>
              <h2 className="text-sm font-semibold text-white mb-3">Results ({results.length})</h2>
              <div className="space-y-2">
                {results.map(issue => (
                  <div key={issue.id} className="flex items-start gap-3 p-3 bg-[#161616] rounded border border-[#252525] hover:border-[#333] transition-colors">
                    <IssueStatusIcon status={issue.status} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#555]">{getProjectName(issue.project_id)}</span>
                        <span className="text-sm font-medium text-white">{issue.title}</span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        {issue.priority && <PriorityIcon priority={issue.priority} />}
                        {issue.assignee && <span className="text-xs text-[#999]">Assigned to {issue.assignee}</span>}
                        {issue.due_date && <span className="text-xs text-[#999]">Due {format(new Date(issue.due_date), 'MMM d')}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}