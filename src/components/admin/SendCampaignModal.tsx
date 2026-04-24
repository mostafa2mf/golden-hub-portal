import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Send, Check, User } from "lucide-react";
import { toast } from "sonner";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface Props {
  campaign: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const SendCampaignModal = ({ campaign, open, onOpenChange }: Props) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const { data: influencers = [] } = useQuery({
    queryKey: ["influencers-for-invite"],
    queryFn: async () => {
      const { data } = await supabase
        .from("influencers")
        .select("id, name, handle, avatar_url, city, followers, status")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: open,
  });

  const { data: existing = [] } = useQuery({
    queryKey: ["campaign-invites", campaign?.id],
    queryFn: async () => {
      if (!campaign?.id) return [];
      const { data } = await supabase
        .from("campaign_influencers")
        .select("influencer_id")
        .eq("campaign_id", campaign.id);
      return data || [];
    },
    enabled: open && !!campaign?.id,
  });

  const existingIds = new Set(existing.map((e: any) => e.influencer_id));

  const filtered = influencers.filter((i: any) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      i.name?.toLowerCase().includes(q) ||
      i.handle?.toLowerCase().includes(q) ||
      i.city?.toLowerCase().includes(q)
    );
  });

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!campaign?.id) return;
    if (selected.size === 0) {
      toast.error(t("حداقل یک بلاگر انتخاب کنید", "Select at least one blogger"));
      return;
    }
    if (!date) {
      toast.error(t("تاریخ را انتخاب کنید", "Pick a date"));
      return;
    }
    setSending(true);
    const rows = Array.from(selected).map(id => ({
      campaign_id: campaign.id,
      influencer_id: id,
      status: "pending" as const,
      scheduled_date: date,
      scheduled_time: time || null,
      location: location || null,
      note: note || null,
    }));
    const { error } = await supabase.from("campaign_influencers").insert(rows);
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t(`دعوت برای ${selected.size} بلاگر ارسال شد`, `Invitation sent to ${selected.size} bloggers`));
    setSelected(new Set());
    setDate(""); setTime(""); setLocation(""); setNote("");
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaign-invites", campaign.id] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("ارسال کمپین به بلاگر", "Send Campaign to Bloggers")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{t("کمپین", "Campaign")}</p>
            <p className="text-sm font-semibold text-foreground">{campaign?.title}</p>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("تاریخ (شمسی) *", "Date (Jalali) *")}</label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={date}
                onChange={(d: any) => setDate(d ? d.toDate().toISOString().split("T")[0] : "")}
                inputClass="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50"
                containerClassName="w-full"
                calendarPosition="bottom-right"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("ساعت", "Time")}</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("مکان قرار", "Meeting Location")}</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50" placeholder={t("آدرس دقیق", "Full address")} />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("یادداشت برای بلاگر", "Note to Blogger")}</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute top-2.5 start-3 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("جستجوی بلاگر بر اساس نام، آیدی یا شهر...", "Search bloggers by name, handle, or city...")}
              className="w-full bg-muted/30 border border-border/50 rounded-xl ps-9 pe-3 py-2 text-sm outline-none focus:border-primary/50"
            />
          </div>

          {/* Influencer list */}
          <div className="max-h-64 overflow-y-auto space-y-2 pe-1">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">{t("بلاگری یافت نشد", "No bloggers found")}</p>
            )}
            {filtered.map((i: any) => {
              const already = existingIds.has(i.id);
              const isSel = selected.has(i.id);
              return (
                <button
                  key={i.id}
                  type="button"
                  disabled={already}
                  onClick={() => toggle(i.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-start ${
                    already
                      ? "border-border/30 bg-muted/10 opacity-50 cursor-not-allowed"
                      : isSel
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                    {i.avatar_url ? <img src={i.avatar_url} alt={i.name} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{i.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {i.handle ? `@${i.handle}` : ""}{i.city ? ` • ${i.city}` : ""}{i.followers ? ` • ${i.followers.toLocaleString()} ${t("فالوور", "followers")}` : ""}
                    </p>
                  </div>
                  {already ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t("ارسال شده", "Sent")}</span>
                  ) : isSel ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <Button
            disabled={sending}
            onClick={handleSend}
            className="w-full gap-2 rounded-xl gold-gradient text-primary-foreground border-0"
          >
            <Send className="w-4 h-4" />
            {sending ? t("در حال ارسال...", "Sending...") : t(`ارسال به ${selected.size} بلاگر`, `Send to ${selected.size} bloggers`)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
