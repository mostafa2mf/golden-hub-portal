import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, CheckCircle, Building2, Users, Megaphone,
  CalendarDays, MessageSquare, BarChart3, Shield, Settings,
  LogOut, ChevronLeft, ChevronRight
} from "lucide-react";
import logoImg from "@/assets/logo.png";

const menuItems = [
  { path: "/dashboard", icon: LayoutDashboard, labelFa: "داشبورد", labelEn: "Dashboard" },
  { path: "/approvals", icon: CheckCircle, labelFa: "تأییدیه‌ها", labelEn: "Approvals" },
  { path: "/businesses", icon: Building2, labelFa: "کسب‌وکارها", labelEn: "Businesses" },
  { path: "/influencers", icon: Users, labelFa: "اینفلوئنسرها", labelEn: "Influencers" },
  { path: "/campaigns", icon: Megaphone, labelFa: "کمپین‌ها", labelEn: "Campaigns" },
  { path: "/meetings", icon: CalendarDays, labelFa: "دعوت‌ها", labelEn: "Invitations" },
  { path: "/messages", icon: MessageSquare, labelFa: "پیام‌ها", labelEn: "Messages" },
  { path: "/analytics", icon: BarChart3, labelFa: "تحلیل‌ها", labelEn: "Analytics" },
  { path: "/security", icon: Shield, labelFa: "امنیت و کارکنان", labelEn: "Security & Staff" },
  { path: "/settings", icon: Settings, labelFa: "تنظیمات", labelEn: "Settings" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { signOut } = useAuth();

  return (
    <aside
      className={cn(
        "fixed top-0 h-screen bg-sidebar border-border/50 z-40 transition-all duration-300 flex flex-col",
        dir === "rtl" ? "right-0 border-l" : "left-0 border-r",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border/50">
        <img src={logoImg} alt="Bloggerha" className="w-9 h-9 shrink-0 object-contain" />
        {!collapsed && (
          <span className="gold-text text-lg font-bold tracking-tight">Bloggerha</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary glow-gold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? t(item.labelFa, item.labelEn) : undefined}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{t(item.labelFa, item.labelEn)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border/50">
        <button
          onClick={async () => { await signOut(); navigate("/"); }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-destructive hover:bg-destructive/10 transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>{t("خروج", "Logout")}</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-20 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all",
          dir === "rtl" ? "-left-3.5" : "-right-3.5"
        )}
      >
        {dir === "rtl"
          ? (collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)
          : (collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)
        }
      </button>
    </aside>
  );
};
