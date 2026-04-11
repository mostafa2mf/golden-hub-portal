import { lazy, Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Loader2, Lock, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoImg from "@/assets/logo.png";

const LandingBackground3D = lazy(() => import("@/components/LandingBackground3D"));

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

const Landing = () => {
  const { t, lang, setLang } = useLanguage();
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "forgot">("login");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Brute-force protection
  const attemptsRef = useRef(0);
  const lockoutUntilRef = useRef(0);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const validateEmail = useCallback((v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();

    if (now < lockoutUntilRef.current) {
      const secs = Math.ceil((lockoutUntilRef.current - now) / 1000);
      toast.error(t(`لطفاً ${secs} ثانیه صبر کنید`, `Please wait ${secs} seconds`));
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast.error(t("ایمیل و رمز عبور را وارد کنید", "Enter email and password"));
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      toast.error(t("ایمیل معتبر نیست", "Invalid email format"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("رمز عبور باید حداقل ۶ کاراکتر باشد", "Password must be at least 6 characters"));
      return;
    }

    setLoading(true);
    const { error, isAdmin: hasAdmin } = await signIn(trimmedEmail, password);
    setLoading(false);

    if (error) {
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        lockoutUntilRef.current = Date.now() + LOCKOUT_SECONDS * 1000;
        attemptsRef.current = 0;
        toast.error(t("تعداد تلاش‌ها بیش از حد مجاز. لطفاً صبر کنید.", "Too many attempts. Please wait."));
        return;
      }

      if (error === "ADMIN_ONLY") {
        toast.error(t("این حساب دسترسی ادمین ندارد", "This account does not have admin access"));
      } else {
        toast.error(t("ایمیل یا رمز عبور اشتباه است", "Invalid email or password"));
      }
      return;
    }

    if (!hasAdmin) return;

    attemptsRef.current = 0;
    toast.success(t("خوش آمدید!", "Welcome!"));
    navigate("/dashboard", { replace: true });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = forgotEmail.trim();
    if (!trimmed || !validateEmail(trimmed)) {
      toast.error(t("ایمیل معتبر وارد کنید", "Enter a valid email"));
      return;
    }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setForgotLoading(false);

    if (error) {
      toast.error(t("خطا در ارسال ایمیل", "Error sending reset email"));
    } else {
      toast.success(t("لینک بازنشانی ارسال شد", "Reset link sent"));
      setAuthMode("login");
    }
  };

  const isBusy = authLoading || loading || forgotLoading;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <Suspense fallback={null}>
        <LandingBackground3D />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "fa" ? "en" : "fa")}
        className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-border/50 bg-card/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl transition-all hover:border-primary/30 hover:text-foreground"
      >
        <Globe className="w-4 h-4" />
        {lang === "fa" ? "EN" : "FA"}
      </button>

      {/* Centered login card */}
      <Card className="relative z-10 w-full max-w-[420px] mx-4 overflow-hidden rounded-[2rem] border-border/50 bg-card/85 shadow-2xl backdrop-blur-2xl">
        <div className="gold-gradient absolute inset-x-0 top-0 h-1" />

        <CardHeader className="space-y-4 pb-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-primary/20 bg-background/70 p-3 shadow-[var(--gold-glow)]">
            <img src={logoImg} alt="Logo" className="h-full w-full object-contain" />
          </div>

          <div className="inline-flex mx-auto items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("پنل مدیریت", "Admin Panel")}
          </div>

          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              {authMode === "login"
                ? t("ورود به پنل مدیریت", "Sign in to Admin Panel")
                : t("بازیابی رمز عبور", "Recover Password")}
            </CardTitle>
            <CardDescription className="mt-1.5 text-sm">
              {authMode === "login"
                ? t("ایمیل و رمز عبور ادمین را وارد کنید", "Enter admin credentials")
                : t("ایمیل خود را وارد کنید", "Enter your email to reset")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {authMode === "login" ? (
            <form className="space-y-4" onSubmit={handleLogin} autoComplete="on">
              <div className="space-y-2">
                <Label htmlFor="admin-email">{t("ایمیل", "Email")}</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("ایمیل ادمین", "Admin email")}
                    autoComplete="email"
                    dir="ltr"
                    maxLength={255}
                    className="h-12 rounded-2xl border-border/50 bg-background/70 ps-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">{t("رمز عبور", "Password")}</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("رمز عبور", "Password")}
                    autoComplete="current-password"
                    dir="ltr"
                    maxLength={128}
                    className="h-12 rounded-2xl border-border/50 bg-background/70 ps-11 pe-11"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" variant="link" className="h-auto px-0 text-xs" onClick={() => setAuthMode("forgot")}>
                  {t("رمز را فراموش کرده‌ام", "Forgot password?")}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isBusy}
                className="gold-gradient h-12 w-full rounded-2xl text-sm font-semibold text-primary-foreground shadow-[var(--gold-glow-strong)]"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("ورود", "Sign In")}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t("ایمیل", "Email")}</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="example@domain.com"
                    autoComplete="email"
                    dir="ltr"
                    maxLength={255}
                    className="h-12 rounded-2xl border-border/50 bg-background/70 ps-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isBusy}
                className="gold-gradient h-12 w-full rounded-2xl text-sm font-semibold text-primary-foreground shadow-[var(--gold-glow-strong)]"
              >
                {forgotLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("ارسال لینک بازنشانی", "Send Reset Link")}
              </Button>

              <Button type="button" variant="ghost" className="h-12 w-full rounded-2xl" onClick={() => setAuthMode("login")}>
                {t("بازگشت به ورود", "Back to Sign In")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-xs text-muted-foreground">
        © 2026 Bloggerha — {t("تمامی حقوق محفوظ است", "All rights reserved")}
      </p>
    </div>
  );
};

export default Landing;
