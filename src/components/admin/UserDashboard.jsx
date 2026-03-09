import React from "react";
import { Users, UserCheck, Shield, Crown } from "lucide-react";

export default function UserDashboard({ users }) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const projectAdmins = users.filter((u) => u.role === "admin").length;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "#5E6AD2" },
    { label: "Active Users", value: activeUsers, icon: UserCheck, color: "#4ADE80" },
    { label: "Project Admins", value: projectAdmins, icon: Shield, color: "#FACC15" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#999] mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.color + "20", color: stat.color }}
              >
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}