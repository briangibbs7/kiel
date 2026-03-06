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
  LogOut,
  LayoutList,
  Bell,
  Settings,
  BarChart3,
  MessageCircle } from
"lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";
import NotificationBell from "@/components/notifications/NotificationBell";

const navItems = [
{ name: "Inbox", icon: Inbox, page: "Inbox" },
{ name: "My Issues", icon: ListTodo, page: "MyIssues" },
{ name: "Projects", icon: Folder, page: "Projects" },
{ name: "Backlog", icon: FileText, page: "Backlog" },
{ name: "Tasks", icon: ListTodo, page: "Tasks" },
{ name: "Messages", icon: MessageCircle, page: "DirectMessages" },
{ name: "Roadmap", icon: Rocket, page: "Roadmap" },
{ name: "Reports", icon: BarChart3, page: "Reports" },
{ name: "Initiatives", icon: Rocket, page: "Initiatives" }];


const sidebarPositions = [
{ value: "left", label: "Left" },
{ value: "right", label: "Right" },
{ value: "top", label: "Top" }];


export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarPos, setSidebarPos] = useState("left");
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setSidebarPos(u?.sidebar_position || "left");
    }).catch(() => {});
  }, []);

  const handlePositionChange = async (position) => {
    setSidebarPos(position);
    await base44.auth.updateMe({ sidebar_position: position });
  };

  const isSidebarVertical = sidebarPos === "left" || sidebarPos === "right";
  const isSidebarTop = sidebarPos === "top";

  return (
    <div className={`h-screen bg-[#0D0D0D] overflow-hidden ${isSidebarVertical ? "flex" : "flex flex-col"}`}>
      {/* Sidebar - Top */}
      {isSidebarTop &&
      <aside className="h-16 flex-shrink-0 bg-[#111111] border-b border-[#1E1E1E] flex items-center px-4 gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED]">
              <span className="text-[8px] font-bold text-white flex items-center justify-center h-full">PM</span>
            </div>
            <span className="text-sm font-semibold text-[#E5E5E5]">Workspace</span>
          </div>
          <nav className="flex gap-0.5 flex-1 ml-4">
            {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-[12px] transition-colors whitespace-nowrap ${
                isActive ?
                "bg-[#1E1E1E] text-white" :
                "text-[#8A8A8A] hover:text-[#CCC] hover:bg-[#161616]"}`
                }>

                  <item.icon size={14} />
                  {item.name}
                </Link>);

          })}
          </nav>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-[#555] hover:text-white transition-colors flex-shrink-0">
                <LayoutList size={16} className="text-slate-100 lucide lucide-layout-list" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 bg-[#1A1A1A] border-[#333] p-2">
              <div className="space-y-1">
                {sidebarPositions.map((pos) =>
              <button
                key={pos.value}
                onClick={() => handlePositionChange(pos.value)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                sidebarPos === pos.value ?
                "bg-[#5E6AD2] text-white" :
                "text-[#999] hover:bg-[#252525] hover:text-white"}`
                }>

                    {pos.label}
                  </button>
              )}
              </div>
            </PopoverContent>
          </Popover>
        </aside>
      }

      {/* Sidebar - Left/Right */}
      {isSidebarVertical &&
      <aside className={`w-56 flex-shrink-0 bg-[#111111] ${sidebarPos === "left" ? "border-r" : "border-l"} border-[#1E1E1E] flex flex-col ${sidebarPos === "right" ? "order-last" : ""}`}>
        {isSidebarVertical &&
        <>
            {/* Workspace header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-[#1E1E1E]">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">PM</span>
                    </div>
                    <span className="text-sm font-semibold text-[#E5E5E5]">Workspace</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className={`w-48 bg-[#1A1A1A] border-[#333] p-0 ${sidebarPos === "right" ? "mr-2" : "ml-2"}`} side={sidebarPos === "right" ? "left" : "right"}>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigate(createPageUrl("UserManagement"))}
                      className="w-full text-left text-sm px-4 py-2.5 text-[#CCC] hover:bg-[#252525] transition-colors"
                    >
                      User Management
                    </button>
                    <button
                      onClick={() => navigate(createPageUrl("RoleManagement"))}
                      className="w-full text-left text-sm px-4 py-2.5 text-[#CCC] hover:bg-[#252525] transition-colors"
                    >
                      Role Management
                    </button>
                    <button
                      onClick={() => navigate(createPageUrl("Security"))}
                      className="w-full text-left text-sm px-4 py-2.5 text-[#CCC] hover:bg-[#252525] transition-colors"
                    >
                      Security
                    </button>
                    <div className="border-t border-[#252525]" />
                    <button
                      onClick={() => base44.auth.logout()}
                      className="w-full text-left text-sm px-4 py-2.5 text-[#F87171] hover:bg-[#252525] transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-1">
                <button className="p-1 text-[#6B6B6B] hover:text-white transition-colors">
                  <Search size={14} />
                </button>
                <button
                onClick={() => navigate(createPageUrl("MyIssues") + "?create=true")}
                className="p-1 text-[#6B6B6B] hover:text-white transition-colors">

                  <PenSquare size={14} />
                </button>
                <NotificationBell />
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1 text-[#6B6B6B] hover:text-white transition-colors">
                      <LayoutList size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className={`w-40 bg-[#1A1A1A] border-[#333] p-2 ${sidebarPos === "right" ? "mr-2" : "ml-2"}`} side={sidebarPos === "right" ? "left" : "right"}>
                    <div className="space-y-1">
                      {sidebarPositions.map((pos) =>
                    <button
                      key={pos.value}
                      onClick={() => handlePositionChange(pos.value)}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                      sidebarPos === pos.value ?
                      "bg-[#5E6AD2] text-white" :
                      "text-[#999] hover:bg-[#252525] hover:text-white"}`
                      }>

                          {pos.label}
                        </button>
                    )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </>
        }

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
                  isActive ?
                  "bg-[#1E1E1E] text-white" :
                  "text-[#8A8A8A] hover:text-[#CCC] hover:bg-[#161616]"}`
                  }>

                  <item.icon size={15} className="flex-shrink-0" />
                  {item.name}
                </Link>);

            })}
          </div>

          <div className="px-4 mt-6 mb-2">
            <span className="text-[10px] font-semibold text-[#444] uppercase tracking-wider">Workspace</span>
          </div>
          <div className="px-2 space-y-0.5">
            <Link
              to={createPageUrl("Initiatives")}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
              currentPageName === "Initiatives" ? "text-white" : "text-[#8A8A8A] hover:text-[#CCC] hover:bg-[#161616]"}`
              }>

              <Rocket size={15} />
              Initiatives
            </Link>
            <Link
              to={createPageUrl("Projects")}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
              currentPageName === "Projects" ? "text-white" : "text-[#8A8A8A] hover:text-[#CCC] hover:bg-[#161616]"}`
              }>

              <Folder size={15} />
              Projects
            </Link>
          </div>
        </nav>

        {isSidebarVertical &&
        <>
            {/* User */}
            {user &&
          <div className="px-3 py-3 border-t border-[#1E1E1E] flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#5E6AD2] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {user.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-xs text-[#999] truncate">{user.full_name || user.email}</span>
                </div>
                <button onClick={() => navigate(createPageUrl("NotificationSettings"))} className="text-[#555] hover:text-white transition-colors" title="Notification settings">
                  <Settings size={13} />
                </button>
              </div>
          }
          </>
        }
      </aside>
      }



      {/* Main content */}
      <main className={`${isSidebarVertical ? "flex-1" : "flex-1"} overflow-hidden`}>
        {children}
      </main>
    </div>);

}