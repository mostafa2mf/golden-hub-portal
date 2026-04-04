import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Palette, Bell, Globe, CheckCircle, MessageSquare, Star, MapPin, Plug, Database } from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { t } = useLanguage();

  const SettingToggle = ({ label, defaultChecked = true }: { label: string; defaultChecked?: boolean }) => (
    <label className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="w-4 h-4 accent-primary" />
    </label>
  );

  const SettingInput = ({ label, placeholder, defaultValue = "" }: { label: string; placeholder: string; defaultValue?: string }) => (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      <input defaultValue={defaultValue} placeholder={placeholder} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors" />
    </div>
  );

  return (
    <AdminLayout title={t("تنظیمات", "Settings")}>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-muted/50 rounded-xl p-1 flex-wrap">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("عمومی", "General")}</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("برندینگ", "Branding")}</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("اعلان‌ها", "Notifications")}</TabsTrigger>
          <TabsTrigger value="workflow" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("فرایندها", "Workflow")}</TabsTrigger>
          <TabsTrigger value="data" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("داده‌ها", "Data")}</TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("یکپارچه‌سازی", "Integrations")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><SettingsIcon className="w-4 h-4 text-primary" />{t("تنظیمات عمومی", "General Settings")}</h3>
            <SettingInput label={t("نام پلتفرم", "Platform Name")} placeholder="Bloggerha" defaultValue="Bloggerha" />
            <SettingInput label={t("ایمیل پشتیبانی", "Support Email")} placeholder="support@bloggerha.com" defaultValue="support@bloggerha.com" />
            <SettingInput label={t("شماره تماس", "Phone")} placeholder="+98 21 XXXXXXXX" />
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("زبان پیش‌فرض", "Default Language")}</label>
              <select className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none">
                <option>فارسی</option>
                <option>English</option>
              </select>
            </div>
            <Button className="rounded-xl gold-gradient text-primary-foreground border-0" onClick={() => toast.success(t("ذخیره شد", "Saved"))}>{t("ذخیره تغییرات", "Save Changes")}</Button>
          </div>
        </TabsContent>

        <TabsContent value="branding">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Palette className="w-4 h-4 text-primary" />{t("تنظیمات برندینگ", "Branding Settings")}</h3>
            <div className="p-4 rounded-xl bg-muted/30 text-center border-2 border-dashed border-border/50">
              <p className="text-sm text-muted-foreground mb-2">{t("لوگو پلتفرم", "Platform Logo")}</p>
              <Button variant="outline" className="rounded-xl">{t("آپلود لوگو", "Upload Logo")}</Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SettingInput label={t("رنگ اصلی", "Primary Color")} placeholder="#D4A843" defaultValue="#D4A843" />
              <SettingInput label={t("رنگ ثانویه", "Secondary Color")} placeholder="#1A1D23" defaultValue="#1A1D23" />
            </div>
            <Button className="rounded-xl gold-gradient text-primary-foreground border-0" onClick={() => toast.success(t("ذخیره شد", "Saved"))}>{t("ذخیره", "Save")}</Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="glass-card p-5 space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Bell className="w-4 h-4 text-primary" />{t("تنظیمات اعلان", "Notification Settings")}</h3>
            <SettingToggle label={t("اعلان ثبت‌نام جدید", "New registration notification")} />
            <SettingToggle label={t("اعلان تأیید معلق", "Pending approval notification")} />
            <SettingToggle label={t("اعلان پیام جدید", "New message notification")} />
            <SettingToggle label={t("اعلان جلسه", "Meeting notification")} />
            <SettingToggle label={t("اعلان ایمیلی", "Email notifications")} />
            <SettingToggle label={t("اعلان پوش", "Push notifications")} defaultChecked={false} />
            <Button className="rounded-xl gold-gradient text-primary-foreground border-0 mt-3" onClick={() => toast.success(t("ذخیره شد", "Saved"))}>{t("ذخیره", "Save")}</Button>
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <div className="glass-card p-5 space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><CheckCircle className="w-4 h-4 text-primary" />{t("فرایند تأیید", "Approval Workflow")}</h3>
            <SettingToggle label={t("تأیید خودکار بلاگرها", "Auto-approve bloggers")} defaultChecked={false} />
            <SettingToggle label={t("تأیید خودکار کسب‌وکارها", "Auto-approve businesses")} defaultChecked={false} />
            <SettingToggle label={t("بازبینی ریویوها قبل از انتشار", "Review moderation before publish")} />
            <SettingToggle label={t("تأیید هویت اجباری", "Mandatory identity verification")} />
            <Button className="rounded-xl gold-gradient text-primary-foreground border-0 mt-3" onClick={() => toast.success(t("ذخیره شد", "Saved"))}>{t("ذخیره", "Save")}</Button>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{t("داده‌های پایه", "Master Data")}</h3>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">{t("شهرها", "Cities")}</label>
              <div className="flex flex-wrap gap-2">
                {["تهران", "اصفهان", "شیراز", "مشهد", "تبریز", "کرج"].map(c => (
                  <span key={c} className="px-3 py-1 rounded-full bg-muted/50 text-sm">{c}</span>
                ))}
                <button className="px-3 py-1 rounded-full border border-dashed border-primary/50 text-primary text-sm hover:bg-primary/10 transition-colors">+ {t("افزودن", "Add")}</button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">{t("دسته‌بندی‌ها", "Categories")}</label>
              <div className="flex flex-wrap gap-2">
                {["Food", "Cafe", "Restaurant", "Hotel", "Beauty", "Fashion", "Product", "Art", "Sport"].map(c => (
                  <span key={c} className="px-3 py-1 rounded-full bg-muted/50 text-sm">{c}</span>
                ))}
                <button className="px-3 py-1 rounded-full border border-dashed border-primary/50 text-primary text-sm hover:bg-primary/10 transition-colors">+ {t("افزودن", "Add")}</button>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="rounded-xl gap-2" onClick={() => toast.success(t("بکاپ ایجاد شد", "Backup created"))}><Database className="w-4 h-4" />{t("بکاپ‌گیری", "Backup")}</Button>
              <Button variant="outline" className="rounded-xl gap-2" onClick={() => toast.success(t("خروجی آماده", "Export ready"))}>{t("خروجی کامل", "Full Export")}</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Plug className="w-4 h-4 text-primary" />{t("یکپارچه‌سازی‌ها", "Integrations")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Instagram API", status: t("متصل", "Connected"), connected: true },
                { name: "SMS Gateway", status: t("پیکربندی نشده", "Not configured"), connected: false },
                { name: "Payment Gateway", status: t("به زودی", "Coming soon"), connected: false },
                { name: "Analytics", status: t("فعال", "Active"), connected: true },
              ].map((int, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div>
                    <div className="text-sm font-medium">{int.name}</div>
                    <div className={`text-xs ${int.connected ? "text-success" : "text-muted-foreground"}`}>{int.status}</div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toast.info(t("به زودی", "Coming soon"))}>
                    {int.connected ? t("تنظیمات", "Settings") : t("اتصال", "Connect")}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default SettingsPage;
