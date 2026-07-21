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

type Channel = { id: string; name: string; type: number };
type LevelsConfig = { channelId: string; cardStyle: string; accentColor: string };

const CARD_STYLES = ["classic", "modern", "minimal", "bold", "gradient"];

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function Levels() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [cardStyle, setCardStyle] = useState("");
  const [accentColor, setAccentColor] = useState("");

  const { data: config, isLoading } = useQuery({
    queryKey: ["levels-config"],
    queryFn: () => apiCall<LevelsConfig>("/api/bot/levels/config"),
  });

  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: () => apiCall<Channel[]>("/api/bot/channels"),
  });

  const saveChannel = useMutation({
    mutationFn: (channelId: string | null) =>
      apiCall("/api/bot/levels/config", {
        method: "POST",
        body: JSON.stringify({ channelId }),
      }),
    onSuccess: () => {
      toast({ title: t("configSaved") });
      queryClient.invalidateQueries({ queryKey: ["levels-config"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const saveStyle = useMutation({
    mutationFn: (data: { cardStyle: string; accentColor: string }) =>
      apiCall("/api/bot/levels/style", {
        method: "POST",
        body: JSON.stringify(data),
      }),
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          {t("levelsTitle")}
        </h2>
        <p className="text-muted-foreground mt-2">{t("levelsDesc")}</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <>
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t("levelsChannel")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("levelsChannelDesc")}</p>
              <div className="flex items-center gap-4">
                <Select
                  value={currentChannel}
                  onValueChange={(val) => {
                    setSelectedChannel(val);
                  }}
                >
                  <SelectTrigger className="bg-background/50 max-w-sm" data-testid="select-levels-channel">
                    <SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {channels?.map((ch) => (
                      <SelectItem key={ch.id} value={ch.id} data-testid={`option-channel-${ch.id}`}>
                        # {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => saveChannel.mutate(currentChannel || null)}
                  disabled={saveChannel.isPending || !currentChannel}
                  data-testid="button-levels-save-channel"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveChannel.isPending ? t("saving") : t("levelsSaveChannel")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t("levelsCardStyle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{t("levelsCardStyle")}</label>
                  <Select value={currentStyle} onValueChange={setCardStyle}>
                    <SelectTrigger className="bg-background/50" data-testid="select-levels-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CARD_STYLES.map((style) => (
                        <SelectItem key={style} value={style} data-testid={`option-style-${style}`}>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">{t("levelsAccentColor")}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded border-0 cursor-pointer bg-transparent"
                      data-testid="input-levels-color-picker"
                    />
                    <Input
                      value={currentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#7c3aed"
                      className="bg-background/50 font-mono max-w-[140px]"
                      data-testid="input-levels-color"
                    />
                  </div>
                </div>
              </div>
              <Button
                onClick={() => saveStyle.mutate({ cardStyle: currentStyle, accentColor: currentColor })}
                disabled={saveStyle.isPending}
                data-testid="button-levels-save-style"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveStyle.isPending ? t("saving") : t("levelsSaveStyle")}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
