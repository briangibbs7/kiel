import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { FileText, Eye, Edit, Star, TrendingUp, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = ["#5E6AD2", "#4ADE80", "#F87171", "#FACC15", "#60A5FA", "#A78BFA", "#FB923C", "#22D3EE"];

export default function ConfluenceAnalytics() {
  const { data: pages = [] } = useQuery({
    queryKey: ["all-pages-analytics"],
    queryFn: () => base44.entities.Page.list("-updated_date", 500),
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => base44.entities.Space.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["all-page-comments"],
    queryFn: () => base44.entities.PageComment.list("-created_date", 200),
  });

  const metrics = useMemo(() => {
    const total = pages.length;
    const published = pages.filter((p) => p.status === "published").length;
    const drafts = pages.filter((p) => p.status === "draft").length;
    const archived = pages.filter((p) => p.status === "archived").length;

    // Pages per space
    const bySpace = spaces.map((s) => ({
      name: s.name,
      pages: pages.filter((p) => p.space_id === s.id).length,
    })).sort((a, b) => b.pages - a.pages).slice(0, 8);

    // Status breakdown
    const statusData = [
      { name: "Published", value: published, color: "#4ADE80" },
      { name: "Draft", value: drafts, color: "#FACC15" },
      { name: "Archived", value: archived, color: "#666" },
    ].filter((d) => d.value > 0);

    // Pages created per day (last 14 days)
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      const dateStr = format(date, "MMM d");
      const count = pages.filter(
        (p) => format(new Date(p.created_date), "MMM d") === dateStr
      ).length;
      return { date: dateStr, count };
    });

    // Top labels
    const labelCount = {};
    pages.forEach((p) => p.labels?.forEach((l) => { labelCount[l] = (labelCount[l] || 0) + 1; }));
    const topLabels = Object.entries(labelCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => ({ label, count }));

    // Most active pages (by comments)
    const commentsByPage = {};
    comments.forEach((c) => { commentsByPage[c.page_id] = (commentsByPage[c.page_id] || 0) + 1; });
    const topPages = Object.entries(commentsByPage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pageId, count]) => {
        const page = pages.find((p) => p.id === pageId);
        return { title: page?.title || "Unknown", comments: count };
      });

    return { total, published, drafts, archived, bySpace, statusData, last14Days, topLabels, topPages };
  }, [pages, spaces, comments]);

  return (
    <div className="h-full bg-[#0D0D0D] overflow-auto">
      <div className="p-6 border-b border-[#1E1E1E]">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-[#999] mt-1">Insights into your knowledge base</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Pages", value: metrics.total, icon: FileText, color: "#5E6AD2" },
            { label: "Published", value: metrics.published, icon: Eye, color: "#4ADE80" },
            { label: "Drafts", value: metrics.drafts, icon: Edit, color: "#FACC15" },
            { label: "Spaces", value: spaces.length, icon: Layers, color: "#A78BFA" },
          ].map((m) => (
            <Card key={m.label} className="bg-[#111] border-[#1E1E1E] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#999]">{m.label}</p>
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{m.value}</p>
            </Card>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pages created over time */}
          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5E6AD2]" />
              Pages Created (Last 14 Days)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={metrics.last14Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis dataKey="date" stroke="#444" style={{ fontSize: "11px" }} />
                <YAxis stroke="#444" style={{ fontSize: "11px" }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#fff" }} />
                <Line type="monotone" dataKey="count" stroke="#5E6AD2" strokeWidth={2} dot={{ fill: "#5E6AD2", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Status breakdown */}
          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <h2 className="text-base font-semibold text-white mb-4">Status Breakdown</h2>
            {metrics.statusData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={metrics.statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {metrics.statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {metrics.statusData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-[#CCC]">{d.name}</span>
                      <span className="text-sm font-semibold text-white">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#555] text-center py-12">No pages yet</p>
            )}
          </Card>
        </div>

        {/* Pages per space + top labels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <h2 className="text-base font-semibold text-white mb-4">Pages per Space</h2>
            {metrics.bySpace.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={metrics.bySpace} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                  <XAxis type="number" stroke="#444" style={{ fontSize: "11px" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#444" style={{ fontSize: "11px" }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#fff" }} />
                  <Bar dataKey="pages" fill="#5E6AD2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#555] text-center py-12">No data</p>
            )}
          </Card>

          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <h2 className="text-base font-semibold text-white mb-4">Top Labels</h2>
            {metrics.topLabels.length === 0 ? (
              <p className="text-sm text-[#555] text-center py-12">No labels used yet</p>
            ) : (
              <div className="space-y-3">
                {metrics.topLabels.map((l, i) => (
                  <div key={l.label} className="flex items-center gap-3">
                    <span className="text-xs text-[#666] w-4">{i + 1}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${Math.round((l.count / metrics.topLabels[0].count) * 100)}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <span className="text-xs text-[#999] w-20 truncate">{l.label}</span>
                    <span className="text-xs font-semibold text-white w-6 text-right">{l.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Most discussed pages */}
        {metrics.topPages.length > 0 && (
          <Card className="bg-[#111] border-[#1E1E1E] p-4">
            <h2 className="text-base font-semibold text-white mb-4">Most Discussed Pages</h2>
            <div className="space-y-2">
              {metrics.topPages.map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1E1E1E] last:border-0">
                  <span className="text-sm font-bold text-[#5E6AD2] w-5">{i + 1}</span>
                  <FileText className="w-4 h-4 text-[#555]" />
                  <span className="flex-1 text-sm text-white truncate">{p.title}</span>
                  <span className="text-xs text-[#666]">{p.comments} comment{p.comments !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}