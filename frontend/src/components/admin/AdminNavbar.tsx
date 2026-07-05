// frontend/src/components/admin/AdminNavbar.tsx

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface AdminNavbarProps {
  onMenuClick: () => void;
  pageTitle: string;
}

const AdminNavbar = ({ onMenuClick, pageTitle }: AdminNavbarProps) => {
  const { user } = useAuth();

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex items-center gap-3 px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-base font-semibold text-foreground flex-1">
        {pageTitle}
      </h1>

      {/* Avatar initials */}
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold text-primary select-none">
          {user?.name?.charAt(0).toUpperCase() ?? "A"}
        </span>
      </div>
    </header>
  );
};

export default AdminNavbar;