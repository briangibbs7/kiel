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
  ChevronRight,
  LogOut,
  LayoutList,
  Bell,
  Settings,
  BarChart3,
  MessageCircle,
  LayoutGrid,
  Grid3x3 } from
"lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";
import NotificationBell from "@/components/notifications/NotificationBell";
import GlobalSearch from "@/components/search/GlobalSearch";

const navSections = [
{
  label: "My Work",
  items: [
  { name: "Team Dashboard", icon: LayoutGrid, page: "TeamDashboard" },
  { name: "Inbox", icon: Inbox, page: "Inbox" },
  { name: "My Issues", icon: ListTodo, page: "MyIssues" },
  { name: "Messages", icon: MessageCircle, page: "DirectMessages" }]

},
{
  label: "Work",
  items: [
  { name: "For You", icon: Star, page: "ForYou" },
  { name: "Tasks", icon: ListTodo, page: "Tasks" },
  { name: "Backlog", icon: FileText, page: "Backlog" }]

},
{
  label: "Planning",
  items: [
  { name: "Projects", icon: Folder, page: "Projects" },
  { name: "Roadmap", icon: Rocket, page: "Roadmap" },
  { name: "Initiatives", icon: Rocket, page: "Initiatives" },
  { name: "Epics", icon: Rocket, page: "Epics" }]

},
{
  label: "Insights",
  items: [
  { name: "Custom Boards", icon: LayoutGrid, page: "CustomProjectBoards" },
  { name: "Templates", icon: FileText, page: "ProjectTemplates" },
  { name: "Automations", icon: Settings, page: "Automations" },
  { name: "Advanced Search", icon: FileText, page: "AdvancedSearch" }]

},
{
  label: "Reports",
  items: [
  { name: "Reports", icon: BarChart3, page: "Reports" },
  { name: "Custom Reports", icon: BarChart3, page: "CustomReports" },
  { name: "Epic Analytics", icon: BarChart3, page: "EpicAnalytics" },
  { name: "Time Tracking", icon: BarChart3, page: "TimeTracking" }]

}];


// Flat list for top bar
const navItems = navSections.flatMap((s) => s.items);


const sidebarPositions = [
{ value: "left", label: "Left" },
{ value: "right", label: "Right" },
{ value: "top", label: "Top" }];


