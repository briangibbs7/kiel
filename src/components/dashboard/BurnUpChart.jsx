import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export default function BurnUpChart({ tasks, issues }) {
  const data = useMemo(() => {
    const allItems = [...(tasks || []), ...(issues || [])];
    if (allItems.length === 0) return [];

    const today = new Date();
    const startDate = subDays(today, 29);
    const days = [];

    for (let i = 0; i < 30; i++) {
      const date = subDays(today, 29 - i);
      const dateStr = format(startOfDay(date), "MMM dd");
      
      const itemsUpToDate = allItems.filter(item => {
        const createdDate = new Date(item.created_date);
        return createdDate <= date;
      });

      const completedUpToDate = itemsUpToDate.filter(item => item.status === "done").length;

      days.push({
        date: dateStr,
        total: itemsUpToDate.length,
        completed: completedUpToDate,
      });
    }

    return days;
  }, [tasks, issues]);

  if (data.length === 0) {
    return (
      <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6 h-64 flex items-center justify-center">
        <p className="text-[#666]">No data to display</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Burn-up Chart (30 days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
          <XAxis 
            dataKey="date" 
            stroke="#666" 
            style={{ fontSize: "12px" }}
            tick={{ fill: "#666" }}
          />
          <YAxis 
            stroke="#666"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#666" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#1A1A1A", 
              border: "1px solid #333",
              borderRadius: "6px"
            }}
            labelStyle={{ color: "#E5E5E5" }}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#60A5FA" 
            dot={false}
            name="Total"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#4ADE80" 
            dot={false}
            name="Completed"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}