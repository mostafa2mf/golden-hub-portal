import { cn } from "@/lib/utils";
import { LucideIcon, FileX } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon = FileX, title, description, className, children }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
    <div className="p-4 rounded-2xl bg-muted/50 mb-4">
      <Icon className="w-10 h-10 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
    {children && <div className="mt-4">{children}</div>}
  </div>
);
