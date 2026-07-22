import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-mesh">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-magenta/[0.06] blur-[150px] animate-float-slow" />
        <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-violet/[0.08] blur-[120px] animate-float" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-cyan-bright/[0.04] blur-[100px] animate-float-slow" style={{ animationDelay: "-4s" }} />
      </div>

      {/* Animated rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-magenta/[0.06] animate-rotate-slow" />
        <div className="absolute inset-[60px] rounded-full border border-violet/[0.05] animate-rotate-slow" style={{ animationDirection: "reverse", animationDuration: "40s" }} />
        <div className="absolute inset-[120px] rounded-full border border-cyan-bright/[0.04] animate-rotate-slow" style={{ animationDuration: "50s" }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-nebula opacity-40 pointer-events-none" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="neon-border rounded-3xl bg-[#0C0A14]/90 backdrop-blur-2xl p-10 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-magenta via-violet to-cyan-bright flex items-center justify-center shadow-2xl shadow-magenta/30">
                <span className="text-white font-black text-3xl tracking-tighter">A</span>
              </div>
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-magenta/20 via-violet/10 to-cyan-bright/10 blur-xl -z-10 animate-pulse-neon" />
            </div>
            <h1 className="text-3xl font-black text-gradient-nebula mb-2">AetherCore</h1>
            <p className="text-muted-foreground/40 text-sm font-medium">Discord Bot Dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/30 uppercase">{t("email")}</label>
              <Input
                type="email"
                placeholder="admin@aethercore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/[0.03] border-white/[0.06] text-center text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/30 uppercase">{t("password")}</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white/[0.03] border-white/[0.06] text-center text-base"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose/[0.08] border border-rose/20 text-rose text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-magenta via-rose to-magenta hover:from-magenta hover:via-rose hover:to-magenta shadow-lg shadow-magenta/25 hover:shadow-xl hover:shadow-magenta/35"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("login")}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
            <p className="text-[10px] text-muted-foreground/25 font-mono tracking-wider">
              POWERED BY AETHERCORE TEAM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