export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarPos, setSidebarPos] = useState("left");
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({ Planning: true, Insights: true, Reports: true });
  const [currentApp, setCurrentApp] = useState("pm");
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setSidebarPos(u?.sidebar_position || "left");
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED]">
                    <span className="text-[8px] font-bold text-white flex items-center justify-center h-full">
                      {currentApp === "pm" ? "PM" : "CF"}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#E5E5E5]">
                    {currentApp === "pm" ? "Project Management" : "Confluence"}
                  </span>
                  <Grid3x3 size={14} className="text-[#666]" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-[#1A1A1A] border-[#333] p-2">
                <div className="space-y-1">
                  <button
                    onClick={() => setCurrentApp("pm")}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 ${
                      currentApp === "pm" ? "bg-[#5E6AD2] text-white" : "text-[#CCC] hover:bg-[#252525]"
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">PM</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Project Management</div>
                      <div className="text-xs text-[#999]">Tasks, epics & roadmaps</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentApp("confluence")}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 ${
                      currentApp === "confluence" ? "bg-[#5E6AD2] text-white" : "text-[#CCC] hover:bg-[#252525]"
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#2684FF] to-[#0052CC] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">CF</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Confluence</div>
                      <div className="text-xs text-[#999]">Docs, wikis & knowledge base</div>
                    </div>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
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
            <div className="px-4 py-3 border-b border-[#1E1E1E]">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer mb-3 w-full">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">
                        {currentApp === "pm" ? "PM" : "CF"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#E5E5E5] flex-1 text-left truncate">
                      {currentApp === "pm" ? "Project Mgmt" : "Confluence"}
                    </span>
                    <Grid3x3 size={12} className="text-[#666]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className={`w-64 bg-[#1A1A1A] border-[#333] p-2 ${sidebarPos === "right" ? "mr-2" : "ml-2"}`} side={sidebarPos === "right" ? "left" : "right"}>
                  <div className="space-y-1">
                    <button
                      onClick={() => setCurrentApp("pm")}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 ${
                        currentApp === "pm" ? "bg-[#5E6AD2] text-white" : "text-[#CCC] hover:bg-[#252525]"
                      }`}
                    >
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">PM</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Project Management</div>
                        <div className="text-xs text-[#999]">Tasks, epics & roadmaps</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setCurrentApp("confluence")}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 ${
                        currentApp === "confluence" ? "bg-[#5E6AD2] text-white" : "text-[#CCC] hover:bg-[#252525]"
                      }`}
                    >
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-[#2684FF] to-[#0052CC] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">CF</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Confluence</div>
                        <div className="text-xs text-[#999]">Docs, wikis & knowledge base</div>
                      </div>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer w-full">
                    <div className="w-5 h-5 rounded bg-[#252525] flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">W</span>
                    </div>
                    <span className="text-sm font-semibold text-[#E5E5E5] flex-1 text-left truncate">Workspace</span>
                    <ChevronDown size={12} className="text-[#666]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className={`w-48 bg-[#1A1A1A] border-[#333] p-0 ${sidebarPos === "right" ? "mr-2" : "ml-2"}`} side={sidebarPos === "right" ? "left" : "right"}>
                  <div className="space-y-1">
                    <button
                    onClick={() => navigate(createPageUrl("UserManagement"))}
                    className="w-full text-left text-sm px-4 py-2.5 text-[#CCC] hover:bg-[#252525] transition-colors">

                      User Management
                    </button>
                    <button
                    onClick={() => navigate(createPageUrl("RoleManagement"))}
                    className="w-full text-left text-sm px-4 py-2.5 text-[#CCC] hover:bg-[#252525] transition-colors">

                      Role Management
                    </button>
                    <button
                    onClick={() => navigate(createPageUrl("Security"))}
                    className="w-full text-left text-sm px-4 py-2.5 text-[#CCC] hover:bg-[#252525] transition-colors">

                      Security
                    </button>
                    <div className="border-t border-[#252525]" />
                    <button
                    onClick={() => base44.auth.logout()}
                    className="w-full text-left text-sm px-4 py-2.5 text-[#F87171] hover:bg-[#252525] transition-colors">

                      Logout
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-1 mt-3">
                <button className="p-1 text-[#6B6B6B] hover:text-white transition-colors" onClick={() => setSearchOpen(true)}>
                  <Search size={14} className="text-slate-50 lucide lucide-search" />
                </button>
                <button
                onClick={() => navigate(createPageUrl("Tasks") + "?create=true")}
                className="p-1 text-[#6B6B6B] hover:text-white transition-colors">

                  <PenSquare size={14} className="text-slate-50 lucide lucide-square-pen" />
                </button>
                <NotificationBell />
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1 text-[#6B6B6B] hover:text-white transition-colors">
                      <LayoutList size={14} className="text-slate-50 lucide lucide-layout-list" />
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
          {navSections.map((section) => {
            const isCollapsible = ["Planning", "Insights", "Reports"].includes(section.label);
            const isCollapsed = collapsedSections[section.label];
            
            return (
              <div key={section.label} className="mb-4">
                <div className="px-4 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#444] uppercase tracking-wider">{section.label}</span>
                  {isCollapsible && (
                    <button
                      onClick={() => setCollapsedSections(prev => ({ ...prev, [section.label]: !prev[section.label] }))}
                      className="text-[#666] hover:text-white transition-colors p-0.5"
                    >
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="px-2 space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = currentPageName === item.page;
                      return (
                        <Link
                          key={item.page}
                          to={createPageUrl(item.page)}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                            isActive ? "bg-[#1E1E1E] text-white" : "text-[#8A8A8A] hover:text-[#CCC] hover:bg-[#161616]"
                          }`}
                        >
                          <item.icon size={15} className="flex-shrink-0" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-[#555] hover:text-white transition-colors" title="Settings">
                      <Settings size={13} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className={`w-48 bg-[#1A1A1A] border-[#333] p-0 ${sidebarPos === "right" ? "mr-2" : "ml-2"}`} side={sidebarPos === "right" ? "left" : "right"}>
                    <div className="space-y-1">
                      <button
                    onClick={() => navigate(createPageUrl("AdminPortal"))}
                    className="w-full text-left text-sm px-4 py-2.5 text-[#CCC] hover:bg-[#252525] transition-colors">

                        Admin Portal
                      </button>
                      <button
                    onClick={() => navigate(createPageUrl("NotificationSettings"))}
                    className="w-full text-left text-sm px-4 py-2.5 text-[#CCC] hover:bg-[#252525] transition-colors">

                        Notification Settings
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
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

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>);

}