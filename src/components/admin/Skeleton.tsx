import { cn } from "@/lib/utils";

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("glass-card p-5 animate-pulse", className)}>
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-muted" />
      <div className="w-12 h-5 rounded-full bg-muted" />
    </div>
    <div className="w-20 h-7 rounded bg-muted mb-2" />
    <div className="w-28 h-4 rounded bg-muted" />
  </div>
);

export const SkeletonRow = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-4 p-4 animate-pulse", className)}>
    <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="w-32 h-4 rounded bg-muted" />
      <div className="w-48 h-3 rounded bg-muted" />
    </div>
    <div className="w-16 h-6 rounded-full bg-muted" />
  </div>
);
