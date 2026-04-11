import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, User, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";

const UserLogin = () => {
  const { t, dir } = useLanguage();
  const { login, session } = useUserAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      navigate(session.entity_type === "blogger" ? "/blogger-dashboard" : "/business-dashboard", { replace: true });
    }
  }, [session, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error(t("لطفاً نام کاربری و رمز عبور را وارد کنید", "Please enter username and password"));
      return;
    }

    setLoading(true);
    const { error } = await login(username.trim(), password);
    setLoading(false);

    if (error) {
      if (error === "INVALID_CREDENTIALS") {
        toast.error(t("نام کاربری یا رمز عبور اشتباه است", "Invalid username or password"));
      } else if (error === "ENTITY_NOT_FOUND") {
        toast.error(t("حساب کاربری یافت نشد", "Account not found"));
      } else {
        toast.error(t("خطا در ورود. لطفاً دوباره تلاش کنید", "Login failed. Please try again"));
      }
      return;
    }

    toast.success(t("ورود موفق!", "Login successful!"));
  };

  return (
    <div dir={dir} className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="relative overflow-hidden rounded-[2rem] border-border/50 bg-card/85 shadow-2xl backdrop-blur-2xl">
          <div className="gold-gradient absolute inset-x-0 top-0 h-1" />

          <CardHeader className="space-y-2 pb-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {t("ورود به پنل", "Login to Panel")}
            </CardTitle>
            <CardDescription className="leading-6">
              {t("نام کاربری و رمز عبور خود را وارد کنید", "Enter your username and password")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="user-username">{t("نام کاربری", "Username")}</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="user-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("نام کاربری", "Username")}
                    autoComplete="username"
                    dir="ltr"
                    className="h-12 rounded-2xl border-border/50 bg-background/70 ps-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-password">{t("رمز عبور", "Password")}</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="user-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("رمز عبور", "Password")}
                    autoComplete="current-password"
                    dir="ltr"
                    className="h-12 rounded-2xl border-border/50 bg-background/70 ps-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="gold-gradient h-12 w-full rounded-2xl text-sm font-semibold text-primary-foreground shadow-[var(--gold-glow-strong)]"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {t("ورود", "Login")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserLogin;
