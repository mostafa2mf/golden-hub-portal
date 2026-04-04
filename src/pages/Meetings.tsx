import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { demoMeetings } from "@/data/demoData";
import { Calendar, List, Clock, MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MeetingsPage = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDay, setSelectedDay] = useState(0);
  const [detail, setDetail] = useState<typeof demoMeetings[0] | null>(null);

  const days = Array.from({ length: 8 }, (_, i) => {
    const d = new Date("2026-04-04");
    d.setDate(d.getDate() + i);
    return { label: i === 0 ? t("امروز", "Today") : `+${i}`, date: d.toISOString().split("T")[0] };
  });

  const filtered = demoMeetings.filter(m => m.date === days[selectedDay].date);

  return (
    <AdminLayout title={t("جلسات و رزروها", "Meetings & Bookings")}>
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-muted/50 rounded-xl p-0.5">
            <button onClick={() => setViewMode("list")} className={`p-2 px-3 rounded-lg text-sm transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><List className="w-4 h-4 inline me-1" />{t("لیست", "List")}</button>
            <button onClick={() => setViewMode("calendar")} className={`p-2 px-3 rounded-lg text-sm transition-colors ${viewMode === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Calendar className="w-4 h-4 inline me-1" />{t("تقویم", "Calendar")}</button>
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {days.map((d, i) => (
              <button key={i} onClick={() => setSelectedDay(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${selectedDay === i ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="glass-card p-12 text-center text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t("جلسه‌ای برای این روز ثبت نشده", "No meetings for this day")}</p>
            </div>
          )}
          {filtered.map(m => (
            <div key={m.id} className="glass-card p-5 hover-glow cursor-pointer transition-all" onClick={() => setDetail(m)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{m.business} — {m.influencer}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />{m.location} • {m.city}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.time} • {m.campaign}</div>
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-6">
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground mb-4">
            {[t("ش", "Sa"), t("ی", "Su"), t("د", "Mo"), t("س", "Tu"), t("چ", "We"), t("پ", "Th"), t("ج", "Fr")].map(d => <div key={d} className="py-2 font-medium">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const dayMeetings = demoMeetings.filter(m => m.date === `2026-04-${String(i + 1).padStart(2, "0")}`);
              return (
                <div key={i} className={`aspect-square rounded-xl p-1.5 text-sm flex flex-col items-center justify-center transition-colors cursor-pointer ${dayMeetings.length > 0 ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/20 text-muted-foreground hover:bg-muted/40"}`}>
                  <span className="font-medium">{i + 1}</span>
                  {dayMeetings.length > 0 && <span className="text-[10px] mt-0.5">{dayMeetings.length} {t("جلسه", "mtg")}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-lg">
          <DialogHeader><DialogTitle>{t("جزئیات جلسه", "Meeting Details")}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><StatusBadge status={detail.status} /><span className="text-sm text-muted-foreground">{detail.date} - {detail.time}</span></div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("کسب‌وکار", "Business")}</span><div className="font-medium mt-1">{detail.business}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("اینفلوئنسر", "Influencer")}</span><div className="font-medium mt-1">{detail.influencer}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("مکان", "Location")}</span><div className="font-medium mt-1">{detail.location}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("کمپین", "Campaign")}</span><div className="font-medium mt-1">{detail.campaign}</div></div>
              </div>
              <div className="w-full h-40 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground text-sm"><MapPin className="w-5 h-5 me-2" />{t("نقشه (به زودی)", "Map (Coming Soon)")}</div>
              <div className="flex gap-2">
                <Button variant="destructive" className="rounded-xl" onClick={() => { toast.success(t("لغو شد", "Cancelled")); setDetail(null); }}><X className="w-4 h-4 me-1" />{t("لغو جلسه", "Cancel")}</Button>
                <Button variant="outline" className="rounded-xl" onClick={() => toast.success(t("زمان‌بندی مجدد", "Rescheduled"))}>{t("زمان‌بندی مجدد", "Reschedule")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default MeetingsPage;
