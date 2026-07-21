import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { ScrollText, Save } from "lucide-react";
import { PageTransition, GlowCard } from "@/components/page-transitions";

type Channel = { id: string; name: string; type: number };
type LogsConfig = { channelId: string | null };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function Logs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { data: config, isLoading } = useQuery({ queryKey: ["logs-config"], queryFn: () => apiCall<LogsConfig>("/api/bot/logs/config") });
  const { data: channels, isLoading: channelsLoading } = useQuery({ queryKey: ["channels"], queryFn: () => apiCall<Channel[]>("/api/bot/channels") });

  const saveConfig = useMutation({
    mutationFn: (channelId: string | null) => apiCall("/api/bot/logs/config", { method: "POST", body: JSON.stringify({ channelId }) }),
    onSuccess: () => {
      toast({ title: t("logsSaved") });
      queryClient.invalidateQueries({ queryKey: ["logs-config"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-cyan" /> {t("logsTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("logsDesc")}</p>
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <GlowCard color="cyan">
          <Card className="border-0 bg-transparent">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ScrollText className="w-4 h-4 text-cyan" />{t("logsChannel")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? <Skeleton className="h-10 w-64" /> : (
                <>
                  <p className="text-sm text-muted-foreground/50">{t("logsChannelDesc")}</p>
                  <Select value={config?.channelId || undefined} onValueChange={(val) => queryClient.setQueryData(["logs-config"], { channelId: val })}>
                    <SelectTrigger className="max-w-sm"><SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} /></SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">{channels?.map((ch) => (<SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>))}</SelectContent>
                  </Select>
                </>
              )}
            </CardContent>
          </Card>
        </GlowCard>
      </PageTransition>

      {!isLoading && (
        <Button onClick={() => saveConfig.mutate(config?.channelId || null)} disabled={saveConfig.isPending}>
          <Save className="w-4 h-4 mr-2" />{saveConfig.isPending ? t("saving") : t("logsSave")}
        </Button>
      )}
    </div>
  );
}
