import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Pause, Copy, Archive, Edit, Plus, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CampaignsPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [detail, setDetail] = useState<any>(null);
  const [addModal, setAddModal] = useState(false);
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const statuses = ["active", "pending", "scheduled", "completed", "rejected"];

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*, businesses(name), categories(name, name_fa), campaign_influencers(id)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  useRealtimeInvalidation("campaigns", ["campaigns"]);

  const handleCancel = async (id: string) => {
    await supabase.from("campaigns").update({ status: "rejected" as any }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    toast.success(t("کمپین لغو شد", "Campaign cancelled"));
    setCancelModal(null);
  };

  if (isLoading) return <AdminLayout title={t("کمپین‌ها", "Campaigns")}><div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;

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
              <span className="ms-1.5 px-1.5 py-0.5 rounded-md bg-muted/50 text-[10px]">{campaigns.filter((c: any) => c.status === s).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {statuses.map(s => (
          <TabsContent key={s} value={s}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.filter((c: any) => c.status === s).map((camp: any) => (
                <div key={camp.id} className="glass-card p-5 hover-glow cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setDetail(camp)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{camp.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{camp.businesses?.name || "-"}</p>
                    </div>
                    <StatusBadge status={camp.status} />
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>{t("دسته‌بندی", "Category")}</span><span className="text-foreground">{camp.categories?.name_fa || camp.categories?.name || "-"}</span></div>
                    <div className="flex justify-between"><span>{t("شهر", "City")}</span><span className="text-foreground">{camp.city || "-"}</span></div>
                    <div className="flex justify-between"><span>{t("تاریخ شروع", "Start")}</span><span className="text-foreground">{camp.start_date || "-"}</span></div>
                    <div className="flex justify-between"><span>{t("اینفلوئنسر", "Influencers")}</span><span className="text-foreground">{camp.campaign_influencers?.length || 0}</span></div>
                    <div className="flex justify-between"><span>{t("بودجه", "Budget")}</span><span className="text-primary font-medium">{camp.budget || "-"}</span></div>
                  </div>
                  {camp.performance > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{t("عملکرد", "Performance")}</span><span className="font-medium">{camp.performance}%</span></div>
                      <div className="h-1.5 bg-muted/50 rounded-full"><div className="h-full rounded-full gold-gradient" style={{ width: `${camp.performance}%` }} /></div>
                    </div>
                  )}
                  {(camp.status === "active" || camp.status === "pending" || camp.status === "scheduled") && (
                    <Button variant="ghost" size="sm" className="mt-3 w-full text-destructive hover:bg-destructive/10 rounded-xl gap-2" onClick={(e) => { e.stopPropagation(); setCancelModal(camp.id); }}>
                      <XCircle className="w-4 h-4" />{t("لغو کمپین", "Cancel Campaign")}
                    </Button>
                  )}
                </div>
              ))}
              {campaigns.filter((c: any) => c.status === s).length === 0 && (
                <div className="col-span-full glass-card p-12 text-center text-muted-foreground"><p className="text-sm">{t("کمپینی یافت نشد", "No campaigns found")}</p></div>
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
              <div className="flex items-center gap-2"><StatusBadge status={detail.status} /><span className="text-sm text-muted-foreground">{detail.businesses?.name || "-"}</span></div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("دسته‌بندی", "Category")}</span><div className="font-medium mt-1">{detail.categories?.name_fa || detail.categories?.name || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("شهر", "City")}</span><div className="font-medium mt-1">{detail.city || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("اینفلوئنسر", "Influencers")}</span><div className="font-medium mt-1">{detail.campaign_influencers?.length || 0}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("بودجه", "Budget")}</span><div className="font-medium mt-1 text-primary">{detail.budget || "-"}</div></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2 rounded-xl"><Edit className="w-4 h-4" />{t("ویرایش", "Edit")}</Button>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={async () => { await supabase.from("campaigns").update({ status: "paused" }).eq("id", detail.id); queryClient.invalidateQueries({ queryKey: ["campaigns"] }); toast.success(t("متوقف شد", "Paused")); setDetail(null); }}><Pause className="w-4 h-4" />{t("توقف", "Pause")}</Button>
                <Button variant="destructive" className="gap-2 rounded-xl" onClick={() => { handleCancel(detail.id); setDetail(null); }}><XCircle className="w-4 h-4" />{t("لغو", "Cancel")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Campaign Modal */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent className="bg-card border-border/50 rounded-2xl">
          <DialogHeader><DialogTitle>{t("افزودن کمپین جدید", "Add New Campaign")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("کمپین‌ها از طرف کسب‌وکارها ایجاد می‌شوند", "Campaigns are created by businesses")}</p>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirm */}
      <Dialog open={!!cancelModal} onOpenChange={() => setCancelModal(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle>{t("لغو کمپین", "Cancel Campaign")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("آیا مطمئن هستید؟", "Are you sure?")}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setCancelModal(null)}>{t("انصراف", "No")}</Button>
            <Button variant="destructive" onClick={() => cancelModal && handleCancel(cancelModal)}>{t("لغو کمپین", "Cancel Campaign")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CampaignsPage;
