import type { FormEvent } from "react";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "forgot";

interface AdminAuthCardCopy {
  adminOnly: string;
  secureAccess: string;
  loginTitle: string;
  loginDescription: string;
  forgotTitle: string;
  forgotDescription: string;
  emailLabel: string;
  passwordLabel: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  forgotPlaceholder: string;
  loginAction: string;
  forgotAction: string;
  switchToForgot: string;
  switchToLogin: string;
  helpText: string;
  checkingSession: string;
}

interface AdminAuthCardProps {
  mode: AuthMode;
  email: string;
  password: string;
  resetEmail: string;
  loading: boolean;
  resetLoading: boolean;
  authLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onResetEmailChange: (value: string) => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSwitchMode: (mode: AuthMode) => void;
  copy: AdminAuthCardCopy;
}

export const AdminAuthCard = ({
  mode,
  email,
  password,
  resetEmail,
  loading,
  resetLoading,
  authLoading,
  onEmailChange,
  onPasswordChange,
  onResetEmailChange,
  onLoginSubmit,
  onForgotSubmit,
  onSwitchMode,
  copy,
}: AdminAuthCardProps) => {
  const isLogin = mode === "login";
  const isBusy = authLoading || loading || resetLoading;

  return (
    <Card className="relative overflow-hidden rounded-[2rem] border-border/50 bg-card/85 shadow-2xl backdrop-blur-2xl">
      <div className="gold-gradient absolute inset-x-0 top-0 h-1" />

      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {copy.adminOnly}
          </div>
          {authLoading ? <span className="text-xs text-muted-foreground">{copy.checkingSession}</span> : null}
        </div>

        <div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isLogin ? copy.loginTitle : copy.forgotTitle}
          </CardTitle>
          <CardDescription className="mt-2 leading-6">
            {isLogin ? copy.loginDescription : copy.forgotDescription}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {isLogin ? (
          <form className="space-y-5" onSubmit={onLoginSubmit}>
            <div className="space-y-2">
              <Label htmlFor="admin-email">{copy.emailLabel}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  autoComplete="email"
                  dir="ltr"
                  className="h-12 rounded-2xl border-border/50 bg-background/70 ps-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">{copy.passwordLabel}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder={copy.passwordPlaceholder}
                  autoComplete="current-password"
                  dir="ltr"
                  className="h-12 rounded-2xl border-border/50 bg-background/70 ps-11"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">{copy.secureAccess}</p>
              <Button type="button" variant="link" className="h-auto px-0 text-xs" onClick={() => onSwitchMode("forgot")}>
                {copy.switchToForgot}
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isBusy}
              className="gold-gradient h-12 w-full rounded-2xl text-sm font-semibold text-primary-foreground shadow-[var(--gold-glow-strong)]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {copy.loginAction}
            </Button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={onForgotSubmit}>
            <div className="space-y-2">
              <Label htmlFor="reset-email">{copy.emailLabel}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(event) => onResetEmailChange(event.target.value)}
                  placeholder={copy.forgotPlaceholder}
                  autoComplete="email"
                  dir="ltr"
                  className="h-12 rounded-2xl border-border/50 bg-background/70 ps-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isBusy}
              className="gold-gradient h-12 w-full rounded-2xl text-sm font-semibold text-primary-foreground shadow-[var(--gold-glow-strong)]"
            >
              {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {copy.forgotAction}
            </Button>

            <Button type="button" variant="ghost" className="h-12 w-full rounded-2xl" onClick={() => onSwitchMode("login")}>
              {copy.switchToLogin}
            </Button>
          </form>
        )}

        <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
          {copy.helpText}
        </div>
      </CardContent>
    </Card>
  );
};