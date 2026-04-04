import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, Monitor, Lock, Users, FileText, AlertTriangle, LogOut, Search } from "lucide-react";
import { toast } from "sonner";

const sessions = [
  { device: "Chrome on MacOS", ip: "192.168.1.XX", location: "تهران", time: "فعال الان", current: true },
  { device: "Safari on iPhone", ip: "10.0.0.XX", location: "تهران", time: "۲ ساعت پیش", current: false },
  { device: "Firefox on Windows", ip: "172.16.0.XX", location: "اصفهان", time: "۱ روز پیش", current: false },
];

const auditLogs = [
  { user: "ادمین اصلی", action: "تأیید پروفایل", target: "سارا احمدی", time: "۱۰:۳۰", type: "approval" },
  { user: "زهرا مدیری", action: "ویرایش کمپین", target: "کافه لاوندر", time: "۰۹:۱۵", type: "edit" },
  { user: "حسین ناظری", action: "مسدود کردن کاربر", target: "محمد صادقی", time: "دیروز", type: "block" },
  { user: "ادمین اصلی", action: "تغییر تنظیمات", target: "سیستم", time: "دیروز", type: "settings" },
  { user: "مینا پشتیبان", action: "پاسخ به پیام", target: "هتل پارسیان", time: "۲ روز پیش", type: "message" },
];

const blockedUsers = [
  { name: "محمد صادقی", reason: "نقض قوانین پلتفرم", date: "۱۴۰۵/۰۱/۱۲" },
  { name: "کاربر تست", reason: "حساب جعلی", date: "۱۴۰۵/۰۱/۱۰" },
];

const SecurityPage = () => {
  const { t } = useLanguage();
  const [auditSearch, setAuditSearch] = useState("");

  return (
    <AdminLayout title={t("امنیت", "Security")}>
      <Tabs defaultValue="access" className="space-y-4">
        <TabsList className="bg-muted/50 rounded-xl p-1 flex-wrap">
          <TabsTrigger value="access" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("کنترل دسترسی", "Access Control")}</TabsTrigger>
          <TabsTrigger value="protection" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("حفاظت حساب", "Account Protection")}</TabsTrigger>
          <TabsTrigger value="moderation" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("مدیریت محتوا", "Moderation")}</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("گزارش‌ها", "Audit Logs")}</TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Monitor className="w-4 h-4 text-primary" />{t("جلسات فعال", "Active Sessions")}</h3>
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">{s.device}{s.current && <span className="px-1.5 py-0.5 rounded bg-success/10 text-success text-[10px]">{t("فعلی", "Current")}</span>}</div>
                    <div className="text-xs text-muted-foreground">{s.ip} • {s.location} • {s.time}</div>
                  </div>
                  {!s.current && <Button variant="ghost" size="sm" className="text-destructive rounded-lg" onClick={() => toast.success(t("جلسه خارج شد", "Session terminated"))}><LogOut className="w-4 h-4" /></Button>}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="protection">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-primary" />{t("سیاست رمز عبور", "Password Policy")}</h3>
              <div className="space-y-3 text-sm">
                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30"><span>{t("حداقل ۸ کاراکتر", "Min 8 characters")}</span><input type="checkbox" defaultChecked className="accent-primary" /></label>
                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30"><span>{t("شامل حروف بزرگ", "Uppercase required")}</span><input type="checkbox" defaultChecked className="accent-primary" /></label>
                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30"><span>{t("شامل عدد", "Number required")}</span><input type="checkbox" defaultChecked className="accent-primary" /></label>
                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30"><span>{t("شامل کاراکتر خاص", "Special char required")}</span><input type="checkbox" className="accent-primary" /></label>
              </div>
              <Button className="w-full mt-4 rounded-xl gold-gradient text-primary-foreground border-0" onClick={() => toast.success(t("ذخیره شد", "Saved"))}>{t("ذخیره", "Save")}</Button>
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />{t("احراز هویت دو مرحله‌ای", "Two-Factor Auth")}</h3>
              <div className="p-4 rounded-xl bg-muted/30 text-center">
                <AlertTriangle className="w-10 h-10 text-warning mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t("2FA فعال نیست", "2FA is not enabled")}</p>
                <Button className="mt-3 rounded-xl" variant="outline" onClick={() => toast.info(t("به زودی", "Coming soon"))}>{t("فعال‌سازی", "Enable")}</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="moderation">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{t("کاربران مسدود شده", "Blocked Users")}</h3>
            <div className="space-y-3">
              {blockedUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div>
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.reason} • {u.date}</div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toast.success(t("رفع مسدودی", "Unblocked"))}>{t("رفع مسدودی", "Unblock")}</Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />{t("لاگ‌های بازرسی", "Audit Logs")}</h3>
              <div className="flex items-center bg-muted/50 rounded-xl border border-border/50 w-48">
                <Search className="w-4 h-4 text-muted-foreground mx-2" />
                <input placeholder={t("جستجو...", "Search...")} value={auditSearch} onChange={e => setAuditSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm py-2 pe-3 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              {auditLogs.filter(l => !auditSearch || l.user.includes(auditSearch) || l.action.includes(auditSearch) || l.target.includes(auditSearch)).map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{log.user.charAt(0)}</div>
                    <div>
                      <div className="text-sm"><span className="font-medium">{log.user}</span> <span className="text-muted-foreground">{log.action}</span> <span className="font-medium">{log.target}</span></div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default SecurityPage;
