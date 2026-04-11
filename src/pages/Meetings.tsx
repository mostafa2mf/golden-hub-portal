import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { Clock, MapPin, X, Users, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const persianDayNames = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
const englishDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MeetingsPage = () => {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(0);
  const [detail, setDetail] = useState<any>(null);

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data } = await supabase.from("meetings").select("*, businesses(name, logo_url), influencers(name, avatar_url, handle), campaigns(title)").order("meeting_date", { ascending: true });
      return data || [];
    },
  });

  useRealtimeInvalidation("meetings", ["meetings"]);

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dayOfWeek = d.getDay();
      return {
        dayName: t(persianDayNames[dayOfWeek], englishDayNames[dayOfWeek]),
        dateStr: d.toISOString().split("T")[0],
        persianDate: d.toLocaleDateString("fa-IR", { day: "numeric", month: "long" }),
        englishDate: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        isToday: i === 0,
      };
    });
  }, [t]);

  const filtered = meetings.filter((m: any) => m.meeting_date === days[selectedDay].dateStr);

  if (isLoading) return <AdminLayout title={t("دعوت‌ها", "Invitations")}><div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;

  return (
    <AdminLayout title={t("دعوت‌ها", "Invitations")}>
      {/* Day switcher */}
      <div className="glass-card p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[90px] transition-all ${
                selectedDay === i
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <span className="text-xs font-medium">{d.isToday ? t("امروز", "Today") : d.dayName}</span>
              <span className={`text-sm font-bold mt-1 ${selectedDay === i ? "text-primary-foreground" : "text-foreground"}`}>
                {t(d.persianDate, d.englishDate)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Invitations list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t("دعوتی برای این روز ثبت نشده", "No invitations for this day")}</p>
          </div>
        )}
        {filtered.map((m: any) => (
          <div key={m.id} className="glass-card p-5 hover-glow cursor-pointer transition-all" onClick={() => setDetail(m)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {m.influencers?.avatar_url ? (
                    <img src={m.influencers.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-card" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-card">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  {m.businesses?.logo_url ? (
                    <img src={m.businesses.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-card" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center border-2 border-card">
                      <Building2 className="w-5 h-5 text-info" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{m.influencers?.name || "-"} → {m.businesses?.name || "-"}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.location || m.city || "-"}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.meeting_time}</span>
                  </div>
                  {m.campaigns?.title && <span className="text-xs text-primary mt-0.5 block">{m.campaigns.title}</span>}
                </div>
              </div>
              <StatusBadge status={m.status} />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-lg">
          <DialogHeader><DialogTitle>{t("جزئیات دعوت", "Invitation Details")}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><StatusBadge status={detail.status} /><span className="text-sm text-muted-foreground">{detail.meeting_date} - {detail.meeting_time}</span></div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("کسب‌وکار", "Business")}</span><div className="font-medium mt-1">{detail.businesses?.name || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("اینفلوئنسر", "Influencer")}</span><div className="font-medium mt-1">{detail.influencers?.name || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("مکان", "Location")}</span><div className="font-medium mt-1">{detail.location || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("کمپین", "Campaign")}</span><div className="font-medium mt-1">{detail.campaigns?.title || "-"}</div></div>
              </div>
              {detail.notes && <div className="p-3 rounded-xl bg-muted/20 text-sm"><span className="text-muted-foreground">{t("یادداشت", "Notes")}:</span> {detail.notes}</div>}
              <div className="flex gap-2">
                <Button variant="destructive" className="rounded-xl" onClick={async () => { await supabase.from("meetings").update({ status: "cancelled" }).eq("id", detail.id); toast.success(t("لغو شد", "Cancelled")); setDetail(null); }}><X className="w-4 h-4 me-1" />{t("لغو دعوت", "Cancel")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default MeetingsPage;