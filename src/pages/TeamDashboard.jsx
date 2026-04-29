import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, TrendingUp, Users, Calendar, CheckCircle2, Plus, ArrowRight,
  Folder, Target, Zap, Clock, Play, ListTodo, BarChart3
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const STATUS_COLORS = { todo: "#666", in_progress: "#60A5FA", in_review: "#A78BFA", done: "#4ADE80", backlog: "#444" };
const PRIORITY_COLORS = { urgent: "#F87171", high: "#FB923C", medium: "#FACC15", low: "#555" };
const PIE_COLORS = ["#5E6AD2", "#4ADE80", "#F87171", "#FACC15", "#60A5FA", "#A78BFA"];

function QuickActionCard({ icon: Icon, label, desc, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}
      className="flex items-center gap-3 p-4 border rounded-lg hover:opacity-80 transition-all text-left group"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "22" }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" style={{ color: "var(--pm-text)" }}>{label}</p>
        <p className="text-xs truncate" style={{ color: "var(--pm-text-muted)" }}>{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 transition-colors flex-shrink-0" style={{ color: "var(--pm-text-muted)" }} />
    </button>
  );
}

export default function TeamDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: sprints = [] } = useQuery({ queryKey: ["all-sprints"], queryFn: () => base44.entities.Sprint.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ["all-tasks"], queryFn: () => base44.entities.Task.list() });
  const { data: issues = [] } = useQuery({ queryKey: ["all-issues"], queryFn: () => base44.entities.Issue.list("-created_date", 200) });
  const { data: projects = [] } = useQuery({ queryKey: ["all-projects"], queryFn: () => base44.entities.Project.list() });
  const { data: epics = [] } = useQuery({ queryKey: ["all-epics"], queryFn: () => base44.entities.Epic.list() });

  const myIssues = issues.filter((i) => i.assignee === user?.email && i.status !== "done");
  const myTasks = tasks.filter((t) => t.assignee === user?.email && t.status !== "done");

  const metrics = useMemo(() => {
    const activeSprint = sprints.find((s) => s.status === "active");
    const allItems = [...tasks, ...issues];

    const completedPoints = tasks
      .filter((t) => t.status === "done")
      .reduce((sum, t) => sum + (t.story_points || 0), 0);
    const totalPoints = tasks.reduce((sum, t) => sum + (t.story_points || 0), 0);

    const workloadMap = {};
    allItems.forEach((item) => {
      if (item.assignee) workloadMap[item.assignee] = (workloadMap[item.assignee] || 0) + 1;
    });
    const workloadData = Object.entries(workloadMap)
      .map(([u, count]) => ({ user: u.split("@")[0], tasks: count }))
      .sort((a, b) => b.tasks - a.tasks).slice(0, 8);

    const upcomingDeadlines = allItems
      .filter((item) => {
        if (!item.due_date) return false;
        const dueDate = new Date(item.due_date);
        const today = new Date();
        return dueDate > today && dueDate - today < 14 * 24 * 60 * 60 * 1000;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 8);

    const projectHealth = projects.map((p) => {
      const pTasks = tasks.filter((t) => t.project_id === p.id);
      const pIssues = issues.filter((i) => i.project_id === p.id);
      const total = pTasks.length + pIssues.length;
      const done = [...pTasks, ...pIssues].filter((t) => t.status === "done").length;
      return { name: p.name, icon: p.icon, progress: total > 0 ? Math.round((done / total) * 100) : 0, health: p.health || "on_track", id: p.id };
    });

    // Issue status distribution
    const statusDist = ["backlog", "todo", "in_progress", "in_review", "done"].map((s) => ({
      name: s.replace("_", " "),
      value: issues.filter((i) => i.status === s).length,
      color: STATUS_COLORS[s],
    })).filter((d) => d.value > 0);

    // Priority breakdown
    const priorityDist = ["urgent", "high", "medium", "low"].map((p) => ({
      name: p,
      value: issues.filter((i) => i.priority === p).length,
    }));

    // Recent activity (last 7 created issues)
    const recentActivity = [...issues].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6);

    return {
      activeSprint, completedPoints, totalPoints, workloadData, upcomingDeadlines,
      projectHealth, statusDist, priorityDist, recentActivity,
      totalItems: allItems.length,
      doneItems: allItems.filter((t) => t.status === "done").length,
      activeProjects: projects.filter((p) => p.status === "active" && !p.deleted_at).length,
    };
  }, [sprints, tasks, issues, projects]);

  const teamProgress = metrics.totalItems > 0 ? Math.round((metrics.doneItems / metrics.totalItems) * 100) : 0;
  const velocityPercent = metrics.totalPoints > 0 ? Math.round((metrics.completedPoints / metrics.totalPoints) * 100) : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="h-full overflow-auto" style={{ backgroundColor: "var(--pm-bg)" }}>
      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">

        {/* Welcome header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--pm-text)" }}>
              {greeting()}, {user?.full_name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--pm-text-secondary)" }}>Here's what's happening with your team today</p>
          </div>
          {metrics.activeSprint && (
            <div
              onClick={() => navigate(createPageUrl("SprintBoard"))}
              className="flex items-center gap-2 border rounded-lg px-4 py-2.5 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm" style={{ color: "var(--pm-text)" }}>{metrics.activeSprint.name}</span>
              <ArrowRight className="w-4 h-4" style={{ color: "var(--pm-text-muted)" }} />
            </div>
          )}
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Projects", value: metrics.activeProjects, icon: Folder, color: "#5E6AD2", page: "Projects" },
            { label: "Team Progress", value: `${teamProgress}%`, sub: `${metrics.doneItems}/${metrics.totalItems} done`, icon: CheckCircle2, color: "var(--pm-green)", page: "MyIssues" },
            { label: "My Open Issues", value: myIssues.length, sub: `${myTasks.length} tasks`, icon: ListTodo, color: "var(--pm-blue)", page: "MyIssues" },
            { label: "Upcoming Deadlines", value: metrics.upcomingDeadlines.length, sub: "in next 2 weeks", icon: AlertCircle, color: "var(--pm-orange)", page: "MyIssues" },
          ].map((stat) => (
            <Card
              key={stat.label}
              onClick={() => navigate(createPageUrl(stat.page))}
              className="p-4 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm" style={{ color: "var(--pm-text-secondary)" }}>{stat.label}</p>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--pm-text)" }}>{stat.value}</p>
              {stat.sub && <p className="text-xs mt-1" style={{ color: "var(--pm-text-muted)" }}>{stat.sub}</p>}
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--pm-text-muted)" }}>Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickActionCard icon={Plus} label="New Project" desc="Start from template" color="#5E6AD2" onClick={() => navigate(createPageUrl("Projects") + "?create=true")} />
            <QuickActionCard icon={Zap} label="New Issue" desc="Track a bug or feature" color="var(--pm-blue)" onClick={() => navigate(createPageUrl("MyIssues") + "?create=true")} />
            <QuickActionCard icon={Play} label="Sprint Board" desc="Manage active sprint" color="var(--pm-green)" onClick={() => navigate(createPageUrl("SprintBoard"))} />
            <QuickActionCard icon={BarChart3} label="View Reports" desc="Team analytics" color="var(--pm-purple)" onClick={() => navigate(createPageUrl("Reports"))} />
          </div>
        </div>

        {/* My Work */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: "var(--pm-text)" }}>My Issues</h2>
              <button onClick={() => navigate(createPageUrl("MyIssues"))} className="text-xs text-[#5E6AD2] hover:underline">View all</button>
            </div>
            {myIssues.length === 0 ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--pm-border-light)" }} />
                <p className="text-xs" style={{ color: "var(--pm-text-muted)" }}>You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myIssues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: "var(--pm-border)" }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLORS[issue.priority] || "var(--pm-text-muted)" }} />
                    <p className="text-sm flex-1 truncate" style={{ color: "var(--pm-text)" }}>{issue.title}</p>
                    <span className="text-[10px]" style={{ color: STATUS_COLORS[issue.status] }}>{issue.status?.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: "var(--pm-text)" }}>Project Health</h2>
              <button onClick={() => navigate(createPageUrl("Projects"))} className="text-xs text-[#5E6AD2] hover:underline">View all</button>
            </div>
            {metrics.projectHealth.length === 0 ? (
              <div className="py-6 text-center">
                <Folder className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--pm-border-light)" }} />
                <p className="text-xs" style={{ color: "var(--pm-text-muted)" }}>No projects yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.projectHealth.slice(0, 5).map((p) => (
                  <div key={p.id} onClick={() => navigate(createPageUrl("ProjectDetail") + `?id=${p.id}`)} className="cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm group-hover:text-[#5E6AD2] transition-colors truncate flex items-center gap-1.5" style={{ color: "var(--pm-text)" }}>
                        <span>{p.icon || "📋"}</span> {p.name}
                      </p>
                      <span className="text-xs" style={{ color: "var(--pm-text-muted)" }}>{p.progress}%</span>
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ backgroundColor: "var(--pm-border)" }}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${p.progress}%`, backgroundColor: p.health === "on_track" ? "var(--pm-green)" : p.health === "at_risk" ? "var(--pm-orange)" : "var(--pm-red)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: "var(--pm-text)" }}>Upcoming Deadlines</h2>
              <Clock className="w-4 h-4" style={{ color: "var(--pm-text-muted)" }} />
            </div>
            {metrics.upcomingDeadlines.length === 0 ? (
              <div className="py-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--pm-border-light)" }} />
                <p className="text-xs" style={{ color: "var(--pm-text-muted)" }}>No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-2">
                {metrics.upcomingDeadlines.slice(0, 5).map((item) => {
                  const daysLeft = Math.ceil((new Date(item.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={item.id} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: "var(--pm-border)" }}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${daysLeft <= 2 ? "bg-red-400" : daysLeft <= 5 ? "bg-orange-400" : "bg-yellow-400"}`} />
                      <p className="text-sm flex-1 truncate" style={{ color: "var(--pm-text)" }}>{item.title}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${daysLeft <= 2 ? "bg-red-900/40 text-red-400" : daysLeft <= 5 ? "bg-orange-900/40 text-orange-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                        {daysLeft}d
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: "var(--pm-text)" }}>Workload Distribution</h2>
            {metrics.workloadData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={metrics.workloadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--pm-border)" />
                  <XAxis dataKey="user" stroke="var(--pm-text-muted)" style={{ fontSize: "11px" }} />
                  <YAxis stroke="var(--pm-text-muted)" style={{ fontSize: "11px" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--pm-popover)", border: "1px solid var(--pm-border-light)", color: "var(--pm-text)" }} />
                  <Bar dataKey="tasks" fill="#5E6AD2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center">
                <p className="text-sm" style={{ color: "var(--pm-text-muted)" }}>No workload data</p>
              </div>
            )}
          </Card>

          <Card className="p-4" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: "var(--pm-text)" }}>Issue Status Breakdown</h2>
            {metrics.statusDist.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={metrics.statusDist} cx="50%" cy="50%" innerRadius={48} outerRadius={78} dataKey="value">
                      {metrics.statusDist.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--pm-popover)", border: "1px solid var(--pm-border-light)", color: "var(--pm-text)" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {metrics.statusDist.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs flex-1 capitalize" style={{ color: "var(--pm-text-secondary)" }}>{d.name}</span>
                      <span className="text-xs font-semibold" style={{ color: "var(--pm-text)" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center">
                <p className="text-sm" style={{ color: "var(--pm-text-muted)" }}>No issues yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-4" style={{ backgroundColor: "var(--pm-surface)", borderColor: "var(--pm-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "var(--pm-text)" }}>Recent Activity</h2>
            <button onClick={() => navigate(createPageUrl("MyIssues"))} className="text-xs text-[#5E6AD2] hover:underline">View all issues</button>
          </div>
          {metrics.recentActivity.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--pm-text-muted)" }}>No recent activity</p>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--pm-border)" }}>
              {metrics.recentActivity.map((issue) => (
                <div key={issue.id} className="py-2.5 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[issue.status] }} />
                  <p className="text-sm flex-1 truncate" style={{ color: "var(--pm-text)" }}>{issue.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {issue.priority && (
                      <span className="text-[10px]" style={{ color: PRIORITY_COLORS[issue.priority] }}>{issue.priority}</span>
                    )}
                    {issue.assignee && (
                      <div className="w-5 h-5 rounded-full bg-[#5E6AD2] flex items-center justify-center text-[9px] text-white" title={issue.assignee}>
                        {issue.assignee[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-[10px]" style={{ color: "var(--pm-text-muted)" }}>
                      {formatDistanceToNow(new Date(issue.created_date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}