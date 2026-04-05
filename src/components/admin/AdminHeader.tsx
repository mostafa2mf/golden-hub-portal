import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  Search, Bell, Plus, Globe, Menu, X,
  UserPlus, Megaphone, ClipboardList, Send, Download, ChevronDown,
  CheckCircle, MessageSquare, Calendar, AlertTriangle, User, Building2
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdminHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  type: "approval" | "message" | "meeting" | "alert" | "user";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const demoNotifications: Notification[] = [
  { id: "1", type: "approval", title: "درخواست تأیید جدید", description: "سارا احمدی درخواست ثبت‌نام داده", time: "۲ دقیقه پیش", read: false },
  { id: "2", type: "message", title: "پیام جدید", description: "رستوران گلها پیام جدیدی ارسال کرد", time: "۱۵ دقیقه پیش", read: false },
  { id: "3", type: "meeting", title: "جلسه نزدیک است", description: "جلسه با کافه لمیز ساعت ۱۴:۰۰", time: "۳۰ دقیقه پیش", read: false },
  { id: "4", type: "alert", title: "هشدار امنیتی", description: "ورود مشکوک از دستگاه ناشناس", time: "۱ ساعت پیش", read: true },
  { id: "5", type: "user", title: "کاربر جدید", description: "علی رضایی به پلتفرم پیوست", time: "۲ ساعت پیش", read: true },
  { id: "6", type: "approval", title: "بررسی کمپین", description: "کمپین تابستانه هتل پارسیان منتظر تأیید", time: "۳ ساعت پیش", read: true },
];

const notificationIcons: Record<string, any> = {
  approval: CheckCircle,
  message: MessageSquare,
  meeting: Calendar,
  alert: AlertTriangle,
  user: User,
};

const notificationColors: Record<string, string> = {
  approval: "text-success bg-success/10",
  message: "text-info bg-info/10",
  meeting: "text-primary bg-primary/10",
  alert: "text-destructive bg-destructive/10",
  user: "text-muted-foreground bg-muted/50",
};

const notificationRoutes: Record<string, string> = {
  approval: "/approvals",
  message: "/messages",
  meeting: "/meetings",
  alert: "/security",
  user: "/influencers",
};

export const AdminHeader = ({ title, onMenuClick }: AdminHeaderProps) => {
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(demoNotifications);
  const [searchQuery, setSearchQuery] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(t("همه خوانده شد", "All marked as read"));
  };

  const handleNotifClick = (notif: Notification) => {
    markAsRead(notif.id);
    setNotifOpen(false);
    navigate(notificationRoutes[notif.type] || "/dashboard");
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      toast.info(t(`جستجو: ${searchQuery}`, `Searching: ${searchQuery}`));
      // Could navigate to a search results page
    }
  };

  const handleQuickAction = (action: string, route?: string) => {
    toast.success(t(`عملیات: ${action}`, `Action: ${action}`));
    if (route) navigate(route);
  };

  return (
    <header className="h-16 border-b border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className={cn(
          "hidden md:flex items-center bg-muted/50 rounded-xl border border-border/50 transition-all",
          searchOpen ? "w-64" : "w-44"
        )}>
          <Search className="w-4 h-4 text-muted-foreground mx-3 shrink-0" />
          <input
            placeholder={t("جستجو...", "Search...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            onKeyDown={handleSearch}
            className="bg-transparent border-none outline-none text-sm py-2 pe-3 w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-xl hover:bg-muted transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1 animate-pulse-gold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute end-0 top-12 w-80 sm:w-96 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{t("اعلان‌ها", "Notifications")}</h3>
                    {unreadCount > 0 && (
                      <span className="min-w-[20px] h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center px-1.5">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary hover:underline px-2 py-1">
                        {t("خواندن همه", "Mark all read")}
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                  {notifications.map((notif) => {
                    const Icon = notificationIcons[notif.type] || Bell;
                    const colorClass = notificationColors[notif.type] || "text-muted-foreground bg-muted/50";
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={cn(
                          "w-full flex items-start gap-3 px-4 py-3 text-start hover:bg-muted/30 transition-colors border-b border-border/10 last:border-0",
                          !notif.read && "bg-primary/[0.03]"
                        )}
                      >
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", colorClass)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-medium", !notif.read ? "text-foreground" : "text-muted-foreground")}>{notif.title}</span>
                            {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.description}</p>
                          <span className="text-[11px] text-muted-foreground/70 mt-1 block">{notif.time}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-border/30 px-4 py-2.5">
                  <button
                    onClick={() => { setNotifOpen(false); navigate("/security"); }}
                    className="w-full text-center text-xs text-primary hover:underline font-medium py-1"
                  >
                    {t("مشاهده همه اعلان‌ها", "View all notifications")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="hidden sm:flex gap-1.5 gold-gradient text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity border-0">
              <Plus className="w-4 h-4" />
              {t("عملیات", "Actions")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-border/50 rounded-xl">
            <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg" onClick={() => handleQuickAction("افزودن کارمند", "/staff")}>
              <UserPlus className="w-4 h-4 text-primary" />{t("افزودن کارمند", "Add Staff")}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg" onClick={() => handleQuickAction("ایجاد کمپین", "/campaigns")}>
              <Megaphone className="w-4 h-4 text-primary" />{t("ایجاد کمپین", "Create Campaign")}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg" onClick={() => handleQuickAction("بررسی درخواست‌ها", "/approvals")}>
              <ClipboardList className="w-4 h-4 text-primary" />{t("بررسی درخواست‌ها", "Review Requests")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg" onClick={() => handleQuickAction("ارسال پیام عمومی", "/messages")}>
              <Send className="w-4 h-4 text-primary" />{t("ارسال پیام عمومی", "Broadcast Message")}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg" onClick={() => { toast.success(t("خروجی در حال آماده‌سازی...", "Exporting data...")); }}>
              <Download className="w-4 h-4 text-primary" />{t("خروجی داده", "Export Data")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language */}
        <button
          onClick={() => setLang(lang === "fa" ? "en" : "fa")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-muted-foreground"
        >
          <Globe className="w-4 h-4" />
          {lang === "fa" ? "EN" : "FA"}
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors">
              <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-xs font-bold text-primary-foreground">
                A
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border/50 rounded-xl">
            <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => navigate("/settings")}>{t("پروفایل", "Profile")}</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => navigate("/settings")}>{t("تنظیمات", "Settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg text-destructive" onClick={() => { toast.success(t("خارج شدید", "Logged out")); navigate("/"); }}>
              {t("خروج", "Logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
