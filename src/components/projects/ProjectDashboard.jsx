import React, { useMemo } from "react";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, Zap, Target, BarChart2, Circle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import SprintBurndownChart from "./SprintBurndownChart";
import ProjectBurnupChart from "./ProjectBurnupChart";

const PRIORITY_COLORS = {
  urgent: "#F87171",
  high:   "#FB923C",
  medium: "#FACC15",
  low:    "#4ADE80",
};
const STATUS_COLORS = {
  todo:        "#6B6B6B",
  in_progress: "#5E6AD2",
  in_review:   "#A78BFA",
  done:        "#4ADE80",
};

function StatCard({ icon: Icon, label, value, sub, color = "#5E6AD2" }) {
  return (
    <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-[#666]">{label}</p>
        {sub && <p className="text-[10px] text-[#555] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-xs text-white shadow-xl">
      {label && <p className="text-[#888] mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name}: <span className="font-semibold text-white">{p.value}</span></p>
      ))}
    </div>
  );
};

export default function ProjectDashboard({ project, tasks, sprintStart, sprintEnd }) {
  const metrics = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "done").length;
    const inProgress = tasks.filter(t => t.status === "in_progress").length;
    const inReview = tasks.filter(t => t.status === "in_review").length;
    const todo = tasks.filter(t => t.status === "todo").length;
    const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length;
    const noAssignee = tasks.filter(t => !t.assignee).length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    // Story points
    const totalPoints = tasks.reduce((s, t) => s + (t.story_points || 0), 0);
    const donePoints = tasks.filter(t => t.status === "done").reduce((s, t) => s + (t.story_points || 0), 0);

    // Days remaining
    let daysLeft = null;
    if (project?.target_date) {
      const diff = Math.ceil((new Date(project.target_date) - new Date()) / (1000 * 60 * 60 * 24));
      daysLeft = diff;
    }

    // Velocity (tasks completed in last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDone = tasks.filter(t => t.status === "done" && t.updated_date && new Date(t.updated_date) > oneWeekAgo).length;

    // Assignee workload
    const byAssignee = {};
    tasks.forEach(t => {
      const key = t.assignee || "Unassigned";
      if (!byAssignee[key]) byAssignee[key] = { total: 0, done: 0 };
      byAssignee[key].total++;
      if (t.status === "done") byAssignee[key].done++;
    });

    // Priority breakdown
    const byPriority = {};
    tasks.forEach(t => {
      const p = t.priority || "none";
      byPriority[p] = (byPriority[p] || 0) + 1;
    });

    // Status breakdown for pie
    const statusBreakdown = [
      { name: "Todo", value: todo, color: STATUS_COLORS.todo },
      { name: "In Progress", value: inProgress, color: STATUS_COLORS.in_progress },
      { name: "In Review", value: inReview, color: STATUS_COLORS.in_review },
      { name: "Done", value: done, color: STATUS_COLORS.done },
    ].filter(s => s.value > 0);

    // Tasks created per day (last 14 days)
    const activityMap = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      activityMap[d.toISOString().split("T")[0]] = 0;
    }
    tasks.forEach(t => {
      const day = t.created_date?.split("T")[0];
      if (day && activityMap[day] !== undefined) activityMap[day]++;
    });
    const activityData = Object.entries(activityMap).map(([date, count]) => ({
      date: date.slice(5), count,
    }));

    // Labels
    const labelMap = {};
    tasks.forEach(t => (t.labels || []).forEach(l => { labelMap[l] = (labelMap[l] || 0) + 1; }));
    const topLabels = Object.entries(labelMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return {
      total, done, inProgress, inReview, todo, overdue, noAssignee,
      progress, totalPoints, donePoints, daysLeft, recentDone,
      byAssignee, byPriority, statusBreakdown, activityData, topLabels,
    };
  }, [tasks, project]);

  const assigneeData = Object.entries(metrics.byAssignee)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 8)
    .map(([name, val]) => ({
      name: name.includes("@") ? name.split("@")[0] : name,
      total: val.total,
      done: val.done,
    }));

  const priorityData = Object.entries(metrics.byPriority)
    .map(([p, count]) => ({ name: p.charAt(0).toUpperCase() + p.slice(1), value: count, color: PRIORITY_COLORS[p] || "#555" }))
    .sort((a, b) => b.value - a.value);

  const healthColors = { on_track: "#4ADE80", at_risk: "#FACC15", off_track: "#F87171" };
  const healthColor = healthColors[project?.health] || "#6B6B6B";

  return (
    <div className="flex-1 overflow-auto p-5 space-y-6">
      {/* Project info banner */}
      <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {project?.icon && <span className="text-2xl">{project.icon}</span>}
              <h2 className="text-lg font-bold text-white">{project?.name}</h2>
              <span className="text-xs font-mono text-[#555] bg-[#1E1E1E] px-2 py-0.5 rounded">{project?.prefix}</span>
            </div>
            {project?.description && <p className="text-sm text-[#888] max-w-2xl">{project.description}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {project?.lead && (
              <div className="flex items-center gap-1.5 text-xs text-[#888] bg-[#1A1A1A] border border-[#252525] px-2.5 py-1 rounded-full">
                <Users size={11} /> {project.lead.split("@")[0]}
              </div>
            )}
            {project?.target_date && (
              <div className="flex items-center gap-1.5 text-xs text-[#888] bg-[#1A1A1A] border border-[#252525] px-2.5 py-1 rounded-full">
                <Target size={11} /> {new Date(project.target_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ color: healthColor, borderColor: `${healthColor}40`, background: `${healthColor}10` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: healthColor }} />
              {(project?.health || "on_track").replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-[#666]">
            <span>Overall Progress</span>
            <span className="font-semibold text-white">{metrics.progress}%</span>
          </div>
          <div className="h-2 bg-[#1E1E1E] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.progress}%`, background: `linear-gradient(90deg, #5E6AD2, #7C3AED)` }}
            />
          </div>
          <div className="flex gap-4 text-[10px] text-[#555]">
            <span>{metrics.done} done</span>
            <span>{metrics.inProgress} in progress</span>
            <span>{metrics.todo} todo</span>
            {metrics.daysLeft !== null && (
              <span className={metrics.daysLeft < 0 ? "text-[#F87171]" : metrics.daysLeft < 7 ? "text-[#FACC15]" : "text-[#555]"}>
                {metrics.daysLeft < 0 ? `${Math.abs(metrics.daysLeft)}d overdue` : `${metrics.daysLeft}d remaining`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Tasks Completed" value={`${metrics.done}/${metrics.total}`} sub={`${metrics.progress}% complete`} color="#4ADE80" />
        <StatCard icon={Clock} label="In Progress" value={metrics.inProgress} sub={`${metrics.inReview} in review`} color="#5E6AD2" />
        <StatCard icon={AlertTriangle} label="Overdue" value={metrics.overdue} sub={metrics.overdue > 0 ? "Needs attention" : "All on time"} color={metrics.overdue > 0 ? "#F87171" : "#4ADE80"} />
        <StatCard icon={Zap} label="Velocity (7d)" value={metrics.recentDone} sub="tasks completed" color="#A78BFA" />
        <StatCard icon={TrendingUp} label="Story Points Done" value={metrics.donePoints} sub={`of ${metrics.totalPoints} total pts`} color="#22D3EE" />
        <StatCard icon={Users} label="Unassigned Tasks" value={metrics.noAssignee} sub={metrics.noAssignee > 0 ? "Need owners" : "All assigned"} color={metrics.noAssignee > 0 ? "#FACC15" : "#4ADE80"} />
        <StatCard icon={BarChart2} label="Total Tasks" value={metrics.total} sub={`${metrics.total - metrics.done} remaining`} color="#FB923C" />
        {metrics.daysLeft !== null ? (
          <StatCard icon={Target} label="Days to Deadline" value={metrics.daysLeft < 0 ? `${Math.abs(metrics.daysLeft)}d late` : `${metrics.daysLeft}d`} sub={metrics.daysLeft < 0 ? "Past target date" : "Until target date"} color={metrics.daysLeft < 0 ? "#F87171" : metrics.daysLeft < 7 ? "#FACC15" : "#4ADE80"} />
        ) : (
          <StatCard icon={Target} label="No Deadline Set" value="—" sub="Set a target date" color="#555" />
        )}
      </div>

      {/* Charts row 1: Status pie + Priority bar + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Breakdown */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-4">
          <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Status Breakdown</h3>
          {metrics.statusBreakdown.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={metrics.statusBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {metrics.statusBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
                {metrics.statusBreakdown.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-[#888]">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s.name} ({s.value})
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-xs text-[#555] text-center py-8">No tasks yet</p>}
        </div>

        {/* Priority Breakdown */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-4">
          <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Priority Breakdown</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData} barSize={28} margin={{ left: -10 }}>
                <XAxis dataKey="name" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-[#555] text-center py-8">No tasks yet</p>}
        </div>

        {/* Activity (tasks created per day) */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-4">
          <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Task Creation (14 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.activityData} margin={{ left: -20 }}>
              <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#5E6AD2" strokeWidth={2} dot={false} name="Tasks created" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Workload */}
      {assigneeData.length > 0 && (
        <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-4">
          <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Team Workload</h3>
          <div className="space-y-3">
            {assigneeData.map(a => {
              const pct = a.total > 0 ? Math.round((a.done / a.total) * 100) : 0;
              return (
                <div key={a.name} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#252525] flex items-center justify-center text-[11px] font-bold text-[#999] flex-shrink-0">
                    {a.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#CCC] truncate">{a.name}</span>
                      <span className="text-[#555] ml-2 flex-shrink-0">{a.done}/{a.total} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#5E6AD2] to-[#7C3AED] transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Labels */}
      {metrics.topLabels.length > 0 && (
        <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-4">
          <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Top Labels</h3>
          <div className="flex flex-wrap gap-2">
            {metrics.topLabels.map(([label, count]) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-[#CCC] bg-[#1E1E1E] border border-[#2A2A2A] px-3 py-1 rounded-full">
                {label} <span className="text-[#555] font-semibold">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Burnup + Burndown charts */}
      <div className="space-y-4">
        <ProjectBurnupChart tasks={tasks} targetDate={project?.target_date} startDate={project?.start_date} />
        <SprintBurndownChart tasks={tasks} sprintStart={sprintStart} sprintEnd={sprintEnd} />
      </div>
    </div>
  );
}