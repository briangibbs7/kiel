import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function EpicAnalyticsPage() {
  const [selectedEpicId, setSelectedEpicId] = useState("");

  const { data: epics = [] } = useQuery({
    queryKey: ["all-epics"],
    queryFn: () => base44.entities.Epic.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["all-issues"],
    queryFn: () => base44.entities.Issue.list(),
  });

  const selectedEpic = epics.find((e) => e.id === selectedEpicId) || epics[0];

  const epicData = useMemo(() => {
    if (!selectedEpic) return null;

    const epicTasks = tasks.filter((t) => t.epic_id === selectedEpic.id);
    const epicIssues = issues.filter((i) => i.epic_id === selectedEpic.id);
    const storyPoints = epicTasks.reduce((sum, t) => sum + (t.story_points || 0), 0);

    // Simulate time-series data based on created dates
    const timeSeriesData = [];
    const dates = new Set();

    epicTasks.forEach((t) => {
      if (t.created_date) dates.add(new Date(t.created_date).toLocaleDateString());
    });
    epicIssues.forEach((i) => {
      if (i.created_date) dates.add(new Date(i.created_date).toLocaleDateString());
    });

    const sortedDates = Array.from(dates).sort((a, b) => new Date(a) - new Date(b));

    let cumulativeTasks = 0,
      cumulativeIssues = 0,
      cumulativePoints = 0;

    sortedDates.forEach((date) => {
      const tasksOnDate = epicTasks.filter((t) => t.created_date && new Date(t.created_date).toLocaleDateString() === date).length;
      const issuesOnDate = epicIssues.filter((i) => i.created_date && new Date(i.created_date).toLocaleDateString() === date).length;
      const pointsOnDate = epicTasks
        .filter((t) => t.created_date && new Date(t.created_date).toLocaleDateString() === date)
        .reduce((sum, t) => sum + (t.story_points || 0), 0);

      cumulativeTasks += tasksOnDate;
      cumulativeIssues += issuesOnDate;
      cumulativePoints += pointsOnDate;

      timeSeriesData.push({
        date,
        tasks: cumulativeTasks,
        issues: cumulativeIssues,
        storyPoints: cumulativePoints,
      });
    });

    return {
      epic: selectedEpic,
      issueCount: epicIssues.length,
      taskCount: epicTasks.length,
      storyPoints,
      timeSeriesData,
    };
  }, [selectedEpic, tasks, issues]);

  if (!epicData) return null;

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Epic Analytics</h1>
        <Select value={selectedEpicId} onValueChange={setSelectedEpicId}>
          <SelectTrigger className="w-64 bg-[#1A1A1A] border-[#333] text-white">
            <SelectValue placeholder="Select an epic" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#333]">
            {epics.map((epic) => (
              <SelectItem key={epic.id} value={epic.id}>
                {epic.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#111] border-[#1E1E1E] p-4">
          <p className="text-sm text-[#999] mb-1">Epic Name</p>
          <p className="text-xl font-bold text-white">{epicData.epic.title}</p>
        </Card>
        <Card className="bg-[#111] border-[#1E1E1E] p-4">
          <p className="text-sm text-[#999] mb-1">Issues</p>
          <p className="text-xl font-bold text-white">{epicData.issueCount}</p>
        </Card>
        <Card className="bg-[#111] border-[#1E1E1E] p-4">
          <p className="text-sm text-[#999] mb-1">Tasks</p>
          <p className="text-xl font-bold text-white">{epicData.taskCount}</p>
        </Card>
        <Card className="bg-[#111] border-[#1E1E1E] p-4">
          <p className="text-sm text-[#999] mb-1">Story Points</p>
          <p className="text-xl font-bold text-white">{epicData.storyPoints}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Growth */}
        <Card className="bg-[#111] border-[#1E1E1E] p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Cumulative Growth Over Time</h2>
          {epicData.timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={epicData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" style={{ fontSize: "12px" }} />
                <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333", borderRadius: "4px" }} />
                <Legend wrapperStyle={{ color: "#999" }} />
                <Line type="monotone" dataKey="tasks" stroke="#5E6AD2" strokeWidth={2} name="Tasks" />
                <Line type="monotone" dataKey="issues" stroke="#60A5FA" strokeWidth={2} name="Issues" />
                <Line type="monotone" dataKey="storyPoints" stroke="#A78BFA" strokeWidth={2} name="Story Points" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#666] text-center py-12">No historical data available</p>
          )}
        </Card>

        {/* Distribution */}
        <Card className="bg-[#111] border-[#1E1E1E] p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Current Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Tasks", value: epicData.taskCount },
                { name: "Issues", value: epicData.issueCount },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" style={{ fontSize: "12px" }} />
              <YAxis stroke="#666" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333", borderRadius: "4px" }} />
              <Bar dataKey="value" fill="#5E6AD2" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}