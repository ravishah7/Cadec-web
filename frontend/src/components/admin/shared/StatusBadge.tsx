// frontend/src/components/admin/shared/StatusBadge.tsx

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeVariant = "event" | "startup" | "active";

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
}

const EVENT_COLORS: Record<string, string> = {
  Upcoming:  "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  Ongoing:   "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  Completed: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  Cancelled: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const STARTUP_COLORS: Record<string, string> = {
  Incubated:   "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  Accelerated: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
  Alumni:      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400",
  Other:       "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
};

const ACTIVE_COLORS: Record<string, string> = {
  Active:   "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  Inactive: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500",
  Open:     "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  Closed:   "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500",
};

const StatusBadge = ({ status, variant = "active" }: StatusBadgeProps) => {
  let colorClass = "";

  if (variant === "event") {
    colorClass = EVENT_COLORS[status] ?? EVENT_COLORS.Upcoming;
  } else if (variant === "startup") {
    colorClass = STARTUP_COLORS[status] ?? STARTUP_COLORS.Other;
  } else {
    colorClass = ACTIVE_COLORS[status] ?? ACTIVE_COLORS.Inactive;
  }

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium shrink-0", colorClass)}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;