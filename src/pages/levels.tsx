import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { TrendingUp, Save } from "lucide-react";
import { PageTransition, GlowCard } from "@/components/page-transitions";

type Channel = { id: string; name: string; type: number };
type LevelsConfig = { channelId: string; cardStyle: string; accentColor: string };
const CARD_STYLES = ["classic", "modern", "minimal", "bold", "gradient"];

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function Levels() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [cardStyle, setCardStyle] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const { data: config, isLoading } = useQuery({ queryKey: ["levels-config"], queryFn: () => apiCall<LevelsConfig>("/api/bot/levels/config") });
  const { data: channels, isLoading: channelsLoading } = useQuery({ queryKey: ["channels"], queryFn: () => apiCall<Channel[]>("/api/bot/channels") });

  const saveChannel = useMutation({
    mutationFn: (channelId: string | null) =>
      apiCall("/api/bot/levels/config", { method: "POST", body: JSON.stringify({ channelId }) }),
    onSuccess: () => {
      toast({ title: t("configSaved") });
      queryClient.invalidateQueries({ queryKey: ["levels-config"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const saveStyle = useMutation({
    mutationFn: (data: { cardStyle: string; accentColor: string }) =>
      apiCall("/api/bot/levels/style", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: t("configSaved") });
      queryClient.invalidateQueries({ queryKey: ["levels-config"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const [selectedChannel, setSelectedChannel] = useState<string | undefined>(undefined);
  const currentChannel = selectedChannel ?? config?.channelId ?? "";
  const currentStyle = cardStyle || config?.cardStyle || "modern";
  const currentColor = accentColor || config?.accentColor || "#7c3aed";

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cyan" /> {t("levelsTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("levelsDesc")}</p>
        </div>
      </PageTransition>

      {isLoading ? <div className="space-y-6"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div> : (
        <>
          <PageTransition delay={100}>
            <GlowCard color="cyan">
              <Card className="border-0 bg-transparent">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-4 h-4 text-cyan" />{t("levelsChannel")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground/50">{t("levelsChannelDesc")}</p>
                  <div className="flex items-center gap-4">
                    <Select value={currentChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger className="max-w-sm"><SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} /></SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">{channels?.map((ch) => (<SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <Button onClick={() => saveChannel.mutate(currentChannel || null)} disabled={saveChannel.isPending || !currentChannel}>
                      <Save className="w-4 h-4 mr-2" />{saveChannel.isPending ? t("saving") : t("levelsSaveChannel")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </GlowCard>
          </PageTransition>

          <PageTransition delay={200}>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-4 h-4 text-cyan" />{t("levelsCardStyle")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider">{t("levelsCardStyle")}</label>
                    <Select value={currentStyle} onValueChange={setCardStyle}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CARD_STYLES.map((style) => (<SelectItem key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider">{t("levelsAccentColor")}</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={currentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer bg-transparent" />
                      <Input value={currentColor} onChange={(e) => setAccentColor(e.target.value)} placeholder="#7c3aed" className="font-mono max-w-[140px]" />
                    </div>
                  </div>
                </div>
                <Button onClick={() => saveStyle.mutate({ cardStyle: currentStyle, accentColor: currentColor })} disabled={saveStyle.isPending}>
                  <Save className="w-4 h-4 mr-2" />{saveStyle.isPending ? t("saving") : t("levelsSaveStyle")}
                </Button>
              </CardContent>
            </Card>
          </PageTransition>
        </>
      )}
    </div>
  );
}
