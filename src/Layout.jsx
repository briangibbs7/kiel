import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import {
  Inbox,
  ListTodo,
  FileText,
  Folder,
  Search,
  PenSquare,
  Star,
  ChevronDown,
  ChevronRight,
  LayoutList,
  Settings,
  BarChart3,
  MessageCircle,
  LayoutGrid,
  Grid3x3,
  Clock,
  Kanban,
  Map,
  Layers,
  Zap,
  Library,
  PieChart,
  Timer,
  ScrollText,
  SlidersHorizontal,
  GitMerge,
  BookOpen,
  PenLine,
  LayoutDashboard,
  TrendingUp,
  Sun,
  Moon } from
"lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";
import NotificationBell from "@/components/notifications/NotificationBell";
import GlobalSearch from "@/components/search/GlobalSearch";

const pmNavSections = [
{
  label: "Home",
  items: [
  { name: "Dashboard", icon: LayoutDashboard, page: "TeamDashboard" },
  { name: "Inbox", icon: Inbox, page: "Inbox" },
  { name: "Messages", icon: MessageCircle, page: "DirectMessages" },
  { name: "For You", icon: Star, page: "ForYou" }]
},
{
  label: "Tracking",
  items: [
  { name: "My Issues", icon: ListTodo, page: "MyIssues" },
  { name: "Tasks", icon: ScrollText, page: "Tasks" },
  { name: "Backlog", icon: Layers, page: "Backlog" }]
},
{
  label: "Planning",
  items: [
  { name: "Projects", icon: Folder, page: "Projects" },
  { name: "Epics", icon: GitMerge, page: "Epics" },
  { name: "Initiatives", icon: TrendingUp, page: "Initiatives" },
  { name: "Sprint Board", icon: Kanban, page: "SprintBoard" },
  { name: "Roadmap", icon: Map, page: "Roadmap" }]
},
{
  label: "Workspace",
  items: [
  { name: "Custom Boards", icon: LayoutGrid, page: "CustomProjectBoards" },
  { name: "Templates", icon: Library, page: "ProjectTemplates" },
  { name: "Automations", icon: Zap, page: "Automations" },
  { name: "Advanced Search", icon: SlidersHorizontal, page: "AdvancedSearch" }]
},
{
  label: "Reports",
  items: [
  { name: "Reports", icon: BarChart3, page: "Reports" },
  { name: "Custom Reports", icon: PieChart, page: "CustomReports" },
  { name: "Epic Analytics", icon: TrendingUp, page: "EpicAnalytics" },
  { name: "Time Tracking", icon: Timer, page: "TimeTracking" }]
}];

const confluenceNavSections = [
{
  label: "Home",
  items: [
  { name: "Home", icon: LayoutDashboard, page: "ConfluenceHome" },
  { name: "Spaces", icon: Folder, page: "ConfluenceSpaces" },
  { name: "Recent", icon: Clock, page: "ConfluenceRecent" },
  { name: "Starred", icon: Star, page: "ConfluenceStarred" }]
},
{
  label: "Create",
  items: [
  { name: "Templates", icon: Library, page: "ConfluenceTemplates" },
  { name: "Whiteboards", icon: PenLine, page: "ConfluenceWhiteboards" },
  { name: "Drafts", icon: BookOpen, page: "ConfluenceDrafts" }]
},
{
  label: "Tools",
  items: [
  { name: "Search", icon: Search, page: "ConfluenceSearch" },
  { name: "Analytics", icon: BarChart3, page: "ConfluenceAnalytics" }]
}];


const sidebarPositions = [
{ value: "left", label: "Left" },
{ value: "right", label: "Right" },
{ value: "top", label: "Top" }];


