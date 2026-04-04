import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  Search, Bell, Plus, Globe, Menu,
  UserPlus, Megaphone, ClipboardList, Send, Download, ChevronDown
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export const AdminHeader = ({ title, onMenuClick }: AdminHeaderProps) => {
  const { lang, setLang, t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);

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
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            className="bg-transparent border-none outline-none text-sm py-2 pe-3 w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse-gold" />
        </button>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="hidden sm:flex gap-1.5 gold-gradient text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity border-0">
              <Plus className="w-4 h-4" />
              {t("عملیات", "Actions")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-border/50 rounded-xl">
            <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg"><UserPlus className="w-4 h-4 text-primary" />{t("افزودن کارمند", "Add Staff")}</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg"><Megaphone className="w-4 h-4 text-primary" />{t("ایجاد کمپین", "Create Campaign")}</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg"><ClipboardList className="w-4 h-4 text-primary" />{t("بررسی درخواست‌ها", "Review Requests")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg"><Send className="w-4 h-4 text-primary" />{t("ارسال پیام عمومی", "Broadcast Message")}</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg"><Download className="w-4 h-4 text-primary" />{t("خروجی داده", "Export Data")}</DropdownMenuItem>
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
            <DropdownMenuItem className="cursor-pointer rounded-lg">{t("پروفایل", "Profile")}</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg">{t("تنظیمات", "Settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg text-destructive">{t("خروج", "Logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
