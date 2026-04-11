import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import { AdminAuthCard } from "@/components/auth/AdminAuthCard";
import { LandingHero } from "@/components/auth/LandingHero";
import logoImg from "@/assets/logo.png";

const LandingBackground3D = lazy(() => import("@/components/LandingBackground3D"));

const Landing = () => {
  const { t, lang, setLang } = useLanguage();
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "forgot">("login");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const heroHighlights = useMemo(
    () => [
      t("ورود مستقیم و بدون مرحله‌ی اضافی برای ادمین", "Direct admin sign-in with no extra step"),
      t("بررسی دسترسی ادمین قبل از ورود به داشبورد", "Admin access is verified before entering the dashboard"),
      t("بازنشانی رمز عبور از همین صفحه و بدون سردرگمی", "Password recovery is available right on this page"),
      t("تجربه‌ی ساده‌تر، سریع‌تر و واضح‌تر برای مدیریت", "A simpler, faster, clearer management experience"),
    ],
    [t],
  );

  const heroStats = useMemo(
    () => [
      { label: t("ورود", "Access"), value: t("امن", "Secure") },
      { label: t("نقش", "Role"), value: "Admin" },
      { label: t("وضعیت", "Status"), value: t("آنلاین", "Online") },
    ],
    [t],
  );

  const authCopy = useMemo(
    () => ({
      adminOnly: t("فقط ادمین", "Admin only"),
      secureAccess: t("ورود امن با ایمیل و رمز عبور", "Secure access with email and password"),
      loginTitle: t("ورود به پنل مدیریت", "Sign in to the admin panel"),
      loginDescription: t(
        "برای ورود، ایمیل و رمز عبور ادمین را وارد کنید. دسترسی شما قبل از ورود به داشبورد بررسی می‌شود.",
        "Enter the admin email and password. Your access is verified before the dashboard opens.",
      ),
      forgotTitle: t("بازیابی رمز عبور", "Recover your password"),
      forgotDescription: t(
        "ایمیل ادمین را وارد کنید تا لینک بازنشانی رمز عبور برایتان ارسال شود.",
        "Enter the admin email to receive a password reset link.",
      ),
      emailLabel: t("ایمیل", "Email"),
      passwordLabel: t("رمز عبور", "Password"),
      emailPlaceholder: t("ایمیل ادمین", "Admin email"),
      passwordPlaceholder: t("رمز عبور ادمین", "Admin password"),
      forgotPlaceholder: t("example@domain.com", "example@domain.com"),
      loginAction: t("ورود به داشبورد", "Enter dashboard"),
      forgotAction: t("ارسال لینک بازنشانی", "Send reset link"),
      switchToForgot: t("رمز را فراموش کرده‌ام", "Forgot password?"),
      switchToLogin: t("بازگشت به ورود", "Back to sign in"),
      helpText: t(
        "اگر این حساب نقش ادمین نداشته باشد، ورود انجام نمی‌شود و همان‌جا متوقف خواهد شد.",
        "If this account does not have the admin role, sign-in will stop before dashboard access.",
      ),
      checkingSession: t("در حال بررسی نشست...", "Checking session..."),
    }),
    [t],
  );

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
    const { error, isAdmin: hasAdminAccess } = await signIn(email, password);
    setLoading(false);

    if (error) {
      if (error === "ADMIN_ONLY") {
        toast.error(t("این حساب دسترسی ادمین ندارد", "This account does not have admin access"));
        return;
      }

      toast.error(t("ایمیل یا رمز عبور اشتباه است", "Invalid email or password"));
      return;
    }

    if (!hasAdminAccess) return;

    toast.success(t("خوش آمدید!", "Welcome!"));
    navigate("/dashboard", { replace: true });
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
      setAuthMode("login");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Suspense fallback={null}>
        <LandingBackground3D />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/70 to-background" />

      <button
        onClick={() => setLang(lang === "fa" ? "en" : "fa")}
        className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-border/50 bg-card/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl transition-all hover:border-primary/30 hover:text-foreground sm:right-6 sm:top-6"
      >
        <Globe className="w-4 h-4" />
        {lang === "fa" ? "EN" : "FA"}
      </button>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,420px)]">
          <LandingHero
            className="order-2 lg:order-1"
            badge={t("نسخه‌ی بازطراحی‌شده‌ی ورود ادمین", "Redesigned admin sign-in")}
            title={t("لندینگ و ورود ادمین را از نو ساده و قابل‌اعتماد کردیم", "The admin landing and sign-in are now simpler and more reliable")}
            description={t(
              "این صفحه از اول برای ورود سریع، بررسی دقیق نقش ادمین و دسترسی بدون ابهام به داشبورد بازطراحی شده است.",
              "This page was rebuilt for faster sign-in, reliable admin-role verification, and cleaner access to the dashboard.",
            )}
            highlights={heroHighlights}
            stats={heroStats}
            logoSrc={logoImg}
            primaryActionLabel={t("ورود سریع ادمین", "Quick admin sign-in")}
            onPrimaryAction={() => setAuthMode("login")}
          />

          <div className="order-1 lg:order-2">
            <AdminAuthCard
              mode={authMode}
              email={email}
              password={password}
              resetEmail={forgotEmail}
              loading={loading}
              resetLoading={forgotLoading}
              authLoading={authLoading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onResetEmailChange={setForgotEmail}
              onLoginSubmit={handleLogin}
              onForgotSubmit={handleForgotPassword}
              onSwitchMode={setAuthMode}
              copy={authCopy}
            />
          </div>
        </div>
      </main>

      <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-xs text-muted-foreground">
        © 2026 Bloggerha — {t("تمامی حقوق محفوظ است", "All rights reserved")}
      </p>
    </div>
  );
};

export default Landing;
