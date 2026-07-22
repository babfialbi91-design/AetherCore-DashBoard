import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, ArrowRight, Globe, Zap } from "lucide-react";

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
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-cyan/8 rounded-full blur-[150px] animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-electric/5 rounded-full blur-[150px] animate-[float_12s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-neon-pink/4 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite_1s]" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Rotating glow ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-cyan/5 animate-[rotateGlow_30s_linear_infinite]" />
        <div className="absolute inset-8 rounded-full border border-electric/3 animate-[rotateGlow_25s_linear_infinite_reverse]" />
        <div className="absolute inset-16 rounded-full border border-cyan/2 animate-[rotateGlow_20s_linear_infinite]" />
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLocale(locale === "en" ? "ar" : "en")}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-muted-foreground/70 hover:text-foreground transition-all hover:border-cyan/20 border border-transparent cursor-pointer"
      >
        <Globe className="w-4 h-4" />
        {locale === "en" ? "العربية" : "English"}
      </button>

      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan/15 to-electric/5 border border-cyan/15 mb-5 relative overflow-hidden glow-cyan-sm">
            <Zap className="w-10 h-10 text-cyan relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan/30 rounded-full blur-md" />
          </div>
          <h1 className="text-4xl font-bold text-gradient-cyber tracking-wider">AETHERCORE</h1>
          <p className="text-muted-foreground/50 mt-3 text-sm font-mono tracking-wider">CONTROL PANEL ACCESS</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] p-8 relative overflow-hidden glow-cyan">
          {/* Card glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan/5 rounded-full blur-[60px] pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/[0.03] border-white/[0.06] focus:border-cyan/40 focus:ring-cyan/20 transition-all rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
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
                  className="h-12 bg-white/[0.03] border-white/[0.06] focus:border-cyan/40 focus:ring-cyan/20 transition-all rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-pop-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-cyan to-cyan/80 hover:from-cyan/90 hover:to-cyan/70 text-background font-bold rounded-xl transition-all glow-cyan-sm hover:glow-cyan-lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t("login")}
                  <ArrowRight className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/30 mt-8 font-mono tracking-widest">
          AETHERCORE DASHBOARD v2.0
        </p>
      </div>
    </div>
  );
}
