import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Calendar, Coins, Save } from "lucide-react";
import { useState } from "react";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function Daily() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>("");

  const { data: config, isLoading } = useQuery({
    queryKey: ["daily-config"],
    queryFn: () => apiCall<{ dailyAmount: number }>("/api/bot/daily/config"),
  });

  const saveConfig = useMutation({
    mutationFn: (dailyAmount: number) =>
      apiCall("/api/bot/daily/config", {
        method: "POST",
        body: JSON.stringify({ dailyAmount }),
      }),
    onSuccess: () => {
      toast({ title: t("configSaved") });
      queryClient.invalidateQueries({ queryKey: ["daily-config"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const currentAmount = amount !== "" ? Number(amount) : config?.dailyAmount ?? 100;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            {t("dailyTitle")}
          </h2>
          <p className="text-muted-foreground mt-2">{t("dailyDesc")}</p>
        </div>
      </div>

      <Card className="bg-card/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("dailyAmount")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-10 w-64" />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{t("dailyAmountDesc")}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <Input
                    type="number"
                    min={1}
                    value={amount !== "" ? amount : config?.dailyAmount ?? 100}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-48 bg-background/50 font-mono"
                  />
                </div>
                <Button
                  onClick={() => saveConfig.mutate(currentAmount)}
                  disabled={saveConfig.isPending || currentAmount < 1}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveConfig.isPending ? t("loading") : t("saveConfig")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
