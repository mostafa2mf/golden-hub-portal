import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Pause, XCircle, Calendar, MapPin, Image as ImageIcon, Users, CheckCircle2, Clock, X as XIcon, Instagram } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { SendCampaignModal } from "@/components/admin/SendCampaignModal";

const formatDate = (s?: string | null) => s ? new Date(s).toLocaleDateString("fa-IR", { year: "numeric", month: "short", day: "numeric" }) : "—";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [sendOpen, setSendOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*, businesses(*), categories(name, name_fa)").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["campaign-invitations", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaign_influencers")
        .select("*, influencers(id, name, handle, avatar_url, followers, city)")
        .eq("campaign_id", id!)
        .order("assigned_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) return <AdminLayout title={t("جزئیات کمپین", "Campaign Details")}><div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;
  if (!campaign) return <AdminLayout title={t("جزئیات کمپین", "Campaign Details")}><div className="glass-card p-12 text-center text-muted-foreground">{t("یافت نشد", "Not found")}</div></AdminLayout>;

  const stats = {
    total: invitations.length,
    accepted: invitations.filter((i: any) => i.status === "accepted").length,
    pending: invitations.filter((i: any) => i.status === "pending").length,
    declined: invitations.filter((i: any) => i.status === "declined").length,
  };

  const setStatus = async (s: string) => {
    await supabase.from("campaigns").update({ status: s as any }).eq("id", campaign.id);
    qc.invalidateQueries({ queryKey: ["campaign", id] });
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    toast.success(t("وضعیت به‌روز شد", "Status updated"));
  };

  return (
    <AdminLayout title={campaign.title}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/campaigns")} className="gap-2 rounded-xl">
            <ArrowRight className="w-4 h-4" />{t("بازگشت", "Back")}
          </Button>
          <div className="flex gap-2">
            {campaign.status === "active" && (
              <Button onClick={() => setSendOpen(true)} className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0">
                <Send className="w-4 h-4" />{t("ارسال به بلاگر", "Send to Bloggers")}
              </Button>
            )}
            {campaign.status === "active" && (
              <Button variant="outline" onClick={() => setStatus("paused")} className="gap-2 rounded-xl"><Pause className="w-4 h-4" />{t("توقف", "Pause")}</Button>
            )}
            {campaign.status !== "rejected" && campaign.status !== "completed" && (
              <Button variant="destructive" onClick={() => setStatus("rejected")} className="gap-2 rounded-xl"><XCircle className="w-4 h-4" />{t("لغو", "Cancel")}</Button>
            )}
          </div>
        </div>

        {/* Header card */}
        <div className="glass-card overflow-hidden">
          {campaign.images?.length > 0 && (
            <div className="grid grid-cols-3 gap-1 bg-muted/20">
              {campaign.images.slice(0, 3).map((url: string, i: number) => (
                <div key={i} className="aspect-video cursor-pointer overflow-hidden" onClick={() => setLightbox(url)}>
                  <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{campaign.title}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span>{campaign.businesses?.name || "—"}</span>
                  <span>•</span>
                  <span>{campaign.categories?.name_fa || campaign.categories?.name || "—"}</span>
                </div>
                <div className="mt-2"><StatusBadge status={campaign.status} /></div>
              </div>
            </div>

            {campaign.description && <p className="text-sm text-foreground/80 mt-4 bg-muted/20 rounded-xl p-3">{campaign.description}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <div className="p-3 rounded-xl bg-muted/30"><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{t("شهر", "City")}</div><div className="text-sm font-semibold mt-1">{campaign.city || "—"}</div></div>
              <div className="p-3 rounded-xl bg-muted/30"><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{t("شروع", "Start")}</div><div className="text-sm font-semibold mt-1">{formatDate(campaign.start_date)}</div></div>
              <div className="p-3 rounded-xl bg-muted/30"><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{t("پایان", "End")}</div><div className="text-sm font-semibold mt-1">{formatDate(campaign.end_date)}</div></div>
              <div className="p-3 rounded-xl bg-muted/30"><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{t("آدرس", "Address")}</div><div className="text-sm font-semibold mt-1 truncate">{campaign.address || "—"}</div></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-5"><div className="flex items-center gap-2 text-muted-foreground text-sm"><Users className="w-4 h-4" />{t("کل دعوت‌ها", "Total Invites")}</div><div className="text-3xl font-bold mt-2">{stats.total}</div></div>
          <div className="glass-card p-5 border-success/30"><div className="flex items-center gap-2 text-success text-sm"><CheckCircle2 className="w-4 h-4" />{t("پذیرفته", "Accepted")}</div><div className="text-3xl font-bold mt-2 text-success">{stats.accepted}</div></div>
          <div className="glass-card p-5 border-warning/30"><div className="flex items-center gap-2 text-warning text-sm"><Clock className="w-4 h-4" />{t("در انتظار", "Pending")}</div><div className="text-3xl font-bold mt-2 text-warning">{stats.pending}</div></div>
          <div className="glass-card p-5 border-destructive/30"><div className="flex items-center gap-2 text-destructive text-sm"><XIcon className="w-4 h-4" />{t("رد شده", "Declined")}</div><div className="text-3xl font-bold mt-2 text-destructive">{stats.declined}</div></div>
        </div>

        {/* Invited bloggers */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-border/30">
            <h2 className="font-bold">{t("بلاگرهای دعوت شده", "Invited Bloggers")}</h2>
          </div>
          {invitations.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">{t("هنوز کسی دعوت نشده", "No one invited yet")}</div>
          ) : (
            <div className="divide-y divide-border/20">
              {invitations.map((inv: any) => {
                const handleClean = (inv.influencers?.handle || "").replace(/^@/, "");
                return (
                  <div key={inv.id} className="p-4 flex items-center gap-4 hover:bg-muted/10 transition-colors">
                    {inv.influencers?.avatar_url ? (
                      <img src={inv.influencers.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">{(inv.influencers?.name || "?").charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{inv.influencers?.name || "—"}</div>
                      {handleClean && (
                        <a href={`https://instagram.com/${handleClean}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <Instagram className="w-3 h-3" />@{handleClean}
                        </a>
                      )}
                      {(inv.scheduled_date || inv.location) && (
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                          {inv.scheduled_date && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(inv.scheduled_date)} {inv.scheduled_time || ""}</span>}
                          {inv.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{inv.location}</span>}
                        </div>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold ${inv.status === "accepted" ? "bg-success/15 text-success" : inv.status === "declined" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>
                      {inv.status === "accepted" ? t("پذیرفته", "Accepted") : inv.status === "declined" ? t("رد شده", "Declined") : t("در انتظار", "Pending")}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {sendOpen && <SendCampaignModal campaign={campaign} open={sendOpen} onOpenChange={setSendOpen} />}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </AdminLayout>
  );
};

export default CampaignDetail;
