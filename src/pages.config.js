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
import Backlog from './pages/Backlog';
import DirectMessages from './pages/DirectMessages';
import Inbox from './pages/Inbox';
import Initiatives from './pages/Initiatives';
import MyIssues from './pages/MyIssues';
import NotificationSettings from './pages/NotificationSettings';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Roadmap from './pages/Roadmap';
import RoleManagement from './pages/RoleManagement';
import Security from './pages/Security';
import Tasks from './pages/Tasks';
import UserManagement from './pages/UserManagement';
import ProjectTemplates from './pages/ProjectTemplates';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Backlog": Backlog,
    "DirectMessages": DirectMessages,
    "Inbox": Inbox,
    "Initiatives": Initiatives,
    "MyIssues": MyIssues,
    "NotificationSettings": NotificationSettings,
    "ProjectDetail": ProjectDetail,
    "Projects": Projects,
    "Reports": Reports,
    "Roadmap": Roadmap,
    "RoleManagement": RoleManagement,
    "Security": Security,
    "Tasks": Tasks,
    "UserManagement": UserManagement,
    "ProjectTemplates": ProjectTemplates,
}

export const pagesConfig = {
    mainPage: "Inbox",
    Pages: PAGES,
    Layout: __Layout,
};