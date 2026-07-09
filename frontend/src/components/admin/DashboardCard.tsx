// frontend/src/components/admin/DashboardCard.tsx

import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  total?: number;
  activeCount?: number;
  isLoading?: boolean;
  accentColor?: "primary" | "accent";
}

const DashboardCard: FC<DashboardCardProps> = ({
  title,
  description,
  href,
  icon: Icon,
  total,
  activeCount,
  isLoading = false,
  accentColor = "primary",
}) => {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-border/60"
      onClick={() => navigate(href)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(href)}
      aria-label={`Navigate to ${title}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "p-2.5 rounded-lg",
              accentColor === "primary"
                ? "bg-primary/10 text-primary"
                : "bg-accent/10 text-accent"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        <CardTitle className="text-lg mt-3">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Live stats */}
        <div className="flex items-center gap-5 pt-3 border-t border-border/50">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {total ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              {activeCount !== undefined && (
                <>
                  <div className="w-px h-9 bg-border" />
                  <div>
                    <p className="text-2xl font-bold text-primary tabular-nums">
                      {activeCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            navigate(href);
          }}
          tabIndex={-1}
        >
          Manage {title}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;