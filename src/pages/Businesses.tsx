import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { demoBusinesses } from "@/data/demoData";
import { Search, Eye, Edit, Ban, MessageSquare, CheckCircle, Star, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BusinessesPage = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<typeof demoBusinesses[0] | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ type: string; name: string } | null>(null);

  const filtered = demoBusinesses.filter(b => !search || b.name.includes(search) || b.category.includes(search));

  return (
    <AdminLayout title={t("کسب‌وکارها", "Businesses")}>
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-muted/50 rounded-xl border border-border/50 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground mx-3" />
            <input placeholder={t("جستجو...", "Search...")} value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm py-2.5 pe-3 w-full" />
          </div>
          <Button onClick={() => setAddModal(true)} className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0">
            <Plus className="w-4 h-4" />{t("افزودن کسب‌وکار", "Add Business")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(biz => (
          <div key={biz.id} className="glass-card p-5 hover-glow cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setDetail(biz)}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">{biz.name.charAt(0)}</div>
              <div className="flex items-center gap-1">
                {biz.verified && <CheckCircle className="w-4 h-4 text-primary" />}
                <StatusBadge status={biz.status} />
              </div>
            </div>
            <h3 className="font-semibold mb-0.5">{biz.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{biz.category} • {biz.city}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold">{biz.activeCampaigns}</div><div className="text-[10px] text-muted-foreground">{t("کمپین", "Campaigns")}</div></div>
              <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold">{biz.completedCollabs}</div><div className="text-[10px] text-muted-foreground">{t("همکاری", "Collabs")}</div></div>
              <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold flex items-center justify-center gap-0.5"><Star className="w-3 h-3 text-primary" />{biz.rating}</div><div className="text-[10px] text-muted-foreground">{t("امتیاز", "Rating")}</div></div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("جزئیات کسب‌وکار", "Business Details")}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">{detail.name.charAt(0)}</div>
                <div>
                  <div className="flex items-center gap-2"><h2 className="text-xl font-bold">{detail.name}</h2>{detail.verified && <CheckCircle className="w-5 h-5 text-primary" />}</div>
                  <p className="text-sm text-muted-foreground">{detail.category} • {detail.city}</p>
                  <StatusBadge status={detail.status} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("آدرس", "Address")}</span><div className="font-medium mt-1">{detail.address}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("تماس", "Contact")}</span><div className="font-medium mt-1">{detail.contact}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("کمپین فعال", "Active Campaigns")}</span><div className="font-medium mt-1">{detail.activeCampaigns}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("همکاری تکمیل‌شده", "Completed")}</span><div className="font-medium mt-1">{detail.completedCollabs}</div></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2 rounded-xl"><MessageSquare className="w-4 h-4" />{t("پیام", "Message")}</Button>
                <Button variant="outline" className="gap-2 rounded-xl"><Edit className="w-4 h-4" />{t("ویرایش", "Edit")}</Button>
                <Button className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0"><CheckCircle className="w-4 h-4" />{t("تأیید", "Verify")}</Button>
                <Button variant="destructive" className="gap-2 rounded-xl" onClick={() => { setDetail(null); setConfirmDialog({ type: "deactivate", name: detail.name }); }}><Ban className="w-4 h-4" />{t("غیرفعال", "Deactivate")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Business Modal */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent className="bg-card border-border/50 rounded-2xl">
          <DialogHeader><DialogTitle>{t("افزودن کسب‌وکار", "Add Business")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("نام کسب‌وکار", "Business Name")}</label><input className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-muted-foreground mb-1 block">{t("دسته‌بندی", "Category")}</label>
                <select className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none">
                  <option>Cafe</option><option>Restaurant</option><option>Hotel</option><option>Beauty</option><option>Sport</option><option>Art</option>
                </select>
              </div>
              <div><label className="text-sm text-muted-foreground mb-1 block">{t("شهر", "City")}</label><input className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            </div>
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("شخص تماس", "Contact Person")}</label><input className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("تلفن", "Phone")}</label><input className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <Button className="w-full rounded-xl gold-gradient text-primary-foreground border-0" onClick={() => { toast.success(t("کسب‌وکار اضافه شد", "Business added")); setAddModal(false); }}>{t("افزودن", "Add")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle>{t("تأیید عملیات", "Confirm Action")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t(`آیا مطمئن هستید که می‌خواهید ${confirmDialog?.name} را غیرفعال کنید؟`, `Are you sure you want to deactivate ${confirmDialog?.name}?`)}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmDialog(null)}>{t("انصراف", "Cancel")}</Button>
            <Button variant="destructive" onClick={() => { toast.success(t("غیرفعال شد", "Deactivated")); setConfirmDialog(null); }}>{t("غیرفعال", "Deactivate")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default BusinessesPage;
