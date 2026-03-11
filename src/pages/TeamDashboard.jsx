import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Users, Calendar, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors = {
  backlog: "#666",
  todo: "#888",
  in_progress: "#60A5FA",
  in_review: "#A78BFA",
  done: "#4ADE80",
};

export default function TeamDashboard() {
  const { data: sprints = [] } = useQuery({
    queryKey: ["all-sprints"],
    queryFn: () => base44.entities.Sprint.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["all-issues"],
    queryFn: () => base44.entities.Issue.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const metrics = useMemo(() => {
    const activeSprint = sprints.find((s) => s.status === "active");
    
    // Calculate velocity
    let sprintTasks = [];
    let completedPoints = 0;
    let plannedPoints = 0;

    if (activeSprint) {
      sprintTasks = tasks.filter((t) => {
        const taskDate = new Date(t.created_date);
        const sprintStart = new Date(activeSprint.start_date);
        const sprintEnd = new Date(activeSprint.end_date);
        return taskDate >= sprintStart && taskDate <= sprintEnd;
      });

      completedPoints = sprintTasks
        .filter((t) => t.status === "done" || t.status === "in_review")
        .reduce((sum, t) => sum + (t.story_points || 0), 0);

      plannedPoints = sprintTasks.reduce((sum, t) => sum + (t.story_points || 0), 0);
    }

    // Calculate workload per user
    const workloadMap = {};
    [...tasks, ...issues].forEach((item) => {
      if (item.assignee) {
        workloadMap[item.assignee] = (workloadMap[item.assignee] || 0) + 1;
      }
    });

    const workloadData = Object.entries(workloadMap)
      .map(([user, count]) => ({
        user: user.split("@")[0],
        tasks: count,
      }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 8);

    // Get upcoming deadlines
    const upcomingDeadlines = [...tasks, ...issues]
      .filter((item) => {
        if (!item.due_date) return false;
        const dueDate = new Date(item.due_date);
        const today = new Date();
        return dueDate > today && dueDate - today < 14 * 24 * 60 * 60 * 1000; // Next 2 weeks
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 10);

    // Project health summary
    const projectHealth = projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.project_id === p.id);
      const projectIssues = issues.filter((i) => i.project_id === p.id);
      const completedTasks = projectTasks.filter((t) => t.status === "done").length;
      const completedIssues = projectIssues.filter((i) => i.status === "done").length;
      const totalItems = projectTasks.length + projectIssues.length;
      const completed = completedTasks + completedIssues;
      const progress = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;

      return {
        name: p.name,
        progress,
        health: p.health || "on_track",
      };
    });

    // Sprint velocity trend (last 3 sprints)
    const completedSprints = sprints
      .filter((s) => s.status === "completed")
      .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
      .slice(0, 3);

    const velocityData = completedSprints.map((sprint) => {
      const sprintItems = tasks.filter((t) => {
        const taskDate = new Date(t.created_date);
        const sprintStart = new Date(sprint.start_date);
        const sprintEnd = new Date(sprint.end_date);
        return taskDate >= sprintStart && taskDate <= sprintEnd;
      });
      const points = sprintItems.reduce((sum, t) => sum + (t.story_points || 0), 0);
      return {
        sprint: sprint.name,
        velocity: points,
      };
    }).reverse();

    return {
      activeSprint,
      completedPoints,
      plannedPoints,
      workloadData,
      upcomingDeadlines,
      projectHealth,
      velocityData,
      totalTeamTasks: tasks.length + issues.length,
      completedTeamTasks: [...tasks, ...issues].filter((t) => t.status === "done").length,
    };
  }, [sprints, tasks, issues, projects]);

  const velocityPercent = metrics.plannedPoints > 0 ? Math.round((metrics.completedPoints / metrics.plannedPoints) * 100) : 0;
  const teamProgress = metrics.totalTeamTasks > 0 ? Math.round((metrics.completedTeamTasks / metrics.totalTeamTasks) * 100) : 0;

  return (
    <div className="h-full bg-[#0D0D0D] overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Dashboard</h1>
          <p className="text-[#999]">Real-time overview of team performance and workload</p>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#999]">Sprint Velocity</p>
              <TrendingUp className="w-4 h-4 text-[#5E6AD2]" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.completedPoints}</p>
            <p className="text-xs text-[#666] mt-1">of {metrics.plannedPoints} points ({velocityPercent}%)</p>
          </Card>

          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#999]">Team Progress</p>
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            </div>
            <p className="text-2xl font-bold text-white">{teamProgress}%</p>
            <p className="text-xs text-[#666] mt-1">{metrics.completedTeamTasks} of {metrics.totalTeamTasks} completed</p>
          </Card>

          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#999]">Active Sprint</p>
              <Calendar className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.activeSprint?.name || "None"}</p>
            {metrics.activeSprint && (
              <p className="text-xs text-[#666] mt-1">
                {new Date(metrics.activeSprint.end_date).toLocaleDateString()}
              </p>
            )}
          </Card>

          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#999]">Upcoming Deadlines</p>
              <AlertCircle className="w-4 h-4 text-[#FFA500]" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.upcomingDeadlines.length}</p>
            <p className="text-xs text-[#666] mt-1">in next 2 weeks</p>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workload Distribution */}
          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Workload Distribution</h2>
            {metrics.workloadData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.workloadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="user" stroke="#666" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }} />
                  <Bar dataKey="tasks" fill="#5E6AD2" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-sm text-[#666]">No workload data available</p>
              </div>
            )}
          </Card>

          {/* Sprint Velocity Trend */}
          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Velocity Trend</h2>
            {metrics.velocityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.velocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="sprint" stroke="#666" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333" }} />
                  <Legend wrapperStyle={{ color: "#999" }} />
                  <Line type="monotone" dataKey="velocity" stroke="#5E6AD2" strokeWidth={2} name="Story Points" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-sm text-[#666]">No velocity data available</p>
              </div>
            )}
          </Card>
        </div>

        {/* Project Health & Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Health */}
          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Project Health</h2>
            <div className="space-y-3">
              {metrics.projectHealth.map((project) => (
                <div key={project.name}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-white">{project.name}</p>
                    <span className="text-xs text-[#666]">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-[#0D0D0D] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor:
                          project.health === "on_track"
                            ? "#4ADE80"
                            : project.health === "at_risk"
                              ? "#FFA500"
                              : "#F87171",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h2>
            {metrics.upcomingDeadlines.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {metrics.upcomingDeadlines.map((item) => (
                  <div key={item.id} className="p-2 bg-[#0D0D0D] border border-[#252525] rounded">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate font-medium">{item.title}</p>
                        <p className="text-xs text-[#666] mt-1">
                          Due {formatDistanceToNow(new Date(item.due_date), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge className="bg-[#FFA500] text-white text-xs flex-shrink-0">
                        {Math.ceil((new Date(item.due_date) - new Date()) / (1000 * 60 * 60 * 24))}d
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#666] text-center py-12">No upcoming deadlines</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}