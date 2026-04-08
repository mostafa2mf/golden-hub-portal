import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";

const ResetPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the magic link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User arrived via reset link — ready to set new password
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error(t("رمز عبور باید حداقل ۸ کاراکتر باشد", "Password must be at least 8 characters"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("رمز عبور و تکرار آن مطابقت ندارند", "Passwords do not match"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(t("خطا در تغییر رمز عبور", "Error resetting password"));
    } else {
      setSuccess(true);
      toast.success(t("رمز عبور با موفقیت تغییر کرد", "Password updated successfully"));
      setTimeout(() => navigate("/"), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <img src={logoImg} alt="Bloggerha" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t("تنظیم رمز عبور جدید", "Set New Password")}
          </h1>
        </div>

        {success ? (
          <div className="text-center space-y-3 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-foreground font-medium">
              {t("رمز عبور با موفقیت تغییر کرد! در حال انتقال...", "Password updated! Redirecting...")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder={t("رمز عبور جدید", "New Password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/30 border border-border/50 rounded-xl ps-10 pe-4 py-2.5 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                dir="ltr"
                minLength={8}
              />
            </div>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder={t("تکرار رمز عبور", "Confirm Password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-muted/30 border border-border/50 rounded-xl ps-10 pe-4 py-2.5 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-primary-foreground font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t("ثبت رمز عبور جدید", "Update Password")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
