import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TimeTracking() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ hours: '', issue_id: '', description: '' });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['timeEntries', selectedDate],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.TimeEntry.filter({
        user_email: user.email,
        date: selectedDate
      });
    },
    enabled: !!user?.email
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['issues'],
    queryFn: () => base44.entities.Issue.list()
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.TimeEntry.create({
        ...data,
        user_email: user.email,
        date: selectedDate,
        hours: parseFloat(data.hours)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setFormData({ hours: '', issue_id: '', description: '' });
      setShowAddForm(false);
    }
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: (id) => base44.entities.TimeEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    }
  });

  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D]">
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <h1 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock size={20} />
          Time Tracking
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl">
          {/* Date selector and summary */}
          <div className="mb-6">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-[#161616] border border-[#252525] rounded text-white text-sm"
            />
            <div className="mt-3 p-3 bg-[#161616] rounded-lg border border-[#252525]">
              <p className="text-[13px] text-[#999]">Total hours logged</p>
              <p className="text-2xl font-bold text-[#5E6AD2] mt-1">{totalHours.toFixed(1)}h</p>
            </div>
          </div>

          {/* Time entries list */}
          <div className="space-y-2 mb-6">
            {timeEntries.map((entry) => {
              const issue = issues.find(i => i.id === entry.issue_id);
              return (
                <div key={entry.id} className="flex items-center gap-3 p-3 bg-[#161616] rounded border border-[#252525]">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{entry.hours}h</span>
                      {issue && <span className="text-xs text-[#555]">{issue.title}</span>}
                    </div>
                    {entry.description && <p className="text-xs text-[#999] mt-1">{entry.description}</p>}
                  </div>
                  <button
                    onClick={() => deleteTimeEntryMutation.mutate(entry.id)}
                    className="p-1 text-[#555] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add time entry form */}
          {showAddForm && (
            <div className="p-4 bg-[#161616] rounded border border-[#252525] space-y-3">
              <Input
                type="number"
                placeholder="Hours (e.g., 2.5)"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                min="0"
                step="0.5"
                className="bg-[#0D0D0D] border-[#252525]"
              />
              <select
                value={formData.issue_id}
                onChange={(e) => setFormData({ ...formData, issue_id: e.target.value })}
                className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#252525] rounded text-white text-sm"
              >
                <option value="">Select issue (optional)</option>
                {issues.map(issue => (
                  <option key={issue.id} value={issue.id}>{issue.title}</option>
                ))}
              </select>
              <Input
                placeholder="What did you work on?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#0D0D0D] border-[#252525]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => addTimeEntryMutation.mutate(formData)}
                  className="bg-[#5E6AD2] hover:bg-[#6B78E5]"
                  disabled={!formData.hours}
                >
                  Log Time
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="border-[#252525]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="gap-2 bg-[#5E6AD2] hover:bg-[#6B78E5]"
            >
              <Plus size={16} />
              Log Time
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}