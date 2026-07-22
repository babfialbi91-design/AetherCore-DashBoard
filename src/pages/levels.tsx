import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { TrendingUp, Save, Palette, Layers, Check } from "lucide-react";
import { PageTransition, GlowCard } from "@/components/page-transitions";

type Channel = { id: string; name: string; type: number };
type LevelsConfig = { channelId: string; cardStyle: string; accentColor: string };
const CARD_STYLES = ["classic", "modern", "minimal", "bold", "gradient"] as const;
const STYLE_COLORS: Record<string, string> = {
  classic: "border-violet/30 bg-violet/10",
  modern: "border-cyan-bright/30 bg-cyan-bright/10",
  minimal: "border-white/10 bg-white/[0.03]",
  bold: "border-rose/30 bg-rose/10",
  gradient: "border-amber/30 bg-amber/10",
};

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
  const [selectedChannel, setSelectedChannel] = useState<string | undefined>(undefined);

  const { data: config, isLoading } = useQuery({ queryKey: ["levels-config"], queryFn: () => apiCall<LevelsConfig>("/api/bot/levels/config") });
  const { data: channels, isLoading: channelsLoading } = useQuery({ queryKey: ["channels"], queryFn: () => apiCall<Channel[]>("/api/bot/channels") });

  const saveChannel = useMutation({
    mutationFn: (channelId: string | null) => apiCall("/api/bot/levels/config", { method: "POST", body: JSON.stringify({ channelId }) }),
    onSuccess: () => { toast({ title: t("configSaved") }); queryClient.invalidateQueries({ queryKey: ["levels-config"] }); },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const saveStyle = useMutation({
    mutationFn: (data: { cardStyle: string; accentColor: string }) => apiCall("/api/bot/levels/style", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { toast({ title: t("configSaved") }); queryClient.invalidateQueries({ queryKey: ["levels-config"] }); },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const currentChannel = selectedChannel ?? config?.channelId ?? "";
  const currentStyle = cardStyle || config?.cardStyle || "modern";
  const currentColor = accentColor || config?.accentColor || "#8B5CF6";

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-magenta/10 border border-magenta/20 animate-float">
            <TrendingUp className="w-7 h-7 text-magenta" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-magenta">{t("levelsTitle")}</h2>
            <p className="text-muted-foreground/60 mt-1 text-sm">{t("levelsDesc")}</p>
          </div>
        </div>
      </PageTransition>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      ) : (
        <>
          <PageTransition delay={100}>
            <GlowCard color="magenta">
              <Card className="border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-magenta/10 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-magenta" />
                    </div>
                    {t("levelsChannel")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground/50">{t("levelsChannelDesc")}</p>
                  <div className="flex items-center gap-4">
                    <Select value={currentChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger className="max-w-sm rounded-xl border-white/[0.06] bg-white/[0.02] focus:border-magenta/40 focus:ring-magenta/20">
                        <SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto rounded-xl">
                        {channels?.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => saveChannel.mutate(currentChannel || null)}
                      disabled={saveChannel.isPending || !currentChannel}
                      className="rounded-xl bg-magenta/20 hover:bg-magenta/30 text-magenta border border-magenta/30 transition-all hover:shadow-[0_0_20px_rgba(255,0,110,0.2)]"
                    >
                      <Save className="w-4 h-4 mr-2" />{saveChannel.isPending ? t("saving") : t("levelsSaveChannel")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </GlowCard>
          </PageTransition>

          <PageTransition delay={200}>
            <Card className="rounded-3xl border-white/[0.06] bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-magenta/10 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-magenta" />
                  </div>
                  {t("levelsCardStyle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs text-magenta/70 font-semibold uppercase tracking-wider">{t("levelsCardStyle")}</label>
                  <div className="grid grid-cols-5 gap-3">
                    {CARD_STYLES.map((style) => {
                      const active = currentStyle === style;
                      return (
                        <button
                          key={style}
                          onClick={() => setCardStyle(style)}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                            active
                              ? `${STYLE_COLORS[style]} shadow-lg`
                              : "border-white/[0.04] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.03]"
                          }`}
                        >
                          {active && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-magenta/20 flex items-center justify-center">
                              <Check className="w-3 h-3 text-magenta" />
                            </div>
                          )}
                          <div className={`w-10 h-10 rounded-xl border ${STYLE_COLORS[style]} flex items-center justify-center`}>
                            <Layers className="w-4 h-4 text-foreground/60" />
                          </div>
                          <span className={`text-xs font-medium capitalize ${active ? "text-foreground" : "text-muted-foreground/50"}`}>{style}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-magenta/70 font-semibold uppercase tracking-wider">{t("levelsAccentColor")}</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-12 rounded-xl border-2 border-white/[0.08] cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0.5"
                      />
                    </div>
                    <Input
                      value={currentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#8B5CF6"
                      className="font-mono max-w-[140px] rounded-xl border-white/[0.06] bg-white/[0.02] focus:border-magenta/40 focus:ring-magenta/20"
                    />
                    <div
                      className="w-10 h-10 rounded-xl border border-white/[0.08] animate-pulse-neon"
                      style={{ background: currentColor, boxShadow: `0 0 20px ${currentColor}40` }}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => saveStyle.mutate({ cardStyle: currentStyle, accentColor: currentColor })}
                  disabled={saveStyle.isPending}
                  className="rounded-xl bg-magenta/20 hover:bg-magenta/30 text-magenta border border-magenta/30 transition-all hover:shadow-[0_0_20px_rgba(255,0,110,0.2)]"
                >
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
