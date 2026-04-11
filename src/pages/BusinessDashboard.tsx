import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Building2, LayoutDashboard } from "lucide-react";

const BusinessDashboard = () => {
  const { t, dir } = useLanguage();
  const { session, logout, loading } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!session || session.entity_type !== "business")) {
      navigate("/login", { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{session.name}</p>
              <p className="text-xs text-muted-foreground">{t("پنل کسب‌وکار", "Business Panel")}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { logout(); navigate("/login"); }}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4 me-2" />
            {t("خروج", "Logout")}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{t("داشبورد کسب‌وکار", "Business Dashboard")}</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card/80 border border-border/50 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">0</p>
            <p className="text-sm text-muted-foreground">{t("کمپین‌های فعال", "Active Campaigns")}</p>
          </div>
          <div className="bg-card/80 border border-border/50 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">0</p>
            <p className="text-sm text-muted-foreground">{t("اینفلوئنسرهای همکار", "Partner Influencers")}</p>
          </div>
          <div className="bg-card/80 border border-border/50 rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-primary mb-2">0</p>
            <p className="text-sm text-muted-foreground">{t("پیام‌های جدید", "New Messages")}</p>
          </div>
        </div>

        <div className="mt-8 bg-card/80 border border-border/50 rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">{t("به زودی امکانات بیشتری اضافه خواهد شد", "More features coming soon")}</p>
        </div>
      </main>
    </div>
  );
};

export default BusinessDashboard;
