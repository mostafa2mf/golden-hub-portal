import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, Edit, Ban, MessageSquare, CheckCircle, Star, Plus, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BusinessesPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<any>(null);
  const [addModal, setAddModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ type: string; id: string; name: string } | null>(null);
  const [addForm, setAddForm] = useState({ name: "", category: "Cafe", city: "", contact: "", phone: "", email: "", description: "", username: "", password: "", keyword: "" });

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*, categories(name, name_fa)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  useRealtimeInvalidation("businesses", ["businesses"]);

  const filtered = businesses.filter((b: any) => !search || b.name.includes(search) || (b.categories?.name || "").includes(search));

  const handleAdd = async () => {
    if (!addForm.name.trim()) { toast.error(t("نام الزامی است", "Name is required")); return; }
    const { data: inserted, error } = await supabase.from("businesses").insert({
      name: addForm.name,
      city: addForm.city || null,
      contact_name: addForm.contact || null,
      phone: addForm.phone || null,
      email: addForm.email || null,
      description: addForm.description || null,
      status: "pending",
    }).select().single();
    if (error) { toast.error(error.message); return; }
    // Save credentials if username provided
    if (addForm.username.trim() && addForm.password.trim() && inserted) {
      await supabase.from("user_credentials").insert({
        entity_type: "business" as any,
        entity_id: inserted.id,
        username: addForm.username.trim(),
        password: addForm.password.trim(),
        keyword: addForm.keyword.trim() || null,
      });
    }
    toast.success(t("کسب‌وکار اضافه شد", "Business added"));
    setAddModal(false);
    setAddForm({ name: "", category: "Cafe", city: "", contact: "", phone: "", email: "", description: "", username: "", password: "", keyword: "" });
    queryClient.invalidateQueries({ queryKey: ["businesses"] });
    queryClient.invalidateQueries({ queryKey: ["user-credentials"] });
  };

  if (isLoading) return <AdminLayout title={t("کسب‌وکارها", "Businesses")}><div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;

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

      {filtered.length === 0 && <div className="glass-card p-12 text-center text-muted-foreground"><p className="text-sm">{t("کسب‌وکاری یافت نشد", "No businesses found")}</p></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((biz: any) => (
          <div key={biz.id} className="glass-card overflow-hidden hover-glow cursor-pointer transition-all hover:scale-[1.02] group" onClick={() => setDetail(biz)}>
            {/* Image header */}
            <div className="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-card relative flex items-center justify-center">
              {biz.logo_url ? (
                <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">{biz.name.charAt(0)}</div>
              )}
              <div className="absolute top-2 end-2 flex items-center gap-1">
                {biz.verified && <CheckCircle className="w-4 h-4 text-primary" />}
                <StatusBadge status={biz.status} />
              </div>
              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-0.5">{biz.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{biz.categories?.name_fa || biz.categories?.name || "-"} • {biz.city || "-"}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold">{biz.active_campaigns}</div><div className="text-[10px] text-muted-foreground">{t("کمپین", "Campaigns")}</div></div>
                <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold">{biz.completed_collabs}</div><div className="text-[10px] text-muted-foreground">{t("همکاری", "Collabs")}</div></div>
                <div className="p-2 rounded-lg bg-muted/30"><div className="text-sm font-bold flex items-center justify-center gap-0.5"><Star className="w-3 h-3 text-primary" />{biz.rating || 0}</div><div className="text-[10px] text-muted-foreground">{t("امتیاز", "Rating")}</div></div>
              </div>
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
                {detail.logo_url ? (
                  <img src={detail.logo_url} alt={detail.name} className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">{detail.name.charAt(0)}</div>
                )}
                <div>
                  <div className="flex items-center gap-2"><h2 className="text-xl font-bold">{detail.name}</h2>{detail.verified && <CheckCircle className="w-5 h-5 text-primary" />}</div>
                  <p className="text-sm text-muted-foreground">{detail.categories?.name_fa || detail.categories?.name || "-"} • {detail.city || "-"}</p>
                  <StatusBadge status={detail.status} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("آدرس", "Address")}</span><div className="font-medium mt-1">{detail.address || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("تماس", "Contact")}</span><div className="font-medium mt-1">{detail.contact_name || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("تلفن", "Phone")}</span><div className="font-medium mt-1">{detail.phone || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("ایمیل", "Email")}</span><div className="font-medium mt-1">{detail.email || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("کمپین فعال", "Active Campaigns")}</span><div className="font-medium mt-1">{detail.active_campaigns}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("همکاری تکمیل‌شده", "Completed")}</span><div className="font-medium mt-1">{detail.completed_collabs}</div></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2 rounded-xl"><MessageSquare className="w-4 h-4" />{t("پیام", "Message")}</Button>
                <Button variant="outline" className="gap-2 rounded-xl"><Edit className="w-4 h-4" />{t("ویرایش", "Edit")}</Button>
                <Button className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0"><CheckCircle className="w-4 h-4" />{t("تأیید", "Verify")}</Button>
                <Button variant="destructive" className="gap-2 rounded-xl" onClick={() => { setDetail(null); setConfirmDialog({ type: "deactivate", id: detail.id, name: detail.name }); }}><Ban className="w-4 h-4" />{t("غیرفعال", "Deactivate")}</Button>
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
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("نام کسب‌وکار", "Business Name")} *</label><input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-muted-foreground mb-1 block">{t("شهر", "City")}</label><input value={addForm.city} onChange={e => setAddForm(p => ({ ...p, city: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">{t("شخص تماس", "Contact Person")}</label><input value={addForm.contact} onChange={e => setAddForm(p => ({ ...p, contact: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-muted-foreground mb-1 block">{t("تلفن", "Phone")} <span className="text-muted-foreground/60 text-xs">({t("اختیاری", "Optional")})</span></label><input value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
              <div><label className="text-sm text-muted-foreground mb-1 block">{t("ایمیل", "Email")} <span className="text-muted-foreground/60 text-xs">({t("اختیاری", "Optional")})</span></label><input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            </div>
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("توضیحات آفر", "Offer Description")} <span className="text-muted-foreground/60 text-xs">({t("اختیاری", "Optional")})</span></label><textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 h-20 resize-none" placeholder={t("آفری که می‌خواهید ارائه دهید...", "The offer you want to present...")} /></div>
            <div className="border-t border-border/30 pt-4 mt-2">
              <p className="text-xs font-semibold text-primary mb-3">{t("اطلاعات ورود (اختیاری)", "Login Credentials (Optional)")}</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm text-muted-foreground mb-1 block">{t("نام کاربری", "Username")}</label><input value={addForm.username} onChange={e => setAddForm(p => ({ ...p, username: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" dir="ltr" /></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">{t("رمز عبور", "Password")}</label><input value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" dir="ltr" /></div>
              </div>
              <div className="mt-3"><label className="text-sm text-muted-foreground mb-1 block">{t("کلمه کلیدی", "Keyword")} <span className="text-muted-foreground/60 text-xs">({t("برای بازیابی رمز", "For password recovery")})</span></label><input value={addForm.keyword} onChange={e => setAddForm(p => ({ ...p, keyword: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            </div>
            <Button className="w-full rounded-xl gold-gradient text-primary-foreground border-0" onClick={handleAdd}>{t("افزودن", "Add")}</Button>
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
            <Button variant="destructive" onClick={async () => { if (confirmDialog) { await supabase.from("businesses").update({ status: "suspended" }).eq("id", confirmDialog.id); queryClient.invalidateQueries({ queryKey: ["businesses"] }); toast.success(t("غیرفعال شد", "Deactivated")); setConfirmDialog(null); } }}>{t("غیرفعال", "Deactivate")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default BusinessesPage;