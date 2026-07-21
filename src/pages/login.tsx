import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Server, Eye, EyeOff, ArrowRight, Globe } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/8 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Language toggle */}
      <button
        onClick={() => setLocale(locale === "en" ? "ar" : "en")}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3 py-2 rounded-lg glass text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <Globe className="w-4 h-4" />
        {locale === "en" ? "العربية" : "English"}
      </button>

      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 glow-purple-sm">
            <Server className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gradient tracking-wide">AETHERCORE</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t("loginDesc")}</p>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-2xl border border-white/5 p-8 glow-purple">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white/[0.03] border-white/10 focus:border-primary/40 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-white/[0.03] border-white/10 focus:border-primary/40 focus:ring-primary/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive animate-scale-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all glow-purple-sm hover:glow-purple"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t("login")}
                  <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          AetherCore Dashboard v2.0
        </p>
      </div>
    </div>
  );
}
