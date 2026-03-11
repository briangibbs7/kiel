import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function TimeTrackingPanel({ issueId }) {
  const [showForm, setShowForm] = useState(false);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['issueTimeEntries', issueId],
    queryFn: () => base44.entities.TimeEntry.filter({ issue_id: issueId })
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.TimeEntry.create({
        issue_id: issueId,
        user_email: user?.email,
        hours: parseFloat(hours),
        description,
        date: format(new Date(), 'yyyy-MM-dd')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueTimeEntries'] });
      setHours('');
      setDescription('');
      setShowForm(false);
    }
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: (id) => base44.entities.TimeEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueTimeEntries'] });
    }
  });

  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

  return (
    <div className="p-4 bg-[#161616] rounded-lg border border-[#252525]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock size={14} />
          Time Logged: {totalHours.toFixed(1)}h
        </h3>
      </div>

      {showForm ? (
        <div className="space-y-2 mb-3">
          <Input
            type="number"
            placeholder="Hours (e.g., 2.5)"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            min="0"
            step="0.5"
            className="bg-[#0D0D0D] border-[#252525] text-sm"
          />
          <Input
            placeholder="What did you work on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#0D0D0D] border-[#252525] text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => addTimeEntryMutation.mutate()}
              className="bg-[#5E6AD2] hover:bg-[#6B78E5] text-xs"
              disabled={!hours}
            >
              Log Time
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="border-[#252525] text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="border-[#252525] gap-2 text-xs w-full mb-3"
        >
          <Plus size={12} />
          Log Time
        </Button>
      )}

      {timeEntries.length > 0 && (
        <div className="space-y-1 text-xs">
          {timeEntries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between p-2 bg-[#0D0D0D] rounded">
              <div>
                <span className="font-medium text-white">{entry.hours}h</span>
                {entry.description && <p className="text-[#999]">{entry.description}</p>}
                <p className="text-[#555] text-[11px]">{format(new Date(entry.date), 'MMM d')}</p>
              </div>
              <button
                onClick={() => deleteTimeEntryMutation.mutate(entry.id)}
                className="text-[#555] hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}