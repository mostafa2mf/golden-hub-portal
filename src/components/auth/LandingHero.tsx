import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LandingHeroStat {
  label: string;
  value: string;
}

interface LandingHeroProps {
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  stats: LandingHeroStat[];
  logoSrc: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  className?: string;
}

export const LandingHero = ({
  badge,
  title,
  description,
  highlights,
  stats,
  logoSrc,
  primaryActionLabel,
  onPrimaryAction,
  className,
}: LandingHeroProps) => {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-border/40 bg-card/50 p-6 backdrop-blur-2xl sm:p-8 lg:p-10",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/0 to-secondary/30" />
      <div className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-secondary/80 blur-3xl" />

      <div className="relative space-y-8">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          {badge}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-primary/20 bg-background/70 p-3 shadow-[var(--gold-glow)]">
            <img src={logoSrc} alt="Bloggerha logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bloggerha</p>
            <p className="text-base font-semibold text-foreground">Admin Console</p>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl gold-text">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/40 px-4 py-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <p className="text-sm leading-6 text-foreground">{item}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/40 bg-background/50 px-4 py-4">
              <div className="text-2xl font-black text-foreground">{stat.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={onPrimaryAction}
          className="gold-gradient h-12 rounded-2xl px-6 text-sm font-semibold text-primary-foreground shadow-[var(--gold-glow-strong)]"
        >
          {primaryActionLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};