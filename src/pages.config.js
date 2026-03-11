/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminPortal from './pages/AdminPortal';
import AdvancedSearch from './pages/AdvancedSearch';
import Automations from './pages/Automations';
import Backlog from './pages/Backlog';
import CustomFields from './pages/CustomFields';
import CustomProjectBoards from './pages/CustomProjectBoards';
import CustomReports from './pages/CustomReports';
import DirectMessages from './pages/DirectMessages';
import ForYou from './pages/ForYou';
import GitHubIntegration from './pages/GitHubIntegration';
import Inbox from './pages/Inbox';
import Initiatives from './pages/Initiatives';
import KanbanBoard from './pages/KanbanBoard';
import MyIssues from './pages/MyIssues';
import NotificationSettings from './pages/NotificationSettings';
import ProjectDetail from './pages/ProjectDetail';
import ProjectOverview from './pages/ProjectOverview';
import ProjectTemplates from './pages/ProjectTemplates';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Roadmap from './pages/Roadmap';
import RoleManagement from './pages/RoleManagement';
import Security from './pages/Security';
import Tasks from './pages/Tasks';
import TimeTracking from './pages/TimeTracking';
import UserManagement from './pages/UserManagement';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminPortal": AdminPortal,
    "AdvancedSearch": AdvancedSearch,
    "Automations": Automations,
    "Backlog": Backlog,
    "CustomFields": CustomFields,
    "CustomProjectBoards": CustomProjectBoards,
    "CustomReports": CustomReports,
    "DirectMessages": DirectMessages,
    "ForYou": ForYou,
    "GitHubIntegration": GitHubIntegration,
    "Inbox": Inbox,
    "Initiatives": Initiatives,
    "KanbanBoard": KanbanBoard,
    "MyIssues": MyIssues,
    "NotificationSettings": NotificationSettings,
    "ProjectDetail": ProjectDetail,
    "ProjectOverview": ProjectOverview,
    "ProjectTemplates": ProjectTemplates,
    "Projects": Projects,
    "Reports": Reports,
    "Roadmap": Roadmap,
    "RoleManagement": RoleManagement,
    "Security": Security,
    "Tasks": Tasks,
    "TimeTracking": TimeTracking,
    "UserManagement": UserManagement,
}

export const pagesConfig = {
    mainPage: "Inbox",
    Pages: PAGES,
    Layout: __Layout,
};