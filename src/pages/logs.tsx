import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { ScrollText, Save, Check, Hash } from "lucide-react";
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
  const [selectedChannel, setSelectedChannel] = useState<string | undefined>(undefined);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: config, isLoading } = useQuery({ queryKey: ["logs-config"], queryFn: () => apiCall<LogsConfig>("/api/bot/logs/config") });
  const { data: channels, isLoading: channelsLoading } = useQuery({ queryKey: ["channels"], queryFn: () => apiCall<Channel[]>("/api/bot/channels") });

  const currentChannel = selectedChannel ?? config?.channelId ?? "";

  const saveConfig = useMutation({
    mutationFn: (channelId: string | null) => apiCall("/api/bot/logs/config", { method: "POST", body: JSON.stringify({ channelId }) }),
    onSuccess: () => {
      toast({ title: t("logsSaved") });
      queryClient.invalidateQueries({ queryKey: ["logs-config"] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber/10 border border-amber/20 animate-float">
            <ScrollText className="w-7 h-7 text-amber" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-amber">{t("logsTitle")}</h2>
            <p className="text-muted-foreground/60 mt-1 text-sm">{t("logsDesc")}</p>
          </div>
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <GlowCard color="amber">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
                  <Hash className="w-4 h-4 text-amber" />
                </div>
                {t("logsChannel")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {isLoading ? (
                <Skeleton className="h-10 w-64 rounded-xl" />
              ) : (
                <>
                  <p className="text-sm text-muted-foreground/50">{t("logsChannelDesc")}</p>
                  <Select
                    value={currentChannel}
                    onValueChange={(val) => {
                      setSelectedChannel(val);
                      setSaveSuccess(false);
                    }}
                  >
                    <SelectTrigger className="max-w-sm rounded-xl border-white/[0.06] bg-white/[0.02] focus:border-amber/40 focus:ring-amber/20">
                      <SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto rounded-xl">
                      {channels?.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => saveConfig.mutate(currentChannel || null)}
                    disabled={saveConfig.isPending || !currentChannel}
                    className={`rounded-xl transition-all ${
                      saveSuccess
                        ? "bg-emerald/20 hover:bg-emerald/30 text-emerald border border-emerald/30"
                        : "bg-amber/20 hover:bg-amber/30 text-amber border border-amber/30 hover:shadow-[0_0_20px_rgba(255,184,0,0.2)]"
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />{saveConfig.isPending ? t("saving") : t("logsSave")}
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </GlowCard>
      </PageTransition>
    </div>
  );
}
