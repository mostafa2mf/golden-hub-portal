import { useLanguage } from "@/contexts/LanguageContext";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FilterOption {
  key: string;
  label: string;
  labelFa: string;
  options: { value: string; label: string; labelFa?: string }[];
}

interface AdvancedFiltersProps {
  filters: FilterOption[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export const AdvancedFilters = ({ filters, values, onChange, onClear }: AdvancedFiltersProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(values).filter(Boolean).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5 rounded-xl border-border/50"
      >
        <Filter className="w-4 h-4" />
        {t("فیلتر", "Filter")}
        {activeCount > 0 && (
          <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-10 w-72 bg-card border border-border/50 rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{t("فیلترهای پیشرفته", "Advanced Filters")}</span>
              {activeCount > 0 && (
                <button onClick={onClear} className="text-xs text-destructive hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {t("پاک کردن", "Clear")}
                </button>
              )}
            </div>
            {filters.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground mb-1 block">{t(f.labelFa, f.label)}</label>
                <select
                  value={values[f.key] || ""}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background text-sm px-2 py-1.5 text-foreground"
                >
                  <option value="">{t("همه", "All")}</option>
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelFa || opt.label, opt.label)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <Button size="sm" className="w-full rounded-xl" onClick={() => setOpen(false)}>
              {t("اعمال", "Apply")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
