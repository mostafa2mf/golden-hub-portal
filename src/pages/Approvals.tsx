import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Eye, Search, Clock, User, Building2, Star, Image as ImageIcon, Instagram, Mail, Phone, MapPin, Users as UsersIcon, TrendingUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fa-IR", { year: "numeric", month: "short", day: "numeric" });
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
};

const ApprovalsPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState<{ id: string; type: string; name: string } | null>(null);
  const [detailModal, setDetailModal] = useState<any>(null);
  const [reviewDetailModal, setReviewDetailModal] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchBloggers, setSearchBloggers] = useState("");
  const [searchBusinesses, setSearchBusinesses] = useState("");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [selBloggers, setSelBloggers] = useState<Set<string>>(new Set());
  const [selBusinesses, setSelBusinesses] = useState<Set<string>>(new Set());
  const [selReviews, setSelReviews] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const toggleSel = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  const { data: influencers = [] } = useQuery({
    queryKey: ["influencers"],
    queryFn: async () => {
      const { data } = await supabase.from("influencers").select("*, categories(name, name_fa)").order("submitted_at", { ascending: false });
      return data || [];
    },
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*, categories(name, name_fa)").order("submitted_at", { ascending: false });
      return data || [];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*, influencers(name, avatar_url), businesses(name, logo_url)").eq("status", "pending").order("created_at", { ascending: false });
      return data || [];
    },
  });

  useRealtimeInvalidation("influencers", ["influencers"]);
  useRealtimeInvalidation("businesses", ["businesses"]);
  useRealtimeInvalidation("reviews", ["reviews"]);

  const pendingInfluencers = useMemo(() => {
    let list = influencers.filter((i: any) => i.status === "pending");
    if (searchBloggers.trim()) {
      const q = searchBloggers.toLowerCase();
      list = list.filter((i: any) => i.name?.toLowerCase().includes(q) || i.handle?.toLowerCase().includes(q) || i.city?.toLowerCase().includes(q));
    }
    return list;
  }, [influencers, searchBloggers]);

  const pendingBusinesses = useMemo(() => {
    let list = businesses.filter((b: any) => b.status === "pending");
    if (searchBusinesses.trim()) {
      const q = searchBusinesses.toLowerCase();
      list = list.filter((b: any) => b.name?.toLowerCase().includes(q) || b.contact_name?.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q));
    }
    return list;
  }, [businesses, searchBusinesses]);

  const presetReasons = [
    t("اطلاعات ناقص", "Incomplete information"),
    t("تصاویر نامناسب", "Inappropriate images"),
    t("حساب تکراری", "Duplicate account"),
    t("عدم تطابق اطلاعات", "Information mismatch"),
  ];

  const bulkAction = async (
    ids: string[],
    type: "influencer" | "business" | "review",
    action: "approve" | "reject",
    clearSel: () => void,
  ) => {
    if (!ids.length) return;
    setBulkBusy(true);
    try {
      for (const id of ids) {
        if (type === "review") {
          await supabase.rpc("set_review_status" as any, {
            _review_id: id,
            _new_status: (action === "approve" ? "active" : "rejected") as any,
          });
        } else {
          await supabase.functions.invoke("notify-approval", {
            body: { entity_id: id, entity_type: type, action, reject_reason: action === "reject" ? "رد گروهی توسط ادمین" : undefined },
          });
        }
      }
      toast.success(t(`${ids.length} مورد ${action === "approve" ? "تأیید" : "رد"} شد`, `${ids.length} ${action}d`));
      clearSel();
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } finally {
      setBulkBusy(false);
    }
  };

  const BulkBar = ({ count, onApprove, onReject, onClear }: { count: number; onApprove: () => void; onReject: () => void; onClear: () => void; }) => (
    count > 0 ? (
      <div className="flex items-center justify-between gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-2.5">
        <span className="text-sm font-medium">{t(`${count} مورد انتخاب شد`, `${count} selected`)}</span>
        <div className="flex gap-2">
          <Button size="sm" disabled={bulkBusy} onClick={onApprove} className="rounded-lg bg-success/20 hover:bg-success/30 text-success border-0 gap-1"><Check className="w-3.5 h-3.5" />{t("تأیید همه", "Approve all")}</Button>
          <Button size="sm" disabled={bulkBusy} onClick={onReject} variant="destructive" className="rounded-lg gap-1"><X className="w-3.5 h-3.5" />{t("رد همه", "Reject all")}</Button>
          <Button size="sm" variant="ghost" onClick={onClear} className="rounded-lg">{t("لغو", "Clear")}</Button>
        </div>
      </div>
    ) : null
  );

  const handleApprove = async (id: string, type: string, name: string) => {
    if (type === "review") {
      const { error } = await supabase.rpc("set_review_status" as any, { _review_id: id, _new_status: "active" as any });
      if (error) toast.error(t("خطا در تأیید", "Error approving"));
      else {
        toast.success(t(`ریویو تأیید شد`, `Review approved`));
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      }
      return;
    }
    const { error } = await supabase.functions.invoke("notify-approval", {
      body: { entity_id: id, entity_type: type, action: "approve" },
    });
    if (error) toast.error(t("خطا در تأیید", "Error approving"));
    else {
      toast.success(t(`${name} تأیید شد`, `${name} approved`));
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (rejectModal.type === "review") {
      const { error } = await supabase.rpc("set_review_status" as any, { _review_id: rejectModal.id, _new_status: "rejected" as any });
      if (error) toast.error(t("خطا در رد", "Error rejecting"));
      else {
        toast.error(t("ریویو رد شد", "Review rejected"));
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      }
      setRejectModal(null);
      setRejectReason("");
      return;
    }
    const { error } = await supabase.functions.invoke("notify-approval", {
      body: { entity_id: rejectModal.id, entity_type: rejectModal.type, action: "reject", reject_reason: rejectReason },
    });
    if (error) toast.error(t("خطا در رد", "Error rejecting"));
    else {
      toast.error(t("درخواست رد شد", "Request rejected"));
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    }
    setRejectModal(null);
    setRejectReason("");
  };

  const pendingCounts = {
    bloggers: influencers.filter((i: any) => i.status === "pending").length,
    businesses: businesses.filter((b: any) => b.status === "pending").length,
    reviews: reviews.length,
  };

  return (
    <AdminLayout title={t("تأییدیه‌ها", "Approvals")}>
      <Tabs defaultValue="bloggers" className="space-y-6">
        <TabsList className="bg-card/60 backdrop-blur-xl border border-border/30 rounded-2xl p-1.5 gap-1">
          <TabsTrigger value="bloggers" className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
            <User className="w-4 h-4 me-2" />
            {t("بلاگرها", "Bloggers")}
            {pendingCounts.bloggers > 0 && <span className="ms-2 bg-warning/20 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingCounts.bloggers}</span>}
          </TabsTrigger>
          <TabsTrigger value="businesses" className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
            <Building2 className="w-4 h-4 me-2" />
            {t("کسب‌وکارها", "Businesses")}
            {pendingCounts.businesses > 0 && <span className="ms-2 bg-warning/20 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingCounts.businesses}</span>}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
            <Star className="w-4 h-4 me-2" />
            {t("ریویوها", "Reviews")}
            {pendingCounts.reviews > 0 && <span className="ms-2 bg-warning/20 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingCounts.reviews}</span>}
          </TabsTrigger>
        </TabsList>

        {/* ─── Bloggers Tab ─── */}
        <TabsContent value="bloggers" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-md flex-1 min-w-[200px]">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchBloggers} onChange={e => setSearchBloggers(e.target.value)} placeholder={t("جستجو بلاگر...", "Search bloggers...")} className="w-full bg-card/40 backdrop-blur-xl border border-border/30 rounded-xl ps-11 pe-4 py-3 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-colors" />
            </div>
            {pendingInfluencers.length > 0 && (
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setSelBloggers(new Set(selBloggers.size === pendingInfluencers.length ? [] : pendingInfluencers.map((i: any) => i.id)))}>
                {selBloggers.size === pendingInfluencers.length ? t("لغو انتخاب همه", "Unselect all") : t("انتخاب همه", "Select all")}
              </Button>
            )}
          </div>
          <BulkBar count={selBloggers.size} onClear={() => setSelBloggers(new Set())} onApprove={() => bulkAction([...selBloggers], "influencer", "approve", () => setSelBloggers(new Set()))} onReject={() => bulkAction([...selBloggers], "influencer", "reject", () => setSelBloggers(new Set()))} />


          {pendingInfluencers.length === 0 ? (
            <div className="bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center"><Check className="w-8 h-8 text-primary" /></div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{t("همه بلاگرها بررسی شدند", "All bloggers reviewed")}</h3>
              <p className="text-sm text-muted-foreground">{t("درخواست جدیدی در انتظار تأیید نیست", "No pending requests")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingInfluencers.map((inf: any) => {
                const handleClean = (inf.handle || "").replace(/^@/, "");
                const igUrl = handleClean ? `https://instagram.com/${handleClean}` : null;
                return (
                <div key={inf.id} className="group bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-[var(--gold-glow)] transition-all duration-300">
                  {/* Cover with avatar */}
                  <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent overflow-hidden">
                    {inf.avatar_url && <img src={inf.avatar_url} className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110" alt="" />}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {inf.avatar_url ? (
                        <img src={inf.avatar_url} alt={inf.name} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-card shadow-2xl" />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-primary font-bold text-4xl ring-4 ring-card shadow-2xl">{inf.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="absolute top-2 end-2 px-2 py-0.5 rounded-full bg-warning/20 backdrop-blur-sm border border-warning/30 text-warning text-[10px] font-bold">{t("در انتظار", "PENDING")}</div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="text-center">
                      <h3 className="text-base font-bold text-foreground">{inf.name}</h3>
                      {handleClean && igUrl && (
                        <a href={igUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 mt-1 text-xs text-primary hover:text-primary/80 transition-colors group/link">
                          <Instagram className="w-3.5 h-3.5" />@{handleClean}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>

                    {/* Mini stats */}
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <div className="text-xs font-bold text-foreground">{inf.followers >= 1000 ? `${(inf.followers / 1000).toFixed(1)}K` : inf.followers || "0"}</div>
                        <div className="text-[9px] text-muted-foreground">{t("فالوور", "Followers")}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <div className="text-xs font-bold text-foreground">{inf.engagement || 0}%</div>
                        <div className="text-[9px] text-muted-foreground">{t("تعامل", "Engage")}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <div className="text-xs font-bold text-foreground truncate">{inf.city || "—"}</div>
                        <div className="text-[9px] text-muted-foreground">{t("شهر", "City")}</div>
                      </div>
                    </div>

                    {inf.bio && <p className="text-[11px] text-muted-foreground/80 line-clamp-2 text-center px-1">{inf.bio}</p>}

                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/60">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(inf.submitted_at)} • {formatTime(inf.submitted_at)}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={() => setDetailModal({ ...inf, _type: "influencer" })} className="flex-1 py-2 rounded-xl bg-muted/40 border border-border/20 hover:bg-muted/70 text-foreground text-xs font-medium transition-all flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5" />{t("جزئیات", "Details")}</button>
                      <button onClick={() => handleApprove(inf.id, "influencer", inf.name)} className="p-2 rounded-xl bg-success/10 border border-success/30 hover:bg-success/20 text-success transition-all" title={t("تأیید", "Approve")}><Check className="w-4 h-4" /></button>
                      <button onClick={() => setRejectModal({ id: inf.id, type: "influencer", name: inf.name })} className="p-2 rounded-xl bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 text-destructive transition-all" title={t("رد", "Reject")}><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          )}
        </TabsContent>

        {/* ─── Businesses Tab ─── */}
        <TabsContent value="businesses" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchBusinesses} onChange={e => setSearchBusinesses(e.target.value)} placeholder={t("جستجو کسب‌وکار...", "Search businesses...")} className="w-full bg-card/40 backdrop-blur-xl border border-border/30 rounded-xl ps-11 pe-4 py-3 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-colors" />
          </div>

          {pendingBusinesses.length === 0 ? (
            <div className="bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center"><Check className="w-8 h-8 text-primary" /></div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{t("همه کسب‌وکارها بررسی شدند", "All businesses reviewed")}</h3>
              <p className="text-sm text-muted-foreground">{t("درخواست جدیدی در انتظار تأیید نیست", "No pending requests")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingBusinesses.map((biz: any) => (
                <div key={biz.id} className="group bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-[var(--gold-glow)] transition-all duration-300">
                  <div className="h-28 bg-gradient-to-br from-info/10 via-info/5 to-transparent flex items-center justify-center">
                    {biz.logo_url ? (
                      <img src={biz.logo_url} alt={biz.name} className="w-20 h-20 rounded-2xl object-cover ring-3 ring-card shadow-lg" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-info/30 to-info/10 flex items-center justify-center text-info font-bold text-3xl ring-3 ring-card shadow-lg">{biz.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-sm font-bold text-foreground">{biz.name}</h3>
                    {biz.contact_name && <p className="text-xs text-muted-foreground mt-0.5">{biz.contact_name}</p>}
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                      {biz.city && <span>{biz.city}</span>}
                      {biz.categories && <span>• {biz.categories.name_fa || biz.categories.name}</span>}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-[11px] text-muted-foreground/70">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(biz.submitted_at)} — {formatTime(biz.submitted_at)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button onClick={() => setDetailModal({ ...biz, _type: "business" })} className="p-2 rounded-xl bg-muted/30 border border-border/20 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleApprove(biz.id, "business", biz.name)} className="p-2 rounded-xl bg-success/10 border border-success/20 hover:bg-success/20 text-success transition-all"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setRejectModal({ id: biz.id, type: "business", name: biz.name })} className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive transition-all"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Reviews Tab ─── */}
        <TabsContent value="reviews" className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center"><Star className="w-8 h-8 text-primary" /></div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{t("ریویویی برای بررسی وجود ندارد", "No reviews to review")}</h3>
              <p className="text-sm text-muted-foreground">{t("همه ریویوها بررسی شدند", "All reviews have been reviewed")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((rev: any) => (
                <div key={rev.id} className="group bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-[var(--gold-glow)] transition-all duration-300 cursor-pointer" onClick={() => setReviewDetailModal(rev)}>
                  {/* Media preview */}
                  <div className="aspect-square bg-gradient-to-br from-warning/10 via-warning/5 to-transparent relative flex items-center justify-center">
                    {rev.media_urls && rev.media_urls.length > 0 ? (
                      <>
                        <img src={rev.media_urls[0]} alt="Review" className="w-full h-full object-cover" />
                        {rev.media_urls.length > 1 && (
                          <div className="absolute bottom-2 end-2 bg-card/80 backdrop-blur-sm text-foreground text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />+{rev.media_urls.length - 1}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                        <Star className="w-12 h-12" />
                        <span className="text-xs">{t("بدون تصویر", "No image")}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {rev.influencers?.avatar_url ? (
                          <img src={rev.influencers.avatar_url} className="w-7 h-7 rounded-lg object-cover" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{(rev.influencers?.name || "?").charAt(0)}</div>
                        )}
                        <span className="text-sm font-semibold truncate">{rev.influencers?.name || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-warning text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-warning" />{rev.rating}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">→ {rev.businesses?.name || "—"}</p>
                    {rev.content && <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-1">{rev.content}</p>}
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground/70">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(rev.created_at)} — {formatTime(rev.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button onClick={(e) => { e.stopPropagation(); handleApprove(rev.id, "review", `Review #${rev.id.slice(0, 6)}`); }} className="flex-1 p-2 rounded-xl bg-success/10 border border-success/20 hover:bg-success/20 text-success text-xs font-medium transition-all flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" />{t("تأیید", "Approve")}</button>
                      <button onClick={(e) => { e.stopPropagation(); setRejectModal({ id: rev.id, type: "review", name: `Review #${rev.id.slice(0, 6)}` }); }} className="flex-1 p-2 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive text-xs font-medium transition-all flex items-center justify-center gap-1"><X className="w-3.5 h-3.5" />{t("رد", "Reject")}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Detail Modal - with photos */}
      <Dialog open={!!reviewDetailModal} onOpenChange={() => setReviewDetailModal(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-2xl border-border/30 rounded-2xl shadow-2xl max-w-lg">
          <DialogHeader><DialogTitle className="text-lg font-bold">{t("جزئیات ریویو", "Review Details")}</DialogTitle></DialogHeader>
          {reviewDetailModal && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {reviewDetailModal.influencers?.avatar_url ? (
                  <img src={reviewDetailModal.influencers.avatar_url} className="w-12 h-12 rounded-xl object-cover" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{(reviewDetailModal.influencers?.name || "?").charAt(0)}</div>
                )}
                <div>
                  <h3 className="font-bold text-foreground">{reviewDetailModal.influencers?.name || "—"}</h3>
                  <p className="text-xs text-muted-foreground">→ {reviewDetailModal.businesses?.name || "—"}</p>
                </div>
                <div className="ms-auto flex items-center gap-1 text-warning font-bold">
                  <Star className="w-4 h-4 fill-warning" />{reviewDetailModal.rating}/5
                </div>
              </div>

              {reviewDetailModal.content && (
                <p className="text-sm text-foreground/80 bg-muted/20 rounded-xl p-3">{reviewDetailModal.content}</p>
              )}

              {/* Media Grid */}
              {reviewDetailModal.media_urls && reviewDetailModal.media_urls.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">{t("تصاویر ارسالی", "Submitted Photos")}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {reviewDetailModal.media_urls.map((url: string, i: number) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => setLightboxImg(url)}>
                        <img src={url} alt={`Review ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <Clock className="w-3 h-3" />
                <span>{formatDate(reviewDetailModal.created_at)} — {formatTime(reviewDetailModal.created_at)}</span>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => { handleApprove(reviewDetailModal.id, "review", `Review #${reviewDetailModal.id.slice(0, 6)}`); setReviewDetailModal(null); }} className="flex-1 gold-gradient text-primary-foreground border-0 rounded-xl h-11 font-semibold">{t("تأیید", "Approve")}</Button>
                <Button variant="destructive" onClick={() => { setReviewDetailModal(null); setRejectModal({ id: reviewDetailModal.id, type: "review", name: `Review #${reviewDetailModal.id.slice(0, 6)}` }); }} className="flex-1 rounded-xl h-11 font-semibold">{t("رد", "Reject")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <Dialog open={!!lightboxImg} onOpenChange={() => setLightboxImg(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-2xl border-border/30 rounded-2xl shadow-2xl max-w-2xl p-2">
          {lightboxImg && <img src={lightboxImg} alt="Preview" className="w-full rounded-xl" />}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-2xl border-border/30 rounded-2xl shadow-2xl">
          <DialogHeader><DialogTitle className="text-lg font-bold">{t("دلیل رد درخواست", "Rejection Reason")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {presetReasons.map(r => (
                <button key={r} onClick={() => setRejectReason(r)} className="px-3.5 py-2 rounded-xl bg-muted/40 border border-border/20 text-sm hover:bg-muted/70 hover:border-border/40 transition-all">{r}</button>
              ))}
            </div>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder={t("دلیل رد را بنویسید...", "Write rejection reason...")} className="w-full h-24 bg-muted/20 border border-border/30 rounded-xl p-3.5 text-sm resize-none outline-none focus:border-primary/50 transition-colors" />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setRejectModal(null)} className="rounded-xl">{t("انصراف", "Cancel")}</Button>
              <Button variant="destructive" onClick={handleReject} className="rounded-xl">{t("رد درخواست", "Reject")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal (influencer/business) */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-2xl border-border/30 rounded-2xl shadow-2xl max-w-lg">
          <DialogHeader><DialogTitle className="text-lg font-bold">{detailModal?.name}</DialogTitle></DialogHeader>
          {detailModal && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                {(detailModal.avatar_url || detailModal.logo_url) ? (
                  <img src={detailModal.avatar_url || detailModal.logo_url} alt={detailModal.name} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary/20" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-3xl ring-2 ring-primary/20">{detailModal.name.charAt(0)}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-bold text-foreground">{detailModal.name}</div>
                  {detailModal.handle && (
                    <a
                      href={`https://instagram.com/${(detailModal.handle || "").replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Instagram className="w-4 h-4" />@{(detailModal.handle || "").replace(/^@/, "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {!detailModal.handle && detailModal.contact_name && (
                    <div className="text-sm text-muted-foreground mt-0.5">{detailModal.contact_name}</div>
                  )}
                  {detailModal.city && <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{detailModal.city}</div>}
                  <div className="mt-1.5"><StatusBadge status={detailModal.status} /></div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 rounded-xl px-3 py-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{t("تاریخ درخواست:", "Request date:")} {formatDate(detailModal.submitted_at)} — {formatTime(detailModal.submitted_at)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10"><span className="text-xs text-muted-foreground">{t("دسته‌بندی", "Category")}</span><div className="font-medium mt-1 text-foreground">{detailModal.categories?.name_fa || detailModal.categories?.name || "—"}</div></div>
                {detailModal.followers !== undefined && <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10"><span className="text-xs text-muted-foreground">{t("فالوور", "Followers")}</span><div className="font-medium mt-1 text-foreground">{detailModal.followers >= 1000 ? `${(detailModal.followers / 1000).toFixed(1)}K` : detailModal.followers}</div></div>}
                {detailModal.engagement !== undefined && <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10"><span className="text-xs text-muted-foreground">{t("تعامل", "Engagement")}</span><div className="font-medium mt-1 text-foreground">{detailModal.engagement}%</div></div>}
                {detailModal.email && <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10"><span className="text-xs text-muted-foreground">{t("ایمیل", "Email")}</span><div className="font-medium mt-1 text-foreground truncate">{detailModal.email}</div></div>}
                {detailModal.phone && <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10"><span className="text-xs text-muted-foreground">{t("تلفن", "Phone")}</span><div className="font-medium mt-1 text-foreground">{detailModal.phone}</div></div>}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => { handleApprove(detailModal.id, detailModal._type, detailModal.name); setDetailModal(null); }} className="flex-1 gold-gradient text-primary-foreground border-0 rounded-xl h-11 font-semibold">{t("تأیید", "Approve")}</Button>
                <Button variant="destructive" onClick={() => { setDetailModal(null); setRejectModal({ id: detailModal.id, type: detailModal._type, name: detailModal.name }); }} className="flex-1 rounded-xl h-11 font-semibold">{t("رد", "Reject")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ApprovalsPage;
