import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { demoStaff } from "@/data/demoData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Monitor, Lock, Users, FileText, AlertTriangle, LogOut, Search, UserPlus, Edit, ToggleLeft, ToggleRight, Key } from "lucide-react";
import { toast } from "sonner";

const roles = ["Super Admin", "Admin", "Moderator", "Support Agent", "Reviewer", "Operations Staff"];
const permissions = [
  { key: "dashboard", labelFa: "مشاهده داشبورد", labelEn: "Dashboard View" },
  { key: "approvals", labelFa: "تأییدیه‌ها", labelEn: "Approvals" },
  { key: "messages", labelFa: "پیام‌ها", labelEn: "Messages" },
  { key: "users", labelFa: "مدیریت کاربران", labelEn: "User Management" },
  { key: "campaigns", labelFa: "مدیریت کمپین", labelEn: "Campaign Management" },
  { key: "security", labelFa: "کنترل امنیت", labelEn: "Security Controls" },
  { key: "export", labelFa: "خروجی داده", labelEn: "Export Data" },
  { key: "settings", labelFa: "دسترسی تنظیمات", labelEn: "Settings Access" },
];

const rolePermissions: Record<string, string[]> = {
  "Super Admin": permissions.map(p => p.key),
  "Admin": ["dashboard", "approvals", "messages", "users", "campaigns", "export", "settings"],
  "Moderator": ["dashboard", "approvals", "messages", "users"],
  "Support Agent": ["dashboard", "messages"],
  "Reviewer": ["dashboard", "approvals"],
  "Operations Staff": ["dashboard", "campaigns", "export"],
};

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
  const [inviteModal, setInviteModal] = useState(false);
  const [roleModal, setRoleModal] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [passwordModal, setPasswordModal] = useState(false);

  return (
    <AdminLayout title={t("امنیت و کارکنان", "Security & Staff")}>
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList className="bg-muted/50 rounded-xl p-1 flex-wrap">
          <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("کارکنان و نقش‌ها", "Staff & Roles")}</TabsTrigger>
          <TabsTrigger value="access" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("کنترل دسترسی", "Access Control")}</TabsTrigger>
          <TabsTrigger value="protection" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("حفاظت حساب", "Account Protection")}</TabsTrigger>
          <TabsTrigger value="moderation" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("مدیریت محتوا", "Moderation")}</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("گزارش‌ها", "Audit Logs")}</TabsTrigger>
        </TabsList>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold">{t("لیست کارکنان", "Staff List")}</h3>
            <Button onClick={() => setInviteModal(true)} className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0"><UserPlus className="w-4 h-4" />{t("دعوت کارمند", "Invite Staff")}</Button>
          </div>
          <div className="glass-card overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border/50">
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("نام", "Name")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("ایمیل", "Email")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("نقش", "Role")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("وضعیت", "Status")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("آخرین ورود", "Last Login")}</th>
                  <th className="text-start p-4 text-xs font-medium text-muted-foreground">{t("عملیات", "Actions")}</th>
                </tr></thead>
                <tbody>
                  {demoStaff.map(s => (
                    <tr key={s.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{s.name.charAt(0)}</div><span className="text-sm font-medium">{s.name}</span></div></td>
                      <td className="p-4 text-sm text-muted-foreground">{s.email}</td>
                      <td className="p-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{s.role}</span></td>
                      <td className="p-4"><StatusBadge status={s.status} /></td>
                      <td className="p-4 text-xs text-muted-foreground">{s.lastLogin}</td>
                      <td className="p-4"><div className="flex gap-1">
                        <button onClick={() => setRoleModal(s.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => toast.success(t("وضعیت تغییر کرد", "Status toggled"))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">{s.status === "active" ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permission Matrix */}
          <h3 className="text-sm font-semibold mb-4">{t("ماتریس دسترسی‌ها", "Permission Matrix")}</h3>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border/50">
                  <th className="text-start p-3 text-xs font-medium text-muted-foreground">{t("دسترسی", "Permission")}</th>
                  {roles.map(r => <th key={r} className="p-3 text-xs font-medium text-muted-foreground text-center">{r}</th>)}
                </tr></thead>
                <tbody>
                  {permissions.map(p => (
                    <tr key={p.key} className="border-b border-border/30">
                      <td className="p-3 text-sm">{t(p.labelFa, p.labelEn)}</td>
                      {roles.map(r => (
                        <td key={r} className="p-3 text-center">
                          <div className={`w-5 h-5 rounded-md mx-auto flex items-center justify-center ${rolePermissions[r]?.includes(p.key) ? "bg-success/20 text-success" : "bg-muted/30 text-muted-foreground"}`}>
                            {rolePermissions[r]?.includes(p.key) ? "✓" : "—"}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Access Control */}
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

        {/* Account Protection */}
        <TabsContent value="protection">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Change Password */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-primary" />{t("تغییر رمز عبور", "Change Password")}</h3>
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">{t("رمز فعلی", "Current Password")}</label><input type="password" className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{t("رمز جدید", "New Password")}</label><input type="password" className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{t("تکرار رمز جدید", "Confirm New Password")}</label><input type="password" className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
                <Button className="w-full rounded-xl gold-gradient text-primary-foreground border-0" onClick={() => toast.success(t("رمز عبور تغییر کرد", "Password changed"))}>{t("تغییر رمز", "Change Password")}</Button>
              </div>
            </div>

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

        {/* Moderation */}
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

        {/* Audit Logs */}
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
                    <div><div className="text-sm"><span className="font-medium">{log.user}</span> <span className="text-muted-foreground">{log.action}</span> <span className="font-medium">{log.target}</span></div></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite Staff Modal */}
      <Dialog open={inviteModal} onOpenChange={setInviteModal}>
        <DialogContent className="bg-card border-border/50 rounded-2xl">
          <DialogHeader><DialogTitle>{t("دعوت کارمند جدید", "Invite New Staff")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("نام", "Name")}</label><input className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("ایمیل", "Email")}</label><input type="email" className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50" /></div>
            <div><label className="text-sm text-muted-foreground mb-1 block">{t("نقش", "Role")}</label>
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none">
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <Button className="w-full rounded-xl gold-gradient text-primary-foreground border-0" onClick={() => { toast.success(t("دعوتنامه ارسال شد", "Invitation sent")); setInviteModal(false); }}>{t("ارسال دعوتنامه", "Send Invitation")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Editor Modal */}
      <Dialog open={!!roleModal} onOpenChange={() => setRoleModal(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl">
          <DialogHeader><DialogTitle>{t("ویرایش نقش", "Edit Role")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <select className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none">{roles.map(r => <option key={r}>{r}</option>)}</select>
            <div className="space-y-2">
              {permissions.map(p => (
                <label key={p.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                  <span className="text-sm">{t(p.labelFa, p.labelEn)}</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                </label>
              ))}
            </div>
            <Button className="w-full rounded-xl gold-gradient text-primary-foreground border-0" onClick={() => { toast.success(t("تغییرات ذخیره شد", "Changes saved")); setRoleModal(null); }}>{t("ذخیره", "Save")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default SecurityPage;
