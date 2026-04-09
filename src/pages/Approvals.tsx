import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Eye, Search, Clock, User, Building2, Star, ChevronDown } from "lucide-react";
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
  const [rejectReason, setRejectReason] = useState("");
  const [searchBloggers, setSearchBloggers] = useState("");
  const [searchBusinesses, setSearchBusinesses] = useState("");

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

  // Only pending items for approval lists
  const pendingInfluencers = useMemo(() => {
    let list = influencers.filter((i: any) => i.status === "pending");
    if (searchBloggers.trim()) {
      const q = searchBloggers.toLowerCase();
      list = list.filter((i: any) =>
        i.name?.toLowerCase().includes(q) ||
        i.handle?.toLowerCase().includes(q) ||
        i.city?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [influencers, searchBloggers]);

  const pendingBusinesses = useMemo(() => {
    let list = businesses.filter((b: any) => b.status === "pending");
    if (searchBusinesses.trim()) {
      const q = searchBusinesses.toLowerCase();
      list = list.filter((b: any) =>
        b.name?.toLowerCase().includes(q) ||
        b.contact_name?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [businesses, searchBusinesses]);

  const presetReasons = [
    t("اطلاعات ناقص", "Incomplete information"),
    t("تصاویر نامناسب", "Inappropriate images"),
    t("حساب تکراری", "Duplicate account"),
    t("عدم تطابق اطلاعات", "Information mismatch"),
  ];

  const handleApprove = async (id: string, type: string, name: string) => {
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
            {pendingCounts.bloggers > 0 && (
              <span className="ms-2 bg-warning/20 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingCounts.bloggers}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="businesses" className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
            <Building2 className="w-4 h-4 me-2" />
            {t("کسب‌وکارها", "Businesses")}
            {pendingCounts.businesses > 0 && (
              <span className="ms-2 bg-warning/20 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingCounts.businesses}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
            <Star className="w-4 h-4 me-2" />
            {t("ریویوها", "Reviews")}
            {pendingCounts.reviews > 0 && (
              <span className="ms-2 bg-warning/20 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingCounts.reviews}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Bloggers Tab ─── */}
        <TabsContent value="bloggers" className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchBloggers}
              onChange={e => setSearchBloggers(e.target.value)}
              placeholder={t("جستجو بلاگر...", "Search bloggers...")}
              className="w-full bg-card/40 backdrop-blur-xl border border-border/30 rounded-xl ps-11 pe-4 py-3 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-colors"
            />
          </div>

          {pendingInfluencers.length === 0 ? (
            <div className="bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{t("همه بلاگرها بررسی شدند", "All bloggers reviewed")}</h3>
              <p className="text-sm text-muted-foreground">{t("درخواست جدیدی در انتظار تأیید نیست", "No pending requests")}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingInfluencers.map((inf: any) => (
                <div key={inf.id} className="group bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl p-5 hover:border-primary/30 hover:shadow-[var(--gold-glow)] transition-all duration-300">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    {inf.avatar_url ? (
                      <img src={inf.avatar_url} alt={inf.name} className="w-14 h-14 rounded-xl object-cover ring-2 ring-border/30" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-border/30">
                        {inf.name.charAt(0)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground truncate">{inf.name}</h3>
                        <StatusBadge status={inf.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {inf.handle && <span className="text-primary/80">@{inf.handle.replace('@', '')}</span>}
                        {inf.city && <span>{inf.city}</span>}
                        {inf.followers > 0 && <span>{inf.followers >= 1000 ? `${(inf.followers / 1000).toFixed(0)}K` : inf.followers} {t("فالوور", "followers")}</span>}
                        {inf.categories && <span>{inf.categories.name_fa || inf.categories.name}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground/70">
                        <Clock className="w-3 h-3" />
                        <span>{t("درخواست:", "Requested:")} {formatDate(inf.submitted_at)} — {formatTime(inf.submitted_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDetailModal({ ...inf, _type: "influencer" })}
                        className="p-2.5 rounded-xl bg-muted/30 border border-border/20 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
                        title={t("جزئیات", "Details")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApprove(inf.id, "influencer", inf.name)}
                        className="p-2.5 rounded-xl bg-success/10 border border-success/20 hover:bg-success/20 text-success transition-all"
                        title={t("تأیید", "Approve")}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRejectModal({ id: inf.id, type: "influencer", name: inf.name })}
                        className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive transition-all"
                        title={t("رد", "Reject")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Businesses Tab ─── */}
        <TabsContent value="businesses" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchBusinesses}
              onChange={e => setSearchBusinesses(e.target.value)}
              placeholder={t("جستجو کسب‌وکار...", "Search businesses...")}
              className="w-full bg-card/40 backdrop-blur-xl border border-border/30 rounded-xl ps-11 pe-4 py-3 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-colors"
            />
          </div>

          {pendingBusinesses.length === 0 ? (
            <div className="bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{t("همه کسب‌وکارها بررسی شدند", "All businesses reviewed")}</h3>
              <p className="text-sm text-muted-foreground">{t("درخواست جدیدی در انتظار تأیید نیست", "No pending requests")}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingBusinesses.map((biz: any) => (
                <div key={biz.id} className="group bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl p-5 hover:border-primary/30 hover:shadow-[var(--gold-glow)] transition-all duration-300">
                  <div className="flex items-center gap-4">
                    {biz.logo_url ? (
                      <img src={biz.logo_url} alt={biz.name} className="w-14 h-14 rounded-xl object-cover ring-2 ring-border/30" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-border/30">
                        {biz.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground truncate">{biz.name}</h3>
                        <StatusBadge status={biz.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {biz.contact_name && <span>{biz.contact_name}</span>}
                        {biz.city && <span>{biz.city}</span>}
                        {biz.categories && <span>{biz.categories.name_fa || biz.categories.name}</span>}
                        {biz.email && <span className="text-primary/80">{biz.email}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground/70">
                        <Clock className="w-3 h-3" />
                        <span>{t("درخواست:", "Requested:")} {formatDate(biz.submitted_at)} — {formatTime(biz.submitted_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDetailModal({ ...biz, _type: "business" })}
                        className="p-2.5 rounded-xl bg-muted/30 border border-border/20 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
                        title={t("جزئیات", "Details")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApprove(biz.id, "business", biz.name)}
                        className="p-2.5 rounded-xl bg-success/10 border border-success/20 hover:bg-success/20 text-success transition-all"
                        title={t("تأیید", "Approve")}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRejectModal({ id: biz.id, type: "business", name: biz.name })}
                        className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive transition-all"
                        title={t("رد", "Reject")}
                      >
                        <X className="w-4 h-4" />
                      </button>
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
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{t("ریویویی برای بررسی وجود ندارد", "No reviews to review")}</h3>
              <p className="text-sm text-muted-foreground">{t("همه ریویوها بررسی شدند", "All reviews have been reviewed")}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((rev: any) => (
                <div key={rev.id} className="group bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl p-5 hover:border-primary/30 hover:shadow-[var(--gold-glow)] transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center">
                      <Star className="w-6 h-6 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground truncate">
                          {rev.influencers?.name || "—"} → {rev.businesses?.name || "—"}
                        </h3>
                        <span className="text-xs text-warning font-medium">★ {rev.rating}/5</span>
                      </div>
                      {rev.content && <p className="text-xs text-muted-foreground line-clamp-2">{rev.content}</p>}
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground/70">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(rev.created_at)} — {formatTime(rev.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleApprove(rev.id, "review", `Review #${rev.id.slice(0, 6)}`)}
                        className="p-2.5 rounded-xl bg-success/10 border border-success/20 hover:bg-success/20 text-success transition-all"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRejectModal({ id: rev.id, type: "review", name: `Review #${rev.id.slice(0, 6)}` })}
                        className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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

      {/* Detail Modal */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-2xl border-border/30 rounded-2xl shadow-2xl max-w-lg">
          <DialogHeader><DialogTitle className="text-lg font-bold">{detailModal?.name}</DialogTitle></DialogHeader>
          {detailModal && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                {(detailModal.avatar_url || detailModal.logo_url) ? (
                  <img src={detailModal.avatar_url || detailModal.logo_url} alt={detailModal.name} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary/20" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-3xl ring-2 ring-primary/20">
                    {detailModal.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-xl font-bold text-foreground">{detailModal.name}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{detailModal.handle || detailModal.contact_name || ""} {detailModal.city ? `• ${detailModal.city}` : ""}</div>
                  <div className="mt-1.5"><StatusBadge status={detailModal.status} /></div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 rounded-xl px-3 py-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{t("تاریخ درخواست:", "Request date:")} {formatDate(detailModal.submitted_at)} — {formatTime(detailModal.submitted_at)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10">
                  <span className="text-xs text-muted-foreground">{t("دسته‌بندی", "Category")}</span>
                  <div className="font-medium mt-1 text-foreground">{detailModal.categories?.name_fa || detailModal.categories?.name || "—"}</div>
                </div>
                {detailModal.followers !== undefined && (
                  <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10">
                    <span className="text-xs text-muted-foreground">{t("فالوور", "Followers")}</span>
                    <div className="font-medium mt-1 text-foreground">{detailModal.followers >= 1000 ? `${(detailModal.followers / 1000).toFixed(1)}K` : detailModal.followers}</div>
                  </div>
                )}
                {detailModal.engagement !== undefined && (
                  <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10">
                    <span className="text-xs text-muted-foreground">{t("تعامل", "Engagement")}</span>
                    <div className="font-medium mt-1 text-foreground">{detailModal.engagement}%</div>
                  </div>
                )}
                {detailModal.rating !== undefined && (
                  <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10">
                    <span className="text-xs text-muted-foreground">{t("امتیاز", "Rating")}</span>
                    <div className="font-medium mt-1 text-foreground">{detailModal.rating}/5</div>
                  </div>
                )}
                {detailModal.email && (
                  <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10">
                    <span className="text-xs text-muted-foreground">{t("ایمیل", "Email")}</span>
                    <div className="font-medium mt-1 text-foreground truncate">{detailModal.email}</div>
                  </div>
                )}
                {detailModal.phone && (
                  <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10">
                    <span className="text-xs text-muted-foreground">{t("تلفن", "Phone")}</span>
                    <div className="font-medium mt-1 text-foreground">{detailModal.phone}</div>
                  </div>
                )}
              </div>

              {detailModal.bio && (
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/10">
                  <span className="text-xs text-muted-foreground">{t("بیوگرافی", "Bio")}</span>
                  <p className="text-sm mt-1 text-foreground/80">{detailModal.bio}</p>
                </div>
              )}

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
