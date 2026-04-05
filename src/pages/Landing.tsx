import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, ArrowRight, Globe } from "lucide-react";

const LandingBackground3D = lazy(() => import("@/components/LandingBackground3D"));

const Landing = () => {
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <LandingBackground3D />
      </Suspense>

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "fa" ? "en" : "fa")}
        className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all backdrop-blur-sm"
      >
        <Globe className="w-4 h-4" />
        {lang === "fa" ? "EN" : "FA"}
      </button>

      {/* Branding + CTA */}
      <div className="relative z-10 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-6 glow-gold-strong backdrop-blur-sm">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-5xl font-bold gold-text mb-3">Bloggerha</h1>
        <p className="text-base text-muted-foreground mb-10 max-w-md mx-auto">
          {t("پلتفرم حرفه‌ای ارتباط اینفلوئنسرها و برندها", "Premium Influencer–Brand Connection Platform")}
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="gold-gradient text-primary-foreground font-semibold text-base px-10 py-3.5 rounded-xl inline-flex items-center gap-3 hover:opacity-90 transition-all glow-gold-strong hover:scale-105 active:scale-100"
        >
          {t("ورود به پنل مدیریت", "Enter Admin Panel")}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-muted-foreground z-10">
        © 2026 Bloggerha — {t("تمامی حقوق محفوظ است", "All rights reserved")}
      </p>
    </div>
  );
};

export default Landing;
