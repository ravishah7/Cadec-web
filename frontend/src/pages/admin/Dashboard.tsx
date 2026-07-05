// frontend/src/pages/admin/Dashboard.tsx

import { useState, useEffect } from "react";
import { Briefcase, CalendarDays, Rocket } from "lucide-react";
import DashboardCard from "@/components/admin/DashboardCard";
import { adminDashboardAPI } from "@/services/api";
import type { DashboardStats } from "@/types/admin.types";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminDashboardAPI
      .getStats()
      .then((res) => setStats(res.data))
      .catch(() => {
        /* silently degrade — cards render with "—" */
      })
      .finally(() => setIsLoading(false));
  }, []);

  const cards = [
    {
      title: "Jobs",
      description:
        "Post opportunities, edit listings, set active/inactive status, and manage applications.",
      href: "/admin/jobs",
      icon: Briefcase,
      total: stats?.totalJobs,
      activeCount: stats?.activeJobs,
      accentColor: "primary" as const,
    },
    {
      title: "Events",
      description:
        "Create events, manage registrations, build custom question forms, and track status.",
      href: "/admin/events",
      icon: CalendarDays,
      total: stats?.totalEvents,
      activeCount: stats?.activeEvents,
      accentColor: "accent" as const,
    },
    {
      title: "Startups",
      description:
        "Showcase incubated and accelerated startups with founder profiles and funding info.",
      href: "/admin/startups",
      icon: Rocket,
      total: stats?.totalStartups,
      activeCount: stats?.activeStartups,
      accentColor: "primary" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your society's content from the panels below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((card) => (
          <DashboardCard
            key={card.href}
            title={card.title}
            description={card.description}
            href={card.href}
            icon={card.icon}
            total={card.total}
            activeCount={card.activeCount}
            isLoading={isLoading}
            accentColor={card.accentColor}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;