import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { demoCampaigns } from "@/data/demoData";
import { Eye, Pause, Copy, Archive, Edit, Plus, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CampaignsPage = () => {
  const { t } = useLanguage();
  const [detail, setDetail] = useState<typeof demoCampaigns[0] | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const statuses = ["active", "pending", "scheduled", "completed", "rejected"];

  return (
    <AdminLayout title={t("کمپین‌ها", "Campaigns")}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-semibold">{t("مدیریت کمپین‌ها", "Campaign Management")}</h2>
        <Button onClick={() => setAddModal(true)} className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0">
          <Plus className="w-4 h-4" />{t("افزودن کمپین", "Add Campaign")}
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-muted/50 rounded-xl p-1">
          {statuses.map(s => (
            <TabsTrigger key={s} value={s} className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground capitalize">
              {t({ active: "فعال", pending: "در انتظار", scheduled: "برنامه‌ریزی", completed: "تکمیل", rejected: "رد شده" }[s]!, s)}
              <span className="ms-1.5 px-1.5 py-0.5 rounded-md bg-muted/50 text-[10px]">{demoCampaigns.filter(c => c.status === s).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {statuses.map(s => (
          <TabsContent key={s} value={s}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoCampaigns.filter(c => c.status === s).map(camp => (
                <div key={camp.id} className="glass-card p-5 hover-glow cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setDetail(camp)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{camp.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{camp.business}</p>
                    </div>
                    <StatusBadge status={camp.status} />
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>{t("دسته‌بندی", "Category")}</span><span className="text-foreground">{camp.category}</span></div>
                    <div className="flex justify-between"><span>{t("شهر", "City")}</span><span className="text-foreground">{camp.city}</span></div>
                    <div className="flex justify-between"><span>{t("بازه زمانی", "Date Range")}</span><span className="text-foreground">{camp.dateRange}</span></div>
                    <div className="flex justify-between"><span>{t("اینفلوئنسر", "Influencers")}</span><span className="text-foreground">{camp.assignedInfluencers}</span></div>
                    <div className="flex justify-between"><span>{t("بودجه", "Budget")}</span><span className="text-primary font-medium">{camp.budget}</span></div>
                  </div>
                  {camp.performance > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{t("عملکرد", "Performance")}</span><span className="font-medium">{camp.performance}%</span></div>
                      <div className="h-1.5 bg-muted/50 rounded-full"><div className="h-full rounded-full gold-gradient" style={{ width: `${camp.performance}%` }} /></div>
                    </div>
                  )}
                  {/* Cancel button */}
                  {(camp.status === "active" || camp.status === "pending" || camp.status === "scheduled") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full text-destructive hover:bg-destructive/10 rounded-xl gap-2"
                      onClick={(e) => { e.stopPropagation(); setCancelModal(camp.id); }}
                    >
                      <XCircle className="w-4 h-4" />{t("لغو کمپین", "Cancel Campaign")}
                    </Button>
                  )}
                </div>
              ))}
              {demoCampaigns.filter(c => c.status === s).length === 0 && (
                <div className="col-span-full glass-card p-12 text-center text-muted-foreground">
                  <p className="text-sm">{t("کمپینی یافت نشد", "No campaigns found")}</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-lg">
          <DialogHeader><DialogTitle>{detail?.title}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-2"><StatusBadge status={detail.status} /><span className="text-sm text-muted-foreground">{detail.business}</span></div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("دسته‌بندی", "Category")}</span><div className="font-medium mt-1">{detail.category}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("شهر", "City")}</span><div className="font-medium mt-1">{detail.city}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("اینفلوئنسر", "Influencers")}</span><div className="font-medium mt-1">{detail.assignedInfluencers}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("بودجه", "Budget")}</span><div className="font-medium mt-1 text-primary">{detail.budget}</div></div>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 text-sm"><span className="text-muted-foreground">{t("بازه زمانی", "Date Range")}:</span> {detail.dateRange}</div>
              <div className="p-4 rounded-xl bg-muted/20">
                <h4 className="text-sm font-semibold mb-2">{t("یادداشت ادمین", "Admin Notes")}</h4>
                <textarea className="w-full h-16 bg-muted/30 border border-border/50 rounded-xl p-3 text-sm resize-none outline-none" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success(t("ویرایش شد", "Edited"))}><Edit className="w-4 h-4" />{t("ویرایش", "Edit")}</Button>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success(t("متوقف شد", "Paused"))}><Pause className="w-4 h-4" />{t("توقف", "Pause")}</Button>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success(t("کپی شد", "Duplicated"))}><Copy className="w-4 h-4" />{t("کپی", "Duplicate")}</Button>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success(t("آرشیو شد", "Archived"))}><Archive className="w-4 h-4" />{t("آرشیو", "Archive")}</Button>
                <Button variant="destructive" className="gap-2 rounded-xl" onClick={() => { toast.success(t("کمپین لغو شد", "Campaign cancelled")); setDetail(null); }}><XCircle className="w-4 h-4" />{t("لغو", "Cancel")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Campaign Modal */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent className="bg-card border-border/50 rounded-2xl">
          <DialogHeader><DialogTitle>{t("افزودن کمپین جدید", "Add New Campaign")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("عنوان کمپین", "Campaign Title")}</label><input className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("کسب‌وکار", "Business")}</label><input className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-muted-foreground mb-1 block">{t("دسته‌بندی", "Category")}</label>
                <select className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none">
                  <option>Food</option><option>Restaurant</option><option>Hotel</option><option>Beauty</option><option>Sport</option><option>Art</option><option>Fashion</option>
                </select>
              </div>
              <div><label className="text-sm text-muted-foreground mb-1 block">{t("شهر", "City")}</label><input className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            </div>
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("بودجه", "Budget")}</label><input className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <Button className="w-full rounded-xl gold-gradient text-primary-foreground border-0" onClick={() => { toast.success(t("کمپین ایجاد شد", "Campaign created")); setAddModal(false); }}>{t("ایجاد کمپین", "Create Campaign")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirm */}
      <Dialog open={!!cancelModal} onOpenChange={() => setCancelModal(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle>{t("لغو کمپین", "Cancel Campaign")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("آیا مطمئن هستید که می‌خواهید این کمپین را لغو کنید؟", "Are you sure you want to cancel this campaign?")}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setCancelModal(null)}>{t("انصراف", "No")}</Button>
            <Button variant="destructive" onClick={() => { toast.success(t("کمپین لغو شد", "Campaign cancelled")); setCancelModal(null); }}>{t("لغو کمپین", "Cancel Campaign")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CampaignsPage;
