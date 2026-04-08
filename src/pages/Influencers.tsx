import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { Search, Grid3X3, List, Eye, Ban, MessageSquare, CheckCircle, Trash2, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const InfluencersPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [detail, setDetail] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: string; id: string; name: string } | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", handle: "", city: "", category: "Food" });

  const { data: influencers = [], isLoading } = useQuery({
    queryKey: ["influencers"],
    queryFn: async () => {
      const { data } = await supabase.from("influencers").select("*, categories(name, name_fa)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  useRealtimeInvalidation("influencers", ["influencers"]);

  const cities = [...new Set(influencers.map((i: any) => i.city).filter(Boolean))];
  const filtered = influencers.filter((i: any) => {
    if (search && !i.name.includes(search) && !(i.handle || "").includes(search)) return false;
    if (selectedCity && i.city !== selectedCity) return false;
    if (selectedStatus && i.status !== selectedStatus) return false;
    return true;
  });

  const handleAction = async (action: string, id: string, name: string) => {
    setConfirmDialog(null);
    if (action === "deactivate") {
      await supabase.from("influencers").update({ status: "suspended" }).eq("id", id);
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      toast.success(t(`${name} غیرفعال شد`, `${name} deactivated`));
    } else if (action === "delete") {
      await supabase.from("influencers").delete().eq("id", id);
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      toast.success(t(`${name} حذف شد`, `${name} deleted`));
      setDetail(null);
    }
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) { toast.error(t("نام الزامی است", "Name is required")); return; }
    const { error } = await supabase.from("influencers").insert({ name: addForm.name, handle: addForm.handle, city: addForm.city, status: "pending" });
    if (error) toast.error(error.message);
    else { toast.success(t("اینفلوئنسر اضافه شد", "Influencer added")); setAddModal(false); setAddForm({ name: "", handle: "", city: "", category: "Food" }); queryClient.invalidateQueries({ queryKey: ["influencers"] }); }
  };

  const handleVerify = async (inf: any) => {
    await supabase.from("influencers").update({ verified: !inf.verified }).eq("id", inf.id);
    queryClient.invalidateQueries({ queryKey: ["influencers"] });
    toast.success(t(inf.verified ? "لغو تأیید شد" : "تأیید شد", inf.verified ? "Unverified" : "Verified"));
    setDetail(null);
  };

  if (isLoading) return <AdminLayout title={t("اینفلوئنسرها", "Influencers")}><div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;

  return (
    <AdminLayout title={t("اینفلوئنسرها", "Influencers")}>
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-muted/50 rounded-xl border border-border/50 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground mx-3" />
            <input placeholder={t("جستجو نام / هندل...", "Search name / handle...")} value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm py-2.5 pe-3 w-full" />
          </div>
          <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm outline-none">
            <option value="">{t("همه شهرها", "All Cities")}</option>
            {cities.map(c => <option key={c} value={c!}>{c}</option>)}
          </select>
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm outline-none">
            <option value="">{t("همه وضعیت‌ها", "All Statuses")}</option>
            <option value="active">{t("فعال", "Active")}</option>
            <option value="pending">{t("در انتظار", "Pending")}</option>
            <option value="suspended">{t("معلق", "Suspended")}</option>
          </select>
          <div className="flex gap-1 bg-muted/50 rounded-xl p-0.5">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-colors ${viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><List className="w-4 h-4" /></button>
          </div>
          <Button onClick={() => setAddModal(true)} className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0">
            <UserPlus className="w-4 h-4" />{t("افزودن اینفلوئنسر", "Add Influencer")}
          </Button>
        </div>
      </div>

      {filtered.length === 0 && <div className="glass-card p-12 text-center text-muted-foreground"><p className="text-sm">{t("اینفلوئنسری یافت نشد", "No influencers found")}</p></div>}

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((inf: any) => (
            <div key={inf.id} className="glass-card p-5 hover-glow cursor-pointer group transition-all hover:scale-[1.02]" onClick={() => setDetail(inf)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">{inf.name.charAt(0)}</div>
                <div className="flex items-center gap-1">
                  {inf.verified && <CheckCircle className="w-4 h-4 text-primary" />}
                  <StatusBadge status={inf.status} />
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-0.5">{inf.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{inf.handle || "-"} • {inf.city || "-"}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold">{inf.followers >= 1000 ? `${(inf.followers / 1000).toFixed(0)}K` : inf.followers}</div><div className="text-[10px] text-muted-foreground">{t("فالوور", "Followers")}</div></div>
                <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold">{inf.engagement || 0}%</div><div className="text-[10px] text-muted-foreground">{t("تعامل", "Engage")}</div></div>
                <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold">{inf.campaigns_count}</div><div className="text-[10px] text-muted-foreground">{t("کمپین", "Campaigns")}</div></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border/50">
                <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("نام", "Name")}</th>
                <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("هندل", "Handle")}</th>
                <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("فالوور", "Followers")}</th>
                <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("تعامل", "Engagement")}</th>
                <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("شهر", "City")}</th>
                <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("وضعیت", "Status")}</th>
                <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("عملیات", "Actions")}</th>
              </tr></thead>
              <tbody>
                {filtered.map((inf: any) => (
                  <tr key={inf.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{inf.name.charAt(0)}</div><span className="text-sm font-medium">{inf.name}</span>{inf.verified && <CheckCircle className="w-3.5 h-3.5 text-primary" />}</div></td>
                    <td className="p-4 text-sm text-muted-foreground">{inf.handle || "-"}</td>
                    <td className="p-4 text-sm">{inf.followers >= 1000 ? `${(inf.followers / 1000).toFixed(0)}K` : inf.followers}</td>
                    <td className="p-4 text-sm">{inf.engagement || 0}%</td>
                    <td className="p-4 text-sm text-muted-foreground">{inf.city || "-"}</td>
                    <td className="p-4"><StatusBadge status={inf.status} /></td>
                    <td className="p-4"><div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setDetail(inf); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-info/10 text-info transition-colors"><MessageSquare className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDialog({ type: "deactivate", id: inf.id, name: inf.name }); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Ban className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("پروفایل اینفلوئنسر", "Influencer Profile")}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">{detail.name.charAt(0)}</div>
                <div>
                  <div className="flex items-center gap-2"><h2 className="text-xl font-bold">{detail.name}</h2>{detail.verified && <CheckCircle className="w-5 h-5 text-primary" />}</div>
                  <p className="text-sm text-muted-foreground">{detail.handle || "-"} • {detail.city || "-"}</p>
                  <StatusBadge status={detail.status} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 text-center"><div className="text-lg font-bold">{detail.followers >= 1000 ? `${(detail.followers / 1000).toFixed(0)}K` : detail.followers}</div><div className="text-xs text-muted-foreground">{t("فالوور", "Followers")}</div></div>
                <div className="p-3 rounded-xl bg-muted/30 text-center"><div className="text-lg font-bold">{detail.engagement || 0}%</div><div className="text-xs text-muted-foreground">{t("تعامل", "Engagement")}</div></div>
                <div className="p-3 rounded-xl bg-muted/30 text-center"><div className="text-lg font-bold">{detail.campaigns_count}</div><div className="text-xs text-muted-foreground">{t("کمپین", "Campaigns")}</div></div>
                <div className="p-3 rounded-xl bg-muted/30 text-center"><div className="text-lg font-bold">{detail.reviews_count}</div><div className="text-xs text-muted-foreground">{t("ریویو", "Reviews")}</div></div>
              </div>
              <div className="p-4 rounded-xl bg-muted/20">
                <h4 className="text-sm font-semibold mb-2">{t("اطلاعات", "Details")}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">{t("دسته‌بندی", "Category")}:</span> {detail.categories?.name_fa || detail.categories?.name || "-"}</div>
                  <div><span className="text-muted-foreground">{t("جنسیت", "Gender")}:</span> {detail.gender === "female" ? t("زن", "Female") : detail.gender === "male" ? t("مرد", "Male") : "-"}</div>
                  <div><span className="text-muted-foreground">{t("سن", "Age")}:</span> {detail.age || "-"}</div>
                  <div><span className="text-muted-foreground">{t("رزرو", "Bookings")}:</span> {detail.bookings_count}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2 rounded-xl"><MessageSquare className="w-4 h-4" />{t("پیام", "Message")}</Button>
                <Button onClick={() => handleVerify(detail)} className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0"><CheckCircle className="w-4 h-4" />{detail.verified ? t("لغو تأیید", "Unverify") : t("تأیید", "Verify")}</Button>
                <Button onClick={() => setConfirmDialog({ type: "deactivate", id: detail.id, name: detail.name })} variant="destructive" className="gap-2 rounded-xl"><Ban className="w-4 h-4" />{t("غیرفعال", "Deactivate")}</Button>
                <Button onClick={() => setConfirmDialog({ type: "delete", id: detail.id, name: detail.name })} variant="ghost" className="gap-2 rounded-xl text-destructive"><Trash2 className="w-4 h-4" />{t("حذف", "Delete")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent className="bg-card border-border/50 rounded-2xl">
          <DialogHeader><DialogTitle>{t("افزودن اینفلوئنسر", "Add Influencer")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("نام", "Name")}</label><input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("هندل اینستاگرام", "Instagram Handle")}</label><input value={addForm.handle} onChange={e => setAddForm(p => ({ ...p, handle: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" placeholder="@username" /></div>
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("شهر", "City")}</label><input value={addForm.city} onChange={e => setAddForm(p => ({ ...p, city: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <Button className="w-full rounded-xl gold-gradient text-primary-foreground border-0" onClick={handleAdd}>{t("افزودن", "Add")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle>{t("تأیید عملیات", "Confirm Action")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t(`آیا مطمئن هستید که می‌خواهید ${confirmDialog?.name} را ${confirmDialog?.type === "delete" ? "حذف" : "غیرفعال"} کنید؟`, `Are you sure you want to ${confirmDialog?.type} ${confirmDialog?.name}?`)}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmDialog(null)}>{t("انصراف", "Cancel")}</Button>
            <Button variant="destructive" onClick={() => confirmDialog && handleAction(confirmDialog.type, confirmDialog.id, confirmDialog.name)}>{t("تأیید", "Confirm")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default InfluencersPage;
