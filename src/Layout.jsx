import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Inbox,
  ListTodo,
  FileText,
  Folder,
  Rocket,
  MoreHorizontal,
  Search,
  PenSquare,
  Star,
  ChevronDown,
  LogOut
} from "lucide-react";

const navItems = [
  { name: "Inbox", icon: Inbox, page: "Inbox" },
  { name: "My Issues", icon: ListTodo, page: "MyIssues" },
  { name: "Projects", icon: Folder, page: "Projects" },
  { name: "Initiatives", icon: Rocket, page: "Initiatives" },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-[#0D0D0D] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#111111] border-r border-[#1E1E1E] flex flex-col">
        {/* Workspace header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#1E1E1E]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">PM</span>
            </div>
            <span className="text-sm font-semibold text-[#E5E5E5]">Workspace</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 text-[#6B6B6B] hover:text-white transition-colors">
              <Search size={14} />
            </button>
            <button
              onClick={() => navigate(createPageUrl("MyIssues") + "?create=true")}
              className="p-1 text-[#6B6B6B] hover:text-white transition-colors"
            >
              <PenSquare size={14} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <div className="px-2 space-y-0.5">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                    isActive
                      ? "bg-[#1E1E1E] text-white"
                      : "text-[#8A8A8A] hover:text-[#CCC] hover:bg-[#161616]"
                  }`}
                >
                  <item.icon size={15} className="flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="px-4 mt-6 mb-2">
            <span className="text-[10px] font-semibold text-[#444] uppercase tracking-wider">Workspace</span>
          </div>
          <div className="px-2 space-y-0.5">
            <Link
              to={createPageUrl("Initiatives")}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                currentPageName === "Initiatives" ? "text-white" : "text-[#8A8A8A] hover:text-[#CCC] hover:bg-[#161616]"
              }`}
            >
              <Rocket size={15} />
              Initiatives
            </Link>
            <Link
              to={createPageUrl("Projects")}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                currentPageName === "Projects" ? "text-white" : "text-[#8A8A8A] hover:text-[#CCC] hover:bg-[#161616]"
              }`}
            >
              <Folder size={15} />
              Projects
            </Link>
          </div>
        </nav>

        {/* User */}
        {user && (
          <div className="px-3 py-3 border-t border-[#1E1E1E] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#5E6AD2] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                {user.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-xs text-[#999] truncate">{user.full_name || user.email}</span>
            </div>
            <button onClick={() => base44.auth.logout()} className="text-[#555] hover:text-white transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}