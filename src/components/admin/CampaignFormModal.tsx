import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { campaignSchema, validateOrToast } from "@/lib/validations";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type Mode = "admin" | "business";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  /** Required when mode === "business" */
  businessId?: string;
  onCreated?: () => void;
}

const emptyForm = {
  title: "",
  business_id: "",
  custom_business: "",
  category_id: "",
  city: "",
  address: "",
  description: "",
  start_date: "",
  end_date: "",
};

export function CampaignFormModal({ open, onOpenChange, mode, businessId, onCreated }: Props) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open && mode === "business" && businessId) {
      setForm(p => ({ ...p, business_id: businessId }));
    }
  }, [open, mode, businessId]);

  const { data: businesses = [] } = useQuery({
    queryKey: ["campaign-form-businesses"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("id, name").order("name");
      return data || [];
    },
    enabled: mode === "admin" && open,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["campaign-form-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name, name_fa").order("name");
      return data || [];
    },
    enabled: open,
  });

  const isCustomBusiness = mode === "admin" && form.business_id === "__other__";

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 3 - imageFiles.length;
    const accepted = files.slice(0, remaining);
    setImageFiles(prev => [...prev, ...accepted]);
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
    setUploading(true);
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("campaigns").upload(fileName, file);
      if (error) { toast.error(error.message); continue; }
      const { data: pub } = supabase.storage.from("campaigns").getPublicUrl(fileName);
      urls.push(pub.publicUrl);
    }
    setUploading(false);
    return urls;
  };

  const ensureBusiness = async (): Promise<string | null> => {
    if (mode === "business") return businessId || null;
    if (form.business_id && form.business_id !== "__other__") return form.business_id;
    if (!form.custom_business.trim()) {
      toast.error(t("نام کسب‌وکار را وارد کنید", "Enter business name"));
      return null;
    }
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        name: form.custom_business.trim(),
        category_id: form.category_id || null,
        city: form.city || null,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) { toast.error(error.message); return null; }
    return data.id;
  };

  const reset = () => {
    setForm(mode === "business" && businessId ? { ...emptyForm, business_id: businessId } : emptyForm);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleSubmit = async () => {
    // For business mode we already have business_id; bypass that requirement in schema
    const payload = mode === "business" ? { ...form, business_id: businessId || "__biz__" } : form;
    const v = validateOrToast(campaignSchema, payload);
    if (!v) return;

    const bId = await ensureBusiness();
    if (!bId) return;

    const images = await uploadImages();

    const { error } = await supabase.from("campaigns").insert({
      title: form.title,
      business_id: bId,
      category_id: form.category_id || null,
      city: form.city || null,
      address: form.address || null,
      description: form.description || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      images,
      status: mode === "admin" ? "active" : "pending",
    });

    if (error) { toast.error(error.message); return; }

    toast.success(
      mode === "admin"
        ? t("کمپین فعال شد", "Campaign activated")
        : t("کمپین برای تأیید ارسال شد", "Campaign submitted for approval")
    );
    reset();
    onOpenChange(false);
    onCreated?.();
  };

  const inputCls = "w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t("افزودن کمپین جدید", "Add New Campaign")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {/* Images */}
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
                      <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-full rounded-xl border-2 border-dashed border-border/50 bg-muted/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all text-muted-foreground">
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
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputCls} />
          </div>

          {mode === "admin" && (
            <>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t("کسب‌وکار", "Business")} *</label>
                <select value={form.business_id} onChange={e => setForm(p => ({ ...p, business_id: e.target.value }))} className={inputCls}>
                  <option value="">{t("انتخاب کنید", "Select...")}</option>
                  {businesses.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  <option value="__other__">{t("دیگر (افزودن کسب‌وکار جدید)", "Other (add new business)")}</option>
                </select>
              </div>
              {isCustomBusiness && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{t("نام کسب‌وکار جدید", "New Business Name")} *</label>
                  <input value={form.custom_business} onChange={e => setForm(p => ({ ...p, custom_business: e.target.value }))} className={inputCls} placeholder={t("مثلاً: کافه آرامش", "e.g. Cafe Aramesh")} />
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{t("دسته‌بندی", "Category")}</label>
            <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className={inputCls}>
              <option value="">{t("انتخاب کنید", "Select...")}</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name_fa || c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{t("شهر", "City")}</label>
            <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={inputCls} />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{t("آدرس", "Address")}</label>
            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className={inputCls} placeholder={t("آدرس دقیق", "Full address")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("تاریخ شروع (شمسی)", "Start Date (Jalali)")}</label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={form.start_date}
                onChange={(d: any) => setForm(p => ({ ...p, start_date: d ? d.toDate().toISOString().split("T")[0] : "" }))}
                inputClass={inputCls}
                containerClassName="w-full"
                calendarPosition="bottom-right"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("تاریخ پایان (شمسی)", "End Date (Jalali)")}</label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={form.end_date}
                onChange={(d: any) => setForm(p => ({ ...p, end_date: d ? d.toDate().toISOString().split("T")[0] : "" }))}
                inputClass={inputCls}
                containerClassName="w-full"
                calendarPosition="bottom-right"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{t("توضیحات آفر", "Offer Description")}</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={`${inputCls} h-20 resize-none`} placeholder={t("آفری که می‌خواهید ارائه دهید...", "The offer you want to present...")} />
          </div>

          <Button disabled={uploading} className="w-full rounded-xl gold-gradient text-primary-foreground border-0" onClick={handleSubmit}>
            {uploading ? t("در حال آپلود...", "Uploading...") : t("افزودن کمپین", "Add Campaign")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