export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarPos, setSidebarPos] = useState("left");
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({ Workspace: true, Reports: true });
  const [currentApp, setCurrentApp] = useState("pm");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleAppSwitch = (app) => {
    setCurrentApp(app);
    if (app === "confluence") {
      navigate(createPageUrl("ConfluenceHome"));
    } else {
      navigate(createPageUrl("TeamDashboard"));
    }
  };

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

  const navSections = currentApp === "confluence" ? confluenceNavSections : pmNavSections;
  const navItems = navSections.flatMap((s) => s.items);

  const tv = {
    bg: "var(--pm-bg)",
    surface: "var(--pm-surface)",
    surfaceHover: "var(--pm-surface-hover)",
    border: "var(--pm-border)",
    borderLight: "var(--pm-border-light)",
    text: "var(--pm-text)",
    textMuted: "var(--pm-text-muted)",
    textSecondary: "var(--pm-text-secondary)",
    accent: "var(--pm-accent)",
    popover: "var(--pm-popover)",
    inputBg: "var(--pm-input-bg)",
    headerBg: "var(--pm-header-bg)",
    navActive: "var(--pm-nav-item-active)",
    navHover: "var(--pm-nav-item-hover)",
  };

  return (
    <div style={{ backgroundColor: tv.bg, color: tv.text }} className={`h-screen overflow-hidden transition-colors duration-200 ${isSidebarVertical ? "flex" : "flex flex-col"}`}>
      {/* Sidebar - Top */}
      {isSidebarTop &&
      <aside style={{ backgroundColor: tv.headerBg, borderBottomColor: tv.border }} className="h-16 flex-shrink-0 border-b flex items-center px-4 gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED]">
                    <span className="text-[8px] font-bold text-white flex items-center justify-center h-full">
                      {currentApp === "pm" ? "PM" : "CF"}
                    </span>
                  </div>
                  <span style={{ color: tv.text }} className="text-sm font-semibold">
                    {currentApp === "pm" ? "Project Management" : "Confluence"}
                  </span>
                  <Grid3x3 size={14} style={{ color: tv.textMuted }} />
                </button>
              </PopoverTrigger>
              <PopoverContent style={{ backgroundColor: tv.popover, borderColor: tv.borderLight }} className="w-64 p-2">
                <div className="space-y-1">
                  <button
                    onClick={() => handleAppSwitch("pm")}
                    style={currentApp === "pm" ? { backgroundColor: tv.accent, color: "white" } : { color: tv.text }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 hover:opacity-80`}
                  >
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">PM</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Project Management</div>
                      <div className="text-xs" style={{ color: tv.textSecondary }}>Tasks, epics & roadmaps</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAppSwitch("confluence")}
                    style={currentApp === "confluence" ? { backgroundColor: tv.accent, color: "white" } : { color: tv.text }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 hover:opacity-80`}
                  >
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#2684FF] to-[#0052CC] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">CF</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Confluence</div>
                      <div className="text-xs" style={{ color: tv.textSecondary }}>Docs, wikis & knowledge base</div>
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
                style={isActive ? { backgroundColor: tv.navActive, color: tv.text } : { color: tv.textMuted }}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-[12px] transition-colors whitespace-nowrap hover:opacity-80"
              >
                  <item.icon size={14} />
                  {item.name}
                </Link>);
          })}
          </nav>
          <button onClick={toggleTheme} style={{ color: tv.textMuted }} className="p-1.5 hover:opacity-80 transition-opacity flex-shrink-0" title="Toggle theme">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button style={{ color: tv.textMuted }} className="hover:opacity-80 transition-opacity flex-shrink-0">
                <LayoutList size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent style={{ backgroundColor: tv.popover, borderColor: tv.borderLight }} className="w-40 p-2">
              <div className="space-y-1">
                {sidebarPositions.map((pos) =>
              <button
                key={pos.value}
                onClick={() => handlePositionChange(pos.value)}
                style={sidebarPos === pos.value ? { backgroundColor: tv.accent, color: "white" } : { color: tv.textSecondary }}
                className="w-full text-left text-xs px-2 py-1.5 rounded transition-colors hover:opacity-80"
              >
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
      <aside style={{ backgroundColor: tv.headerBg, borderColor: tv.border }} className={`w-56 flex-shrink-0 ${sidebarPos === "left" ? "border-r" : "border-l"} flex flex-col transition-colors duration-200 ${sidebarPos === "right" ? "order-last" : ""}`}>
        {isSidebarVertical &&
        <>
            {/* Workspace header */}
            <div style={{ borderBottomColor: tv.border }} className="px-4 py-3 border-b">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer mb-3 w-full">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">
                        {currentApp === "pm" ? "PM" : "CF"}
                      </span>
                    </div>
                    <span style={{ color: tv.text }} className="text-sm font-semibold flex-1 text-left truncate">
                      {currentApp === "pm" ? "Project Mgmt" : "Confluence"}
                    </span>
                    <Grid3x3 size={12} style={{ color: tv.textMuted }} />
                  </button>
                </PopoverTrigger>
                <PopoverContent style={{ backgroundColor: tv.popover, borderColor: tv.borderLight }} className={`w-64 p-2 ${sidebarPos === "right" ? "mr-2" : "ml-2"}`} side={sidebarPos === "right" ? "left" : "right"}>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleAppSwitch("pm")}
                      style={currentApp === "pm" ? { backgroundColor: tv.accent, color: "white" } : { color: tv.text }}
                      className="w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 hover:opacity-80"
                    >
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">PM</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Project Management</div>
                        <div className="text-xs" style={{ color: tv.textSecondary }}>Tasks, epics & roadmaps</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleAppSwitch("confluence")}
                      style={currentApp === "confluence" ? { backgroundColor: tv.accent, color: "white" } : { color: tv.text }}
                      className="w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 hover:opacity-80"
                    >
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-[#2684FF] to-[#0052CC] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">CF</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Confluence</div>
                        <div className="text-xs" style={{ color: tv.textSecondary }}>Docs, wikis & knowledge base</div>
                      </div>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer w-full">
                    <div style={{ backgroundColor: tv.surfaceHover }} className="w-5 h-5 rounded flex items-center justify-center">
                      <span className="text-[9px] font-bold" style={{ color: tv.text }}>W</span>
                    </div>
                    <span style={{ color: tv.text }} className="text-sm font-semibold flex-1 text-left truncate">Workspace</span>
                    <ChevronDown size={12} style={{ color: tv.textMuted }} />
                  </button>
                </PopoverTrigger>
                <PopoverContent style={{ backgroundColor: tv.popover, borderColor: tv.borderLight }} className={`w-48 p-0 ${sidebarPos === "right" ? "mr-2" : "ml-2"}`} side={sidebarPos === "right" ? "left" : "right"}>
                  <div className="space-y-1 py-1">
                    {[
                      { label: "User Management", page: "UserManagement" },
                      { label: "Role Management", page: "RoleManagement" },
                      { label: "Security", page: "Security" },
                    ].map((item) => (
                      <button key={item.page} onClick={() => navigate(createPageUrl(item.page))}
                        style={{ color: tv.text }}
                        className="w-full text-left text-sm px-4 py-2.5 hover:opacity-70 transition-opacity">
                        {item.label}
                      </button>
                    ))}
                    <div style={{ borderTopColor: tv.border }} className="border-t" />
                    <button onClick={() => base44.auth.logout()}
                      className="w-full text-left text-sm px-4 py-2.5 transition-opacity hover:opacity-70"
                      style={{ color: "var(--pm-red)" }}>
                      Logout
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-1 mt-3">
                <button style={{ color: tv.textMuted }} className="p-1 hover:opacity-80 transition-opacity" onClick={() => setSearchOpen(true)}>
                  <Search size={14} />
                </button>
                <button style={{ color: tv.textMuted }} onClick={() => navigate(createPageUrl("Tasks") + "?create=true")}
                  className="p-1 hover:opacity-80 transition-opacity">
                  <PenSquare size={14} />
                </button>
                <NotificationBell />
                <button onClick={toggleTheme} style={{ color: tv.textMuted }} className="p-1 hover:opacity-80 transition-opacity" title="Toggle theme">
                  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <Popover>
                  <PopoverTrigger asChild>
                    <button style={{ color: tv.textMuted }} className="p-1 hover:opacity-80 transition-opacity">
                      <LayoutList size={14} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent style={{ backgroundColor: tv.popover, borderColor: tv.borderLight }} className={`w-40 p-2 ${sidebarPos === "right" ? "mr-2" : "ml-2"}`} side={sidebarPos === "right" ? "left" : "right"}>
                    <div className="space-y-1">
                      {sidebarPositions.map((pos) =>
                    <button
                      key={pos.value}
                      onClick={() => handlePositionChange(pos.value)}
                      style={sidebarPos === pos.value ? { backgroundColor: tv.accent, color: "white" } : { color: tv.textSecondary }}
                      className="w-full text-left text-xs px-2 py-1.5 rounded transition-colors hover:opacity-80"
                    >
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
            const isCollapsible = ["Planning", "Workspace", "Reports", "Create", "Tools"].includes(section.label);
            const isCollapsed = collapsedSections[section.label];
            
            return (
              <div key={section.label} className="mb-4">
                <div className="px-4 mb-1 flex items-center justify-between">
                  <span style={{ color: tv.textMuted }} className="text-[10px] font-semibold uppercase tracking-wider">{section.label}</span>
                  {isCollapsible && (
                    <button
                      onClick={() => setCollapsedSections(prev => ({ ...prev, [section.label]: !prev[section.label] }))}
                      style={{ color: tv.textMuted }}
                      className="hover:opacity-80 transition-opacity p-0.5"
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
                          style={isActive
                            ? { backgroundColor: tv.navActive, color: tv.text }
                            : { color: tv.textSecondary }
                          }
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors hover:opacity-80"
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
          <div style={{ borderTopColor: tv.border }} className="px-3 py-3 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#5E6AD2] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {user.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span style={{ color: tv.textSecondary }} className="text-xs truncate">{user.full_name || user.email}</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button style={{ color: tv.textMuted }} className="hover:opacity-80 transition-opacity" title="Settings">
                      <Settings size={13} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent style={{ backgroundColor: tv.popover, borderColor: tv.borderLight }} className={`w-48 p-0 ${sidebarPos === "right" ? "mr-2" : "ml-2"}`} side={sidebarPos === "right" ? "left" : "right"}>
                    <div className="space-y-1 py-1">
                      <button onClick={() => navigate(createPageUrl("AdminPortal"))}
                        style={{ color: tv.text }}
                        className="w-full text-left text-sm px-4 py-2.5 hover:opacity-70 transition-opacity">
                        Admin Portal
                      </button>
                      <button onClick={() => navigate(createPageUrl("NotificationSettings"))}
                        style={{ color: tv.text }}
                        className="w-full text-left text-sm px-4 py-2.5 hover:opacity-70 transition-opacity">
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
      <main style={{ backgroundColor: tv.bg }} className="flex-1 overflow-hidden transition-colors duration-200">
        {children}
      </main>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>);

}