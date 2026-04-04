import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { demoInfluencers, demoBusinesses } from "@/data/demoData";
import { Check, X, Eye, MessageSquare, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const ApprovalsPage = () => {
  const { t } = useLanguage();
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  const presetReasons = [
    t("اطلاعات ناقص", "Incomplete information"),
    t("تصاویر نامناسب", "Inappropriate images"),
    t("حساب تکراری", "Duplicate account"),
    t("عدم تطابق اطلاعات", "Information mismatch"),
  ];

  const handleApprove = (name: string) => toast.success(t(`${name} تأیید شد`, `${name} approved`));
  const handleReject = () => {
    toast.error(t("درخواست رد شد", "Request rejected"));
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
          <TabsTrigger value="verification" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("تأیید هویت", "Verification")}</TabsTrigger>
          <TabsTrigger value="resubmissions" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("ارسال مجدد", "Resubmissions")}</TabsTrigger>
        </TabsList>

        <TabsContent value="bloggers">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("پروفایل", "Profile")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("اینستاگرام", "Instagram")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("فالوور", "Followers")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("شهر", "City")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("تاریخ", "Date")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("وضعیت", "Status")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("عملیات", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {demoInfluencers.map((inf) => (
                    <tr key={inf.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{inf.name.charAt(0)}</div>
                          <div>
                            <div className="text-sm font-medium">{inf.name}</div>
                            <div className="text-xs text-muted-foreground">{t(`سن: ${inf.age}`, `Age: ${inf.age}`)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{inf.handle}</td>
                      <td className="p-4 text-sm">{(inf.followers / 1000).toFixed(0)}K</td>
                      <td className="p-4 text-sm text-muted-foreground">{inf.city}</td>
                      <td className="p-4 text-xs text-muted-foreground">{inf.submittedDate}</td>
                      <td className="p-4"><StatusBadge status={inf.status} /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleApprove(inf.name)} className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setRejectModal(inf.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><X className="w-4 h-4" /></button>
                          <button onClick={() => setDetailModal(inf)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-info/10 text-info transition-colors"><MessageSquare className="w-4 h-4" /></button>
                        </div>
                      </td>
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
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("برند", "Brand")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("دسته‌بندی", "Category")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("شهر", "City")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("تماس", "Contact")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("وضعیت", "Status")}</th>
                    <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("عملیات", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {demoBusinesses.map((biz) => (
                    <tr key={biz.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{biz.name.charAt(0)}</div>
                          <div className="text-sm font-medium">{biz.name}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{biz.category}</td>
                      <td className="p-4 text-sm text-muted-foreground">{biz.city}</td>
                      <td className="p-4 text-sm text-muted-foreground">{biz.contact}</td>
                      <td className="p-4"><StatusBadge status={biz.status} /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleApprove(biz.name)} className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setRejectModal(biz.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><X className="w-4 h-4" /></button>
                          <button onClick={() => setDetailModal(biz)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                        </div>
                      </td>
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
            <p className="text-sm">{t("همه ریویوها بررسی شده‌اند", "All reviews have been processed")}</p>
          </div>
        </TabsContent>
        <TabsContent value="verification">
          <div className="glass-card p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 mx-auto mb-4 flex items-center justify-center"><Check className="w-8 h-8" /></div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{t("درخواست تأیید هویتی وجود ندارد", "No verification requests")}</h3>
          </div>
        </TabsContent>
        <TabsContent value="resubmissions">
          <div className="glass-card p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 mx-auto mb-4 flex items-center justify-center"><MoreHorizontal className="w-8 h-8" /></div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{t("ارسال مجددی وجود ندارد", "No resubmissions")}</h3>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Modal */}
      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl">
          <DialogHeader><DialogTitle>{t("دلیل رد درخواست", "Rejection Reason")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {presetReasons.map((r) => (
                <button key={r} onClick={() => setRejectReason(r)} className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm hover:bg-muted transition-colors">{r}</button>
              ))}
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("دلیل رد را بنویسید...", "Write rejection reason...")}
              className="w-full h-24 bg-muted/30 border border-border/50 rounded-xl p-3 text-sm resize-none outline-none focus:border-primary/50 transition-colors"
            />
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
                  <div className="text-sm text-muted-foreground">{detailModal.handle || detailModal.contact} • {detailModal.city}</div>
                  <StatusBadge status={detailModal.status} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("دسته‌بندی", "Category")}</span><div className="font-medium mt-1">{detailModal.category}</div></div>
                {detailModal.followers && <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("فالوور", "Followers")}</span><div className="font-medium mt-1">{(detailModal.followers / 1000).toFixed(0)}K</div></div>}
                {detailModal.engagement && <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("تعامل", "Engagement")}</span><div className="font-medium mt-1">{detailModal.engagement}%</div></div>}
                {detailModal.rating && <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("امتیاز", "Rating")}</span><div className="font-medium mt-1">{detailModal.rating}/5</div></div>}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { handleApprove(detailModal.name); setDetailModal(null); }} className="flex-1 gold-gradient text-primary-foreground border-0">{t("تأیید", "Approve")}</Button>
                <Button variant="destructive" onClick={() => { setDetailModal(null); setRejectModal(detailModal.name); }} className="flex-1">{t("رد", "Reject")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ApprovalsPage;
