import React from "react";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

export default function ProjectMetrics({ tasks, issues }) {
  const allItems = [...(tasks || []), ...(issues || [])];
  const completed = allItems.filter(i => i.status === "done").length;
  const inProgress = allItems.filter(i => i.status === "in_progress").length;
  const completionRate = allItems.length > 0 ? Math.round((completed / allItems.length) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 size={20} className="text-[#4ADE80]" />
          <h3 className="text-sm font-semibold text-[#999]">Completion Rate</h3>
        </div>
        <div className="text-3xl font-bold text-white">{completionRate}%</div>
        <p className="text-xs text-[#666] mt-1">{completed} of {allItems.length} items</p>
      </div>

      <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Circle size={20} className="text-[#60A5FA]" />
          <h3 className="text-sm font-semibold text-[#999]">In Progress</h3>
        </div>
        <div className="text-3xl font-bold text-white">{inProgress}</div>
        <p className="text-xs text-[#666] mt-1">Active tasks</p>
      </div>

      <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle size={20} className="text-[#FB923C]" />
          <h3 className="text-sm font-semibold text-[#999]">Total Items</h3>
        </div>
        <div className="text-3xl font-bold text-white">{allItems.length}</div>
        <p className="text-xs text-[#666] mt-1">Tasks & issues</p>
      </div>
    </div>
  );
}