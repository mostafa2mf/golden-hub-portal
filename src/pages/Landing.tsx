import { lazy, Suspense, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Globe, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";

const LandingBackground3D = lazy(() => import("@/components/LandingBackground3D"));

const Landing = () => {
  const { t, lang, setLang } = useLanguage();
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // If already logged in as admin, redirect
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error(t("ایمیل و رمز عبور را وارد کنید", "Enter email and password"));
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(t("ایمیل یا رمز عبور اشتباه است", "Invalid email or password"));
    } else {
      toast.success(t("خوش آمدید!", "Welcome!"));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error(t("ایمیل خود را وارد کنید", "Enter your email"));
      return;
    }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setForgotLoading(false);
    if (error) {
      toast.error(t("خطا در ارسال ایمیل", "Error sending reset email"));
    } else {
      toast.success(t("لینک بازنشانی به ایمیل شما ارسال شد", "Reset link sent to your email"));
      setShowForgot(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Suspense fallback={null}>
        <LandingBackground3D />
      </Suspense>

      <button
        onClick={() => setLang(lang === "fa" ? "en" : "fa")}
        className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all backdrop-blur-sm"
      >
        <Globe className="w-4 h-4" />
        {lang === "fa" ? "EN" : "FA"}
      </button>

      <div className="relative z-10 text-center animate-fade-in">
        <img src={logoImg} alt="Bloggerha" className="w-24 h-24 mx-auto mb-6 drop-shadow-[0_0_25px_hsl(var(--primary)/0.4)]" />
        <h1
          className="text-6xl md:text-7xl font-extrabold mb-3 tracking-tight gold-text"
          style={{ textShadow: "0 0 40px hsl(var(--primary) / 0.3), 0 0 80px hsl(var(--primary) / 0.15)" }}
        >
          Bloggerha
        </h1>
        <p
          className="text-lg md:text-xl mb-10 max-w-md mx-auto font-medium"
          style={{ color: "hsl(0 0% 95%)", textShadow: "0 2px 12px hsl(0 0% 0% / 0.5), 0 0 30px hsl(0 0% 0% / 0.3)" }}
        >
          {t("پلتفرم حرفه‌ای ارتباط اینفلوئنسرها و برندها", "Premium Influencer–Brand Connection Platform")}
        </p>

        {!showLogin && !showForgot ? (
          <button
            onClick={() => setShowLogin(true)}
            className="gold-gradient text-primary-foreground font-semibold text-base px-10 py-3.5 rounded-xl inline-flex items-center gap-3 hover:opacity-90 transition-all glow-gold-strong hover:scale-105 active:scale-100"
          >
            {t("ورود به پنل مدیریت", "Enter Admin Panel")}
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : showForgot ? (
          <form
            onSubmit={handleForgotPassword}
            className="w-full max-w-sm mx-auto space-y-4 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 animate-fade-in"
          >
            <h2 className="text-lg font-bold text-foreground mb-2">
              {t("بازنشانی رمز عبور", "Reset Password")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("ایمیل خود را وارد کنید تا لینک بازنشانی ارسال شود", "Enter your email to receive a reset link")}
            </p>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder={t("ایمیل", "Email")}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-muted/30 border border-border/50 rounded-xl ps-10 pe-4 py-2.5 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                autoComplete="email"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full gold-gradient text-primary-foreground font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t("ارسال لینک بازنشانی", "Send Reset Link")}
            </button>
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              {t("بازگشت به ورود", "Back to Login")}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleLogin}
            className="w-full max-w-sm mx-auto space-y-4 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 animate-fade-in"
          >
            <h2 className="text-lg font-bold text-foreground mb-2">
              {t("ورود ادمین", "Admin Login")}
            </h2>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder={t("ایمیل", "Email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted/30 border border-border/50 rounded-xl ps-10 pe-4 py-2.5 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                autoComplete="email"
                dir="ltr"
              />
            </div>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder={t("رمز عبور", "Password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/30 border border-border/50 rounded-xl ps-10 pe-4 py-2.5 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                autoComplete="current-password"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-primary-foreground font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t("ورود", "Login")}
            </button>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setShowForgot(true); setShowLogin(false); }}
                className="text-xs text-primary hover:underline transition-colors"
              >
                {t("فراموشی رمز عبور", "Forgot Password?")}
              </button>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("بازگشت", "Back")}
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="absolute bottom-6 text-xs text-muted-foreground z-10">
        © 2026 Bloggerha — {t("تمامی حقوق محفوظ است", "All rights reserved")}
      </p>
    </div>
  );
};

export default Landing;
