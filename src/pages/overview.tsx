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

type BotStats = { memberCount?: number; guildName?: string; commandCount?: number; ping?: number; uptime?: number };
type LeaderboardEntry = { userId: string; level: number; xp: number; username?: string; avatar?: string };
type LfgSession = { id: string; game: string; description: string; hostId: string; host?: { id: string; displayName?: string; avatar?: string }; participants: string[]; playersNeeded: number; createdAt: string };

export default function Overview() {
  const { t } = useLanguage();
  const { data: stats, isLoading: statsLoading } = useQuery<BotStats>({ queryKey: ["bot-stats"], queryFn: () => apiCall("/api/bot/stats") });
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({ queryKey: ["bot-leaderboard"], queryFn: () => apiCall("/api/bot/leaderboard") });
  const { data: lfgSessions, isLoading: lfgLoading } = useQuery<LfgSession[]>({ queryKey: ["bot-lfg-sessions"], queryFn: () => apiCall("/api/bot/lfg") });

  const statCards = stats ? [
    { label: t("totalMembers"), value: stats.memberCount?.toLocaleString() || "0", sub: t("inGuild", { guild: stats.guildName || "Server" }), icon: Users, color: "cyan" },
    { label: t("commandsRun"), value: stats.commandCount?.toLocaleString() || "0", sub: t("sinceRestart"), icon: Terminal, color: "blue" },
    { label: t("gatewayPing"), value: `${stats.ping || 0}ms`, sub: t("discordWs"), icon: Activity, color: "green" },
    { label: t("uptime"), value: stats.uptime != null ? `${Math.floor((stats.uptime as number) / 3600)}h` : "0h", sub: t("onlineDuration"), icon: Clock, color: "yellow" },
  ] : [];

  const colorMap: Record<string, string> = {
    cyan: "from-cyan/15 to-cyan/5 text-cyan border-cyan/15",
    blue: "from-blue-500/15 to-blue-500/5 text-blue-400 border-blue-500/15",
    green: "from-green-500/15 to-green-500/5 text-green-400 border-green-500/15",
    yellow: "from-yellow-500/15 to-yellow-500/5 text-yellow-400 border-yellow-500/15",
  };

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber">{t("overviewTitle")}</h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("overviewDesc")}</p>
        </div>
      </PageTransition>

      {statsLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>)}
        </div>
      ) : stats ? (
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <GlowCard key={i} color={s.color}>
              <Card className="border-0 bg-transparent">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">{s.label}</span>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorMap[s.color]} flex items-center justify-center border`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono tracking-tight">{s.value}</div>
                  <p className="text-[11px] text-muted-foreground/40 mt-1">{s.sub}</p>
                </CardContent>
              </Card>
            </GlowCard>
          ))}
        </Stagger>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <PageTransition delay={200}>
          <GlowCard color="yellow" className="h-full">
            <Card className="border-0 bg-transparent h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/15">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  </div>
                  {t("topPlayers")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {leaderboardLoading ? (
                  <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((entry, idx) => (
                      <div key={entry.userId} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all group">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                            idx === 0 ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" :
                            idx === 1 ? "bg-gray-300/10 text-gray-300 border border-gray-300/15" :
                            idx === 2 ? "bg-orange-500/10 text-orange-400 border border-orange-500/15" :
                            "bg-white/[0.03] text-muted-foreground/50 border border-white/[0.06]"
                          }`}>
                            {idx + 1}
                          </div>
                          <Avatar className="w-7 h-7 border border-white/[0.08]">
                            <AvatarImage src={entry.avatar || undefined} />
                            <AvatarFallback className="text-[9px] bg-white/[0.05]">{(entry.username || entry.userId).substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium group-hover:text-foreground transition-colors">{entry.username || `User ${entry.userId.slice(-4)}`}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="text-muted-foreground/40">LV {entry.level}</span>
                          <span className="text-cyan font-bold">{entry.xp.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground/40 p-8">{t("noLeaderboard")}</div>
                )}
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>

        <PageTransition delay={300}>
          <GlowCard color="cyan" className="h-full">
            <Card className="border-0 bg-transparent h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center border border-cyan/15">
                    <Swords className="w-4 h-4 text-cyan" />
                  </div>
                  {t("recentLfg")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {lfgLoading ? (
                  <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
                ) : lfgSessions && lfgSessions.length > 0 ? (
                  <div className="space-y-2">
                    {lfgSessions.slice(0, 4).map((session) => (
                      <div key={session.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm">{session.game}</span>
                          <span className="text-[11px] bg-cyan/10 text-cyan px-2.5 py-0.5 rounded-full font-mono border border-cyan/15">
                            {session.participants.length}/{session.playersNeeded}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/50 truncate mb-2">{session.description}</p>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5 border border-white/[0.08]">
                            <AvatarImage src={session.host?.avatar || undefined} />
                            <AvatarFallback className="text-[8px] bg-white/[0.05]">?</AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] text-muted-foreground/40">{session.host?.displayName || session.hostId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground/40 p-8">{t("noLfg")}</div>
                )}
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>
      </div>
    </div>
  );
}
