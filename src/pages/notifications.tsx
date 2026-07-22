import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Bell, Save, Sparkles, ShoppingBag, Coffee, PartyPopper, Zap } from "lucide-react";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const TEMPLATE_KEYS: { key: string; label: string; icon: typeof Bell; gradient: string; glow: string }[] = [
  { key: "levelUp", label: "Level Up", icon: Sparkles, gradient: "text-gradient-violet", glow: "glow-violet" },
  { key: "dailyClaim", label: "Daily Claim", icon: Coffee, gradient: "text-gradient-amber", glow: "glow-amber" },
  { key: "shopPurchase", label: "Shop Purchase", icon: ShoppingBag, gradient: "text-gradient-magenta", glow: "glow-magenta" },
  { key: "welcome", label: "Welcome", icon: PartyPopper, gradient: "text-gradient-cyan", glow: "glow-cyan" },
  { key: "boost", label: "Server Boost", icon: Zap, gradient: "text-gradient-nebula", glow: "glow-magenta" },
];

export default function Notifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: () => apiCall<Record<string, string>>("/api/bot/notifications") });
  useEffect(() => { if (data) setTemplates(data); }, [data]);

  const saveTemplate = useMutation({
    mutationFn: (body: { key: string; template: string }) => apiCall<{ ok: boolean }>("/api/bot/notifications", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: t("notificationsSaved") });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-nebula flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF006E]/10 flex items-center justify-center animate-float">
              <Bell className="w-5 h-5 text-[#FF006E]" />
            </div>
            {t("notificationsTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("notificationsDesc")}</p>
        </div>
      </PageTransition>

      <Stagger className="space-y-5" staggerMs={100}>
        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-3xl" />
        )) : (
          TEMPLATE_KEYS.map(({ key, label, icon: Icon, gradient, glow }) => (
            <GlowCard key={key} color={gradient.includes("violet") ? "violet" : gradient.includes("amber") ? "amber" : gradient.includes("magenta") ? "magenta" : "cyan"}>
              <Card className={`rounded-3xl border-white/[0.06] bg-white/[0.02] glass ${glow} overflow-hidden`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center`}>
                      <Icon className="w-4.5 h-4.5 text-muted-foreground/70" />
                    </div>
                    <span className={gradient}>{label}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-[10px] text-muted-foreground/30 font-mono tracking-wider">{key}</p>
                  <Textarea
                    value={templates[key] || ""}
                    onChange={(e) => setTemplates((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`${label} notification template...`}
                    className="min-h-[88px] resize-none font-mono text-sm bg-white/[0.02] border-white/[0.06] rounded-xl"
                  />
                  <Button
                    onClick={() => saveTemplate.mutate({ key, template: templates[key] || "" })}
                    disabled={saveTemplate.isPending}
                    className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.08] text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveTemplate.isPending ? t("saving") : t("notificationsSave")}
                  </Button>
                </CardContent>
              </Card>
            </GlowCard>
          ))
        )}
      </Stagger>

      {!isLoading && TEMPLATE_KEYS.length === 0 && (
        <div className="py-20 text-center rounded-3xl border border-dashed border-white/[0.06] bg-white/[0.01] animate-fade-in">
          <Bell className="w-14 h-14 mx-auto mb-4 text-muted-foreground/15" />
          <p className="text-muted-foreground/30 text-sm">{t("notificationsNoData")}</p>
        </div>
      )}
    </div>
  );
}
