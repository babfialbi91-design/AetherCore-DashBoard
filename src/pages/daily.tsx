import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Calendar, Coins, Save } from "lucide-react";
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
  const [amount, setAmount] = useState<string>("");
  const { data: config, isLoading } = useQuery({ queryKey: ["daily-config"], queryFn: () => apiCall<{ dailyAmount: number }>("/api/bot/daily/config") });

  const saveConfig = useMutation({
    mutationFn: (dailyAmount: number) => apiCall("/api/bot/daily/config", { method: "POST", body: JSON.stringify({ dailyAmount }) }),
    onSuccess: () => {
      toast({ title: t("configSaved") });
      queryClient.invalidateQueries({ queryKey: ["daily-config"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const currentAmount = amount !== "" ? Number(amount) : config?.dailyAmount ?? 100;

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
            <Calendar className="w-8 h-8 text-cyan" /> {t("dailyTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("dailyDesc")}</p>
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <GlowCard color="cyan">
          <Card className="border-0 bg-transparent">
            <CardHeader><CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">{t("dailyAmount")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? <Skeleton className="h-10 w-64" /> : (
                <>
                  <p className="text-sm text-muted-foreground/50">{t("dailyAmountDesc")}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-cyan" />
                      <Input type="number" min={1} value={amount !== "" ? amount : config?.dailyAmount ?? 100} onChange={(e) => setAmount(e.target.value)} className="w-48 font-mono" />
                    </div>
                    <Button onClick={() => saveConfig.mutate(currentAmount)} disabled={saveConfig.isPending || currentAmount < 1}>
                      <Save className="w-4 h-4 mr-2" />{saveConfig.isPending ? t("loading") : t("saveConfig")}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </GlowCard>
      </PageTransition>
    </div>
  );
}
