// frontend/src/components/admin/AdminLayout.tsx

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const PAGE_TITLES: Record<string, string> = {
  "/admin":          "Dashboard",
  "/admin/jobs":     "Manage Jobs",
  "/admin/events":   "Manage Events",
  "/admin/startups": "Manage Startups",
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const pageTitle = PAGE_TITLES[pathname] ?? "Admin";

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;