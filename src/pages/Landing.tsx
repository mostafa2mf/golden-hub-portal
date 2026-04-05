import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, Lock, User, Shield, ArrowRight, Globe } from "lucide-react";
import { toast } from "sonner";

const LandingBackground3D = lazy(() => import("@/components/LandingBackground3D"));

const MAX_USERNAME_LEN = 50;
const MAX_PASSWORD_LEN = 128;
const MIN_PASSWORD_LEN = 8;
const USERNAME_REGEX = /^[a-zA-Z0-9._@-]+$/;

const Landing = () => {
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const trimmedUser = username.trim();

    if (!trimmedUser) {
      newErrors.username = t("نام کاربری الزامی است", "Username is required");
    } else if (trimmedUser.length > MAX_USERNAME_LEN) {
      newErrors.username = t(
        `نام کاربری حداکثر ${MAX_USERNAME_LEN} کاراکتر`,
        `Username max ${MAX_USERNAME_LEN} characters`
      );
    } else if (!USERNAME_REGEX.test(trimmedUser)) {
      newErrors.username = t(
        "فقط حروف، اعداد، نقطه، خط تیره و @ مجاز است",
        "Only letters, numbers, dots, hyphens and @ allowed"
      );
    }

    if (!password) {
      newErrors.password = t("رمز عبور الزامی است", "Password is required");
    } else if (password.length < MIN_PASSWORD_LEN) {
      newErrors.password = t(
        `رمز عبور حداقل ${MIN_PASSWORD_LEN} کاراکتر`,
        `Password must be at least ${MIN_PASSWORD_LEN} characters`
      );
    } else if (password.length > MAX_PASSWORD_LEN) {
      newErrors.password = t(
        `رمز عبور حداکثر ${MAX_PASSWORD_LEN} کاراکتر`,
        `Password max ${MAX_PASSWORD_LEN} characters`
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      toast.error(t("حساب قفل شده. لطفاً صبر کنید.", "Account locked. Please wait."));
      return;
    }

    if (!validate()) return;

    setLoading(true);

    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 1200));

    // Demo credentials check
    if (username.trim() === "admin" && password === "Admin@1234") {
      setAttempts(0);
      setLockedUntil(null);
      toast.success(t("خوش آمدید!", "Welcome!"));
      navigate("/dashboard");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 5 * 60 * 1000);
        toast.error(t("۵ تلاش ناموفق. حساب ۵ دقیقه قفل شد.", "5 failed attempts. Account locked for 5 minutes."));
      } else {
        toast.error(
          t(
            `نام کاربری یا رمز عبور اشتباه (${5 - newAttempts} تلاش باقی)`,
            `Invalid credentials (${5 - newAttempts} attempts remaining)`
          )
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <LandingBackground3D />
      </Suspense>
      {/* Ambient glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none" />

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "fa" ? "en" : "fa")}
        className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
      >
        <Globe className="w-4 h-4" />
        {lang === "fa" ? "EN" : "FA"}
      </button>

      {/* Branding */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 glow-gold">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold gold-text mb-1">Bloggerha</h1>
        <p className="text-sm text-muted-foreground">
          {t("پنل مدیریت پلتفرم اینفلوئنسر", "Influencer Platform Admin Panel")}
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md glass-card p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {t("ورود به پنل", "Sign In")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("اطلاعات حساب خود را وارد کنید", "Enter your account credentials")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-medium text-foreground">
              {t("نام کاربری", "Username")}
            </label>
            <div className="relative">
              <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="username"
                type="text"
                autoComplete="username"
                maxLength={MAX_USERNAME_LEN}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                }}
                disabled={isLocked || loading}
                placeholder={t("نام کاربری را وارد کنید", "Enter username")}
                className={`w-full h-11 rounded-xl bg-muted/40 border ${
                  errors.username ? "border-destructive" : "border-border/50 focus:border-primary/50"
                } ps-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50`}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-destructive mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              {t("رمز عبور", "Password")}
            </label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                maxLength={MAX_PASSWORD_LEN}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                disabled={isLocked || loading}
                placeholder={t("رمز عبور را وارد کنید", "Enter password")}
                className={`w-full h-11 rounded-xl bg-muted/40 border ${
                  errors.password ? "border-destructive" : "border-border/50 focus:border-primary/50"
                } ps-10 pe-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password}</p>
            )}
          </div>

          {/* Lock warning */}
          {isLocked && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <Lock className="w-4 h-4 shrink-0" />
              {t(
                "حساب شما به دلیل تلاش‌های ناموفق قفل شده است. ۵ دقیقه صبر کنید.",
                "Account locked due to failed attempts. Wait 5 minutes."
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full h-11 rounded-xl gold-gradient text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-gold"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                {t("ورود", "Sign In")}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo hint */}
        <div className="mt-6 pt-4 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            {t("حساب آزمایشی:", "Demo credentials:")}
            <span className="text-foreground font-medium mx-1">admin</span>/
            <span className="text-foreground font-medium mx-1">Admin@1234</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-6">
        © 2026 Bloggerha — {t("تمامی حقوق محفوظ است", "All rights reserved")}
      </p>
    </div>
  );
};

export default Landing;
