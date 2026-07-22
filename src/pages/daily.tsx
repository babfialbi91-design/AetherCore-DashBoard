import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Coins, Save, Minus, Plus, Gift, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageTransition, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function Daily() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [amount, setAmount] = useState<number | null>(null);
  const { data: config, isLoading } = useQuery({
    queryKey: ["daily-config"],
    queryFn: () => apiCall<{ dailyAmount: number }>("/api/bot/daily/config"),
  });

  const saveConfig = useMutation({
    mutationFn: (dailyAmount: number) =>
      apiCall("/api/bot/daily/config", { method: "POST", body: JSON.stringify({ dailyAmount }) }),
    onSuccess: () => {
      toast({ title: t("configSaved") });
      queryClient.invalidateQueries({ queryKey: ["daily-config"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const currentAmount = amount !== null ? amount : config?.dailyAmount ?? 100;

  const adjust = (delta: number) => {
    setAmount((prev) => {
      const base = prev !== null ? prev : config?.dailyAmount ?? 100;
      return Math.max(1, base + delta);
    });
  };

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-violet flex items-center gap-3">
            <Gift className="w-8 h-8 text-[#8B5CF6]" /> {t("dailyTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("dailyDesc")}</p>
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <div className="max-w-lg mx-auto">
          <div className="relative glass-magenta rounded-3xl border border-[#8B5CF6]/10 p-10 text-center overflow-hidden">
            <div className="absolute top-4 left-6 animate-float opacity-20">
              <Coins className="w-6 h-6 text-[#FFB800]" />
            </div>
            <div className="absolute top-8 right-8 animate-float opacity-15" style={{ animationDelay: "1s" }}>
              <Coins className="w-4 h-4 text-[#FFB800]" />
            </div>
            <div className="absolute bottom-6 left-10 animate-float opacity-10" style={{ animationDelay: "2s" }}>
              <Coins className="w-5 h-5 text-[#FFB800]" />
            </div>
            <div className="absolute bottom-10 right-12 animate-float opacity-15" style={{ animationDelay: "0.5s" }}>
              <Sparkles className="w-4 h-4 text-[#FF006E]" />
            </div>

            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-20 w-40 mx-auto rounded-2xl" />
                <Skeleton className="h-12 w-56 mx-auto rounded-xl" />
                <Skeleton className="h-12 w-32 mx-auto rounded-xl" />
              </div>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 mb-2">{t("dailyAmount")}</p>

                <div className="mb-8">
                  <div className="inline-flex items-baseline gap-1 animate-fade-in">
                    <Coins className="w-10 h-10 text-[#FFB800] mb-1" />
                    <span className="text-6xl font-black text-gradient-amber">{currentAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/30 mt-2 font-mono">{t("dailyAmountDesc")}</p>
                </div>

                <div className="flex items-center justify-center gap-3 mb-8">
                  <button
                    onClick={() => adjust(-10)}
                    className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground/40 hover:text-white/60 hover:bg-white/[0.06] transition-all active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => adjust(-1)}
                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-muted-foreground/30 hover:text-white/50 hover:bg-white/[0.05] transition-all text-xs font-mono active:scale-95"
                  >
                    -1
                  </button>

                  <div className="w-36 text-center">
                    <input
                      type="number"
                      min={1}
                      value={currentAmount}
                      onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                      className="w-full text-center text-2xl font-bold font-mono bg-transparent border-none outline-none text-[#8B5CF6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <button
                    onClick={() => adjust(1)}
                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-muted-foreground/30 hover:text-white/50 hover:bg-white/[0.05] transition-all text-xs font-mono active:scale-95"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => adjust(10)}
                    className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground/40 hover:text-white/60 hover:bg-white/[0.06] transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={() => saveConfig.mutate(currentAmount)}
                  disabled={saveConfig.isPending || currentAmount < 1}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#FF006E] hover:from-[#8B5CF6]/80 hover:to-[#FF006E]/80 text-white border-0 px-8 py-2.5 font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all"
                >
                  {saveConfig.isPending ? (
                    t("loading")
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {t("saveConfig")}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
