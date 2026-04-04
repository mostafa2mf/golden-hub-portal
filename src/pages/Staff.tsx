import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { demoStaff } from "@/data/demoData";
import { UserPlus, Edit, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

const StaffPage = () => {
  const { t } = useLanguage();
  const [inviteModal, setInviteModal] = useState(false);
  const [roleModal, setRoleModal] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("Admin");

  return (
    <AdminLayout title={t("کارکنان و نقش‌ها", "Staff & Roles")}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-semibold">{t("لیست کارکنان", "Staff List")}</h2>
        <Button onClick={() => setInviteModal(true)} className="gap-2 rounded-xl gold-gradient text-primary-foreground border-0"><UserPlus className="w-4 h-4" />{t("دعوت کارمند", "Invite Staff")}</Button>
      </div>

      <div className="glass-card overflow-hidden mb-8">
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
      <h2 className="text-base font-semibold mb-4">{t("ماتریس دسترسی‌ها", "Permission Matrix")}</h2>
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

      {/* Invite Modal */}
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

      {/* Role Editor */}
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

export default StaffPage;
