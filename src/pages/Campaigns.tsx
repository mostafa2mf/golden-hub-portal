import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Pause, Edit, Plus, XCircle, Image as ImageIcon, Upload, Download, X, Send } from "lucide-react";
import { exportToCSV } from "@/utils/csvExport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SendCampaignModal } from "@/components/admin/SendCampaignModal";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const CampaignsPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [detail, setDetail] = useState<any>(null);
  const [addModal, setAddModal] = useState(false);
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [sendCampaign, setSendCampaign] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const statuses = ["active", "pending", "scheduled", "completed", "rejected"];

  const [addForm, setAddForm] = useState({
    title: "",
    business_id: "",
    custom_business: "",
    category_id: "",
    city: "",
    address: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*, businesses(name, logo_url), categories(name, name_fa), campaign_influencers(id)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Show ALL businesses (not just active) so admin can pick pending ones too
  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses-list-all"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-list"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name, name_fa").order("name");
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

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 3 - imageFiles.length;
    const accepted = files.slice(0, remaining);
    const newFiles = [...imageFiles, ...accepted];
    setImageFiles(newFiles);
    accepted.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!imageFiles.length) return [];
    setUploadingImages(true);
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("campaigns").upload(fileName, file);
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data: pub } = supabase.storage.from("campaigns").getPublicUrl(fileName);
      urls.push(pub.publicUrl);
    }
    setUploadingImages(false);
    return urls;
  };

  const ensureBusiness = async (): Promise<string | null> => {
    if (addForm.business_id && addForm.business_id !== "__other__") {
      return addForm.business_id;
    }
    // Custom business -> create as pending
    if (!addForm.custom_business.trim()) {
      toast.error(t("نام کسب‌وکار را وارد کنید", "Enter business name"));
      return null;
    }
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        name: addForm.custom_business.trim(),
        category_id: addForm.category_id || null,
        city: addForm.city || null,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message);
      return null;
    }
    return data.id;
  };

  const handleAdd = async () => {
    if (!addForm.title.trim()) {
      toast.error(t("عنوان کمپین الزامی است", "Title is required"));
      return;
    }

    const businessId = await ensureBusiness();
    if (!businessId) return;

    const images = await uploadImages();

    const { error } = await supabase.from("campaigns").insert({
      title: addForm.title,
      business_id: businessId,
      category_id: addForm.category_id || null,
      city: addForm.city || null,
      address: addForm.address || null,
      description: addForm.description || null,
      start_date: addForm.start_date || null,
      end_date: addForm.end_date || null,
      images,
      status: "active",
    });

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("کمپین فعال شد", "Campaign activated"));
    setAddModal(false);
    setAddForm({ title: "", business_id: "", custom_business: "", category_id: "", city: "", address: "", description: "", start_date: "", end_date: "" });
    setImagePreviews([]);
    setImageFiles([]);
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["businesses-list-all"] });
  };

  if (isLoading) return <AdminLayout title={t("کمپین‌ها", "Campaigns")}><div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;

  const isCustomBusiness = addForm.business_id === "__other__";
  const coverImage = (camp: any) => (camp.images?.[0]) || camp.businesses?.logo_url;

  return (
    <AdminLayout title={t("کمپین‌ها", "Campaigns")}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-semibold">{t("مدیریت کمپین‌ها", "Campaign Management")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border/50" onClick={() => exportToCSV(campaigns, "campaigns", [
            { key: "title", label: "Title" }, { key: "status", label: "Status" },
            { key: "city", label: "City" }, { key: "start_date", label: "Start" }, { key: "end_date", label: "End" },
          ])}>
            <Download className="w-4 h-4" />{t("خروجی CSV", "Export CSV")}
          </Button>
          <Button onClick={() => setAddModal(true)} className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0">
            <Plus className="w-4 h-4" />{t("افزودن کمپین", "Add Campaign")}
          </Button>
        </div>
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
                <div key={camp.id} className="glass-card overflow-hidden hover-glow cursor-pointer transition-all hover:scale-[1.02] group" onClick={() => setDetail(camp)}>
                  <div className="h-36 bg-gradient-to-br from-primary/10 via-primary/5 to-card relative flex items-center justify-center">
                    {coverImage(camp) ? (
                      <img src={coverImage(camp)} alt={camp.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground/30">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 end-3"><StatusBadge status={camp.status} /></div>
                    {camp.images?.length > 1 && (
                      <div className="absolute top-3 start-3 px-2 py-0.5 rounded-md bg-background/70 backdrop-blur text-[10px] font-medium">+{camp.images.length - 1}</div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-card to-transparent" />
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-0.5">{camp.title}</h3>
                    <p className="text-xs text-muted-foreground">{camp.businesses?.name || "-"}</p>

                    <div className="space-y-1.5 mt-3 text-xs text-muted-foreground">
                      <div className="flex justify-between"><span>{t("دسته‌بندی", "Category")}</span><span className="text-foreground">{camp.categories?.name_fa || camp.categories?.name || "-"}</span></div>
                      <div className="flex justify-between"><span>{t("شهر", "City")}</span><span className="text-foreground">{camp.city || "-"}</span></div>
                      <div className="flex justify-between"><span>{t("تاریخ شروع", "Start")}</span><span className="text-foreground">{camp.start_date || "-"}</span></div>
                      <div className="flex justify-between"><span>{t("اینفلوئنسر", "Influencers")}</span><span className="text-foreground">{camp.campaign_influencers?.length || 0}</span></div>
                    </div>
                    {camp.performance > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{t("عملکرد", "Performance")}</span><span className="font-medium">{camp.performance}%</span></div>
                        <div className="h-1.5 bg-muted/50 rounded-full"><div className="h-full rounded-full gold-gradient" style={{ width: `${camp.performance}%` }} /></div>
                      </div>
                    )}
                    {camp.status === "active" && (
                      <Button variant="outline" size="sm" className="mt-3 w-full rounded-xl gap-2 border-primary/40 text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); setSendCampaign(camp); }}>
                        <Send className="w-4 h-4" />{t("ارسال به بلاگر", "Send to Bloggers")}
                      </Button>
                    )}
                    {(camp.status === "active" || camp.status === "pending" || camp.status === "scheduled") && (
                      <Button variant="ghost" size="sm" className="mt-2 w-full text-destructive hover:bg-destructive/10 rounded-xl gap-2" onClick={(e) => { e.stopPropagation(); setCancelModal(camp.id); }}>
                        <XCircle className="w-4 h-4" />{t("لغو کمپین", "Cancel Campaign")}
                      </Button>
                    )}
                  </div>
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
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{detail?.title}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              {detail.images?.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {detail.images.map((url: string, i: number) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted/30">
                      <img src={url} alt={`${detail.title} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : detail.businesses?.logo_url && (
                <div className="rounded-xl overflow-hidden h-40">
                  <img src={detail.businesses.logo_url} alt={detail.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2"><StatusBadge status={detail.status} /><span className="text-sm text-muted-foreground">{detail.businesses?.name || "-"}</span></div>
              {detail.description && (
                <div className="bg-muted/20 rounded-xl p-3">
                  <span className="text-xs text-muted-foreground block mb-1">{t("توضیحات آفر", "Offer Description")}</span>
                  <p className="text-sm text-foreground/80">{detail.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("دسته‌بندی", "Category")}</span><div className="font-medium mt-1">{detail.categories?.name_fa || detail.categories?.name || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("شهر", "City")}</span><div className="font-medium mt-1">{detail.city || "-"}</div></div>
                {detail.address && (
                  <div className="p-3 rounded-xl bg-muted/30 col-span-2"><span className="text-muted-foreground">{t("آدرس", "Address")}</span><div className="font-medium mt-1">{detail.address}</div></div>
                )}
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("اینفلوئنسر", "Influencers")}</span><div className="font-medium mt-1">{detail.campaign_influencers?.length || 0}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("شروع", "Start")}</span><div className="font-medium mt-1">{detail.start_date || "-"}</div></div>
                <div className="p-3 rounded-xl bg-muted/30"><span className="text-muted-foreground">{t("پایان", "End")}</span><div className="font-medium mt-1">{detail.end_date || "-"}</div></div>
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
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("افزودن کمپین جدید", "Add New Campaign")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* 3 Images upload */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                {t("تصاویر کمپین (تا ۳ تصویر)", "Campaign Images (up to 3)")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="relative aspect-square">
                    {imagePreviews[i] ? (
                      <>
                        <img src={imagePreviews[i]} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full rounded-xl border-2 border-dashed border-border/50 bg-muted/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all text-muted-foreground"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-[10px] mt-1">{i + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagesSelect} />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("عنوان کمپین", "Campaign Title")} *</label>
              <input value={addForm.title} onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("کسب‌وکار", "Business")} *</label>
              <select value={addForm.business_id} onChange={e => setAddForm(p => ({ ...p, business_id: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50">
                <option value="">{t("انتخاب کنید", "Select...")}</option>
                {businesses.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                <option value="__other__">{t("دیگر (افزودن کسب‌وکار جدید)", "Other (add new business)")}</option>
              </select>
            </div>

            {isCustomBusiness && (
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t("نام کسب‌وکار جدید", "New Business Name")} *</label>
                <input value={addForm.custom_business} onChange={e => setAddForm(p => ({ ...p, custom_business: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" placeholder={t("مثلاً: کافه آرامش", "e.g. Cafe Aramesh")} />
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("دسته‌بندی", "Category")}</label>
              <select value={addForm.category_id} onChange={e => setAddForm(p => ({ ...p, category_id: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50">
                <option value="">{t("انتخاب کنید", "Select...")}</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name_fa || c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("شهر", "City")}</label>
              <input value={addForm.city} onChange={e => setAddForm(p => ({ ...p, city: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("آدرس", "Address")}</label>
              <input value={addForm.address} onChange={e => setAddForm(p => ({ ...p, address: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" placeholder={t("آدرس دقیق", "Full address")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t("تاریخ شروع (شمسی)", "Start Date (Jalali)")}</label>
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={addForm.start_date}
                  onChange={(d: any) => setAddForm(p => ({ ...p, start_date: d ? d.toDate().toISOString().split("T")[0] : "" }))}
                  inputClass="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50"
                  containerClassName="w-full"
                  calendarPosition="bottom-right"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t("تاریخ پایان (شمسی)", "End Date (Jalali)")}</label>
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={addForm.end_date}
                  onChange={(d: any) => setAddForm(p => ({ ...p, end_date: d ? d.toDate().toISOString().split("T")[0] : "" }))}
                  inputClass="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50"
                  containerClassName="w-full"
                  calendarPosition="bottom-right"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("توضیحات آفر", "Offer Description")}</label>
              <textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 h-20 resize-none" placeholder={t("آفری که می‌خواهید ارائه دهید...", "The offer you want to present...")} />
            </div>

            <Button disabled={uploadingImages} className="w-full rounded-xl gold-gradient text-primary-foreground border-0" onClick={handleAdd}>
              {uploadingImages ? t("در حال آپلود...", "Uploading...") : t("افزودن کمپین", "Add Campaign")}
            </Button>
          </div>
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

      {/* Send Campaign Modal */}
      {sendCampaign && (
        <SendCampaignModal
          campaign={sendCampaign}
          open={!!sendCampaign}
          onOpenChange={(v) => !v && setSendCampaign(null)}
        />
      )}
    </AdminLayout>
  );
};

export default CampaignsPage;
