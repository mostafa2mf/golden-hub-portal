import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { demoInfluencers } from "@/data/demoData";
import { Search, Filter, Grid3X3, List, Eye, Edit, Ban, MessageSquare, Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const InfluencersPage = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [detail, setDetail] = useState<typeof demoInfluencers[0] | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: string; name: string } | null>(null);

  const cities = [...new Set(demoInfluencers.map(i => i.city))];
  const filtered = demoInfluencers.filter(i => {
    if (search && !i.name.includes(search) && !i.handle.includes(search)) return false;
    if (selectedCity && i.city !== selectedCity) return false;
    if (selectedStatus && i.status !== selectedStatus) return false;
    return true;
  });

  const handleAction = (action: string, name: string) => {
    setConfirmDialog(null);
    toast.success(t(`عملیات ${action} برای ${name} انجام شد`, `${action} action completed for ${name}`));
  };

  return (
    <AdminLayout title={t("اینفلوئنسرها", "Influencers")}>
      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-muted/50 rounded-xl border border-border/50 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground mx-3" />
            <input placeholder={t("جستجو نام / هندل...", "Search name / handle...")} value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm py-2.5 pe-3 w-full" />
          </div>
          <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm outline-none">
            <option value="">{t("همه شهرها", "All Cities")}</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
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
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(inf => (
            <div key={inf.id} className="glass-card p-5 hover-glow cursor-pointer group transition-all hover:scale-[1.02]" onClick={() => setDetail(inf)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">{inf.name.charAt(0)}</div>
                <div className="flex items-center gap-1">
                  {inf.verified && <CheckCircle className="w-4 h-4 text-primary" />}
                  <StatusBadge status={inf.status} />
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-0.5">{inf.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{inf.handle} • {inf.city}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold">{(inf.followers / 1000).toFixed(0)}K</div><div className="text-[10px] text-muted-foreground">{t("فالوور", "Followers")}</div></div>
                <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold">{inf.engagement}%</div><div className="text-[10px] text-muted-foreground">{t("تعامل", "Engage")}</div></div>
                <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold">{inf.campaigns}</div><div className="text-[10px] text-muted-foreground">{t("کمپین", "Campaigns")}</div></div>
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
                {filtered.map(inf => (
                  <tr key={inf.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{inf.name.charAt(0)}</div><span className="text-sm font-medium">{inf.name}</span>{inf.verified && <CheckCircle className="w-3.5 h-3.5 text-primary" />}</div></td>
                    <td className="p-4 text-sm text-muted-foreground">{inf.handle}</td>
                    <td className="p-4 text-sm">{(inf.followers / 1000).toFixed(0)}K</td>
                    <td className="p-4 text-sm">{inf.engagement}%</td>
                    <td className="p-4 text-sm text-muted-foreground">{inf.city}</td>
                    <td className="p-4"><StatusBadge status={inf.status} /></td>
                    <td className="p-4"><div className="flex gap-1">
                      <button onClick={() => setDetail(inf)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-info/10 text-info transition-colors"><MessageSquare className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDialog({ type: "suspend", name: inf.name })} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Ban className="w-4 h-4" /></button>
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
                  <p className="text-sm text-muted-foreground">{detail.handle} • {detail.city}</p>
                  <StatusBadge status={detail.status} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 text-center"><div className="text-lg font-bold">{(detail.followers / 1000).toFixed(0)}K</div><div className="text-xs text-muted-foreground">{t("فالوور", "Followers")}</div></div>
                <div className="p-3 rounded-xl bg-muted/30 text-center"><div className="text-lg font-bold">{detail.engagement}%</div><div className="text-xs text-muted-foreground">{t("تعامل", "Engagement")}</div></div>
                <div className="p-3 rounded-xl bg-muted/30 text-center"><div className="text-lg font-bold">{detail.campaigns}</div><div className="text-xs text-muted-foreground">{t("کمپین", "Campaigns")}</div></div>
                <div className="p-3 rounded-xl bg-muted/30 text-center"><div className="text-lg font-bold">{detail.reviews}</div><div className="text-xs text-muted-foreground">{t("ریویو", "Reviews")}</div></div>
              </div>
              <div className="p-4 rounded-xl bg-muted/20">
                <h4 className="text-sm font-semibold mb-2">{t("اطلاعات", "Details")}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">{t("دسته‌بندی", "Category")}:</span> {detail.category}</div>
                  <div><span className="text-muted-foreground">{t("جنسیت", "Gender")}:</span> {detail.gender === "female" ? t("زن", "Female") : t("مرد", "Male")}</div>
                  <div><span className="text-muted-foreground">{t("سن", "Age")}:</span> {detail.age}</div>
                  <div><span className="text-muted-foreground">{t("رزرو", "Bookings")}:</span> {detail.bookings}</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/20">
                <h4 className="text-sm font-semibold mb-2">{t("یادداشت‌های ادمین", "Admin Notes")}</h4>
                <textarea className="w-full h-20 bg-muted/30 border border-border/50 rounded-xl p-3 text-sm resize-none outline-none" placeholder={t("یادداشت بنویسید...", "Write a note...")} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => { toast.success(t("پیام ارسال شد", "Message sent")); }} variant="outline" className="gap-2 rounded-xl"><MessageSquare className="w-4 h-4" />{t("پیام", "Message")}</Button>
                <Button onClick={() => handleAction("verify", detail.name)} className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0"><CheckCircle className="w-4 h-4" />{detail.verified ? t("لغو تأیید", "Unverify") : t("تأیید", "Verify")}</Button>
                <Button onClick={() => handleAction("feature", detail.name)} variant="outline" className="gap-2 rounded-xl"><Star className="w-4 h-4" />{t("ویژه", "Feature")}</Button>
                <Button onClick={() => setConfirmDialog({ type: "suspend", name: detail.name })} variant="destructive" className="gap-2 rounded-xl"><Ban className="w-4 h-4" />{t("تعلیق", "Suspend")}</Button>
                <Button onClick={() => setConfirmDialog({ type: "delete", name: detail.name })} variant="ghost" className="gap-2 rounded-xl text-destructive"><Trash2 className="w-4 h-4" />{t("حذف", "Delete")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle>{t("تأیید عملیات", "Confirm Action")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t(`آیا مطمئن هستید که می‌خواهید ${confirmDialog?.name} را ${confirmDialog?.type} کنید؟`, `Are you sure you want to ${confirmDialog?.type} ${confirmDialog?.name}?`)}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmDialog(null)}>{t("انصراف", "Cancel")}</Button>
            <Button variant="destructive" onClick={() => handleAction(confirmDialog!.type, confirmDialog!.name)}>{t("تأیید", "Confirm")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default InfluencersPage;
