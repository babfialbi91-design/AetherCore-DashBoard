import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Clock, Terminal, Trophy, Swords } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/hooks/use-language";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type BotStats = {
  memberCount?: number;
  guildName?: string;
  commandCount?: number;
  ping?: number;
  uptime?: number;
};

type LeaderboardEntry = {
  userId: string;
  level: number;
  xp: number;
  username?: string;
  avatar?: string;
};

type LfgSession = {
  id: string;
  game: string;
  description: string;
  hostId: string;
  host?: { id: string; displayName?: string; avatar?: string };
  participants: string[];
  playersNeeded: number;
  createdAt: string;
};

export default function Overview() {
  const { t } = useLanguage();
  const { data: stats, isLoading: statsLoading } = useQuery<BotStats>({
    queryKey: ["bot-stats"],
    queryFn: () => apiCall("/api/bot/stats"),
  });
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["bot-leaderboard"],
    queryFn: () => apiCall("/api/bot/leaderboard"),
  });
  const { data: lfgSessions, isLoading: lfgLoading } = useQuery<LfgSession[]>({
    queryKey: ["bot-lfg-sessions"],
    queryFn: () => apiCall("/api/bot/lfg"),
  });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">{t("overviewTitle")}</h2>
          <p className="text-muted-foreground mt-2">{t("overviewDesc")}</p>
        </div>
      </PageTransition>

      {statsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : stats ? (
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <GlowCard color="primary">
            <Card className="border-0 bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("totalMembers")}</CardTitle>
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{stats.memberCount?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{t("inGuild", { guild: stats.guildName || "Primary Guild" })}</p>
              </CardContent>
            </Card>
          </GlowCard>
          <GlowCard color="blue">
            <Card className="border-0 bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("commandsRun")}</CardTitle>
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><Terminal className="h-4 w-4 text-blue-400" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{stats.commandCount?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{t("sinceRestart")}</p>
              </CardContent>
            </Card>
          </GlowCard>
          <GlowCard color="green">
            <Card className="border-0 bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("gatewayPing")}</CardTitle>
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center"><Activity className="h-4 w-4 text-green-400" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{stats.ping || 0}ms</div>
                <p className="text-xs text-muted-foreground mt-1">{t("discordWs")}</p>
              </CardContent>
            </Card>
          </GlowCard>
          <GlowCard color="yellow">
            <Card className="border-0 bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("uptime")}</CardTitle>
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center"><Clock className="h-4 w-4 text-yellow-400" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{stats.uptime != null ? `${Math.floor((stats.uptime as number) / 3600)}h` : "0h"}</div>
                <p className="text-xs text-muted-foreground mt-1">{t("onlineDuration")}</p>
              </CardContent>
            </Card>
          </GlowCard>
        </Stagger>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <PageTransition delay={200}>
          <GlowCard color="yellow" className="h-full">
            <Card className="border-0 bg-transparent h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center"><Trophy className="w-4 h-4 text-yellow-400" /></div>
                  {t("topPlayers")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {leaderboardLoading ? (
                  <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((entry, idx) => (
                      <div key={entry.userId} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all hover:border-white/10 group">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            idx === 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                            idx === 1 ? "bg-gray-300/20 text-gray-300 border border-gray-300/30" :
                            idx === 2 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                            "bg-white/5 text-muted-foreground border border-white/10"
                          }`}>
                            #{idx + 1}
                          </div>
                          <Avatar className="w-8 h-8 border border-white/10">
                            <AvatarImage src={entry.avatar || undefined} />
                            <AvatarFallback className="text-xs bg-white/5">{(entry.username || entry.userId).substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm group-hover:text-foreground transition-colors">{entry.username || `User ${entry.userId.slice(-4)}`}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-mono">
                          <span className="text-muted-foreground">{t("level")} {entry.level}</span>
                          <span className="text-primary font-bold">{entry.xp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground p-8">{t("noLeaderboard")}</div>
                )}
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>

        <PageTransition delay={300}>
          <GlowCard color="blue" className="h-full">
            <Card className="border-0 bg-transparent h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Swords className="w-4 h-4 text-blue-400" /></div>
                  {t("recentLfg")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {lfgLoading ? (
                  <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
                ) : lfgSessions && lfgSessions.length > 0 ? (
                  <div className="space-y-3">
                    {lfgSessions.slice(0, 4).map((session) => (
                      <div key={session.id} className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all hover:border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm tracking-wide">{session.game}</span>
                          <span className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-mono">
                            {session.participants.length} / {session.playersNeeded}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{session.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="w-5 h-5 border border-white/10">
                            <AvatarImage src={session.host?.avatar || undefined} />
                            <AvatarFallback className="text-[8px] bg-white/5">?</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{session.host?.displayName || session.hostId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground p-8">{t("noLfg")}</div>
                )}
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>
      </div>
    </div>
  );
}
