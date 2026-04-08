import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Eye, MessageSquare, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const ApprovalsPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState<{ id: string; type: string; name: string } | null>(null);
  const [detailModal, setDetailModal] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

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

  useRealtimeInvalidation("influencers", ["influencers"]);
  useRealtimeInvalidation("businesses", ["businesses"]);

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
    }
    setRejectModal(null);
    setRejectReason("");
  };

  return (
    <AdminLayout title={t("تأییدیه‌ها", "Approvals")}>
      <Tabs defaultValue="bloggers" className="space-y-4">
        <TabsList className="bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="bloggers" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("بلاگرها", "Bloggers")}</TabsTrigger>
          <TabsTrigger value="businesses" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("کسب‌وکارها", "Businesses")}</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("ریویوها", "Reviews")}</TabsTrigger>
        </TabsList>

        <TabsContent value="bloggers">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border/50">
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("پروفایل", "Profile")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("اینستاگرام", "Instagram")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("فالوور", "Followers")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("شهر", "City")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("وضعیت", "Status")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("عملیات", "Actions")}</th>
                </tr></thead>
                <tbody>
                  {influencers.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">{t("اینفلوئنسری یافت نشد", "No influencers found")}</td></tr>}
                  {influencers.map((inf: any) => (
                    <tr key={inf.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{inf.name.charAt(0)}</div><div><div className="text-sm font-medium">{inf.name}</div><div className="text-xs text-muted-foreground">{inf.age ? t(`سن: ${inf.age}`, `Age: ${inf.age}`) : ""}</div></div></div></td>
                      <td className="p-4 text-sm text-muted-foreground">{inf.handle || "-"}</td>
                      <td className="p-4 text-sm">{inf.followers >= 1000 ? `${(inf.followers / 1000).toFixed(0)}K` : inf.followers}</td>
                      <td className="p-4 text-sm text-muted-foreground">{inf.city || "-"}</td>
                      <td className="p-4"><StatusBadge status={inf.status} /></td>
                      <td className="p-4"><div className="flex items-center gap-1">
                        <button onClick={() => handleApprove(inf.id, "influencer", inf.name)} className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setRejectModal({ id: inf.id, type: "influencer", name: inf.name })} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><X className="w-4 h-4" /></button>
                        <button onClick={() => setDetailModal({ ...inf, _type: "influencer" })} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="businesses">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border/50">
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("برند", "Brand")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("دسته‌بندی", "Category")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("شهر", "City")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("تماس", "Contact")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("وضعیت", "Status")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("عملیات", "Actions")}</th>
                </tr></thead>
                <tbody>
                  {businesses.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">{t("کسب‌وکاری یافت نشد", "No businesses found")}</td></tr>}
                  {businesses.map((biz: any) => (
                    <tr key={biz.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{biz.name.charAt(0)}</div><div className="text-sm font-medium">{biz.name}</div></div></td>
                      <td className="p-4 text-sm text-muted-foreground">{biz.categories?.name_fa || biz.categories?.name || "-"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{biz.city || "-"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{biz.contact_name || "-"}</td>
                      <td className="p-4"><StatusBadge status={biz.status} /></td>
                      <td className="p-4"><div className="flex items-center gap-1">
                        <button onClick={() => handleApprove(biz.id, "business", biz.name)} className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setRejectModal({ id: biz.id, type: "business", name: biz.name })} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><X className="w-4 h-4" /></button>
                        <button onClick={() => setDetailModal({ ...biz, _type: "business" })} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="glass-card p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 mx-auto mb-4 flex items-center justify-center"><Eye className="w-8 h-8" /></div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{t("ریویویی برای بررسی وجود ندارد", "No reviews to review")}</h3>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Modal */}
      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl">
          <DialogHeader><DialogTitle>{t("دلیل رد درخواست", "Rejection Reason")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {presetReasons.map(r => (
                <button key={r} onClick={() => setRejectReason(r)} className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm hover:bg-muted transition-colors">{r}</button>
              ))}
            </div>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder={t("دلیل رد را بنویسید...", "Write rejection reason...")} className="w-full h-24 bg-muted/30 border border-border/50 rounded-xl p-3 text-sm resize-none outline-none focus:border-primary/50 transition-colors" />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setRejectModal(null)}>{t("انصراف", "Cancel")}</Button>
              <Button variant="destructive" onClick={handleReject}>{t("رد درخواست", "Reject")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-lg">
          <DialogHeader><DialogTitle>{detailModal?.name}</DialogTitle></DialogHeader>
          {detailModal && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">{detailModal.name.charAt(0)}</div>
                <div>
                  <div className="text-lg font-bold">{detailModal.name}</div>
                  <div className="text-sm text-muted-foreground">{detailModal.handle || detailModal.contact_name || ""} • {detailModal.city || "-"}</div>
                  <StatusBadge status={detailModal.status} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("دسته‌بندی", "Category")}</span><div className="font-medium mt-1">{detailModal.categories?.name_fa || detailModal.categories?.name || "-"}</div></div>
                {detailModal.followers !== undefined && <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("فالوور", "Followers")}</span><div className="font-medium mt-1">{detailModal.followers >= 1000 ? `${(detailModal.followers / 1000).toFixed(0)}K` : detailModal.followers}</div></div>}
                {detailModal.engagement !== undefined && <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("تعامل", "Engagement")}</span><div className="font-medium mt-1">{detailModal.engagement}%</div></div>}
                {detailModal.rating !== undefined && <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("امتیاز", "Rating")}</span><div className="font-medium mt-1">{detailModal.rating}/5</div></div>}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { handleApprove(detailModal.id, detailModal._type, detailModal.name); setDetailModal(null); }} className="flex-1 gold-gradient text-primary-foreground border-0">{t("تأیید", "Approve")}</Button>
                <Button variant="destructive" onClick={() => { setDetailModal(null); setRejectModal({ id: detailModal.id, type: detailModal._type, name: detailModal.name }); }} className="flex-1">{t("رد", "Reject")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ApprovalsPage;
