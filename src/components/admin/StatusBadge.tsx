import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  confirmed: "bg-success/10 text-success border-success/20",
  approved: "bg-success/10 text-success border-success/20",
  completed: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  scheduled: "bg-info/10 text-info border-info/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  inactive: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  active: "فعال",
  confirmed: "تأیید شده",
  approved: "تأیید شده",
  completed: "تکمیل شده",
  pending: "در انتظار",
  scheduled: "برنامه‌ریزی شده",
  suspended: "معلق",
  rejected: "رد شده",
  cancelled: "لغو شده",
  inactive: "غیرفعال",
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const style = statusStyles[status] || statusStyles.inactive;
  const label = statusLabels[status] || status;

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", style, className)}>
      {label}
    </span>
  );
};
