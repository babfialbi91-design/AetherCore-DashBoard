import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Bell, Save } from "lucide-react";
import { PageTransition, Stagger } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const TEMPLATE_KEYS: { key: string; label: string }[] = [
  { key: "levelUp", label: "Level Up" },
  { key: "dailyClaim", label: "Daily Claim" },
  { key: "shopPurchase", label: "Shop Purchase" },
  { key: "welcome", label: "Welcome" },
  { key: "boost", label: "Server Boost" },
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
          <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
            <Bell className="w-8 h-8 text-cyan" /> {t("notificationsTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("notificationsDesc")}</p>
        </div>
      </PageTransition>

      <Stagger className="space-y-5" staggerMs={80}>
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />) :
        TEMPLATE_KEYS.length > 0 ? TEMPLATE_KEYS.map(({ key, label }) => (
          <Card key={key}>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="w-4 h-4 text-cyan" />{label}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[10px] text-muted-foreground/30 font-mono">{key}</p>
              <Textarea value={templates[key] || ""} onChange={(e) => setTemplates((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={`${label} notification template...`} className="min-h-[80px] resize-none font-mono text-sm" />
              <Button onClick={() => saveTemplate.mutate({ key, template: templates[key] || "" })} disabled={saveTemplate.isPending}>
                <Save className="w-4 h-4 mr-2" />{saveTemplate.isPending ? t("saving") : t("notificationsSave")}
              </Button>
            </CardContent>
          </Card>
        )) : (
          <div className="py-16 text-center text-muted-foreground/30 rounded-2xl border border-white/[0.04] border-dashed bg-white/[0.01]">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>{t("notificationsNoData")}</p>
          </div>
        )}
      </Stagger>
    </div>
  );
}
