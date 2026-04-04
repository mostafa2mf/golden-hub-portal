import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  onClick?: () => void;
  className?: string;
}

export const KpiCard = ({ title, value, icon: Icon, trend, trendLabel, onClick, className }: KpiCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card p-5 hover-glow cursor-pointer group transition-all duration-300 hover:scale-[1.02]",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
      {trendLabel && <div className="text-xs text-muted-foreground mt-1">{trendLabel}</div>}
    </div>
  );
};
