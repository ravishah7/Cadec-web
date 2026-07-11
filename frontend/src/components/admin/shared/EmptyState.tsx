// frontend/src/components/admin/shared/EmptyState.tsx

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center py-10">
      <Icon className="h-10 w-10 text-muted-foreground mb-4" />

      <h3 className="font-semibold">{title}</h3>

      <p className="text-muted-foreground text-center">
        {description}
      </p>

      <Button onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
};

export default EmptyState;