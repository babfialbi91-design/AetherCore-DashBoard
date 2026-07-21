import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Clock, Terminal, Trophy, Swords } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";

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
};

type LfgSession = {
  id: string;
  game: string;
  description: string;
  hostId: string;
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
    queryFn: () => apiCall("/api/bot/lfg/sessions"),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("overviewTitle")}</h2>
        <p className="text-muted-foreground mt-2">{t("overviewDesc")}</p>
      </div>

      {statsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-white/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 border-white/5 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("totalMembers")}</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary-foreground">{stats.memberCount?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("inGuild", { guild: stats.guildName || "Primary Guild" })}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/5 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("commandsRun")}</CardTitle>
              <Terminal className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary-foreground">{stats.commandCount?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("sinceRestart")}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/5 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("gatewayPing")}</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary-foreground">{stats.ping || 0}ms</div>
              <p className="text-xs text-muted-foreground mt-1">{t("discordWs")}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/5 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("uptime")}</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary-foreground">{stats.uptime != null ? `${Math.floor((stats.uptime as number) / 3600)}h` : "0h"}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("onlineDuration")}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 border-white/5 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
                {t("topPlayers")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {leaderboardLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.slice(0, 5).map((entry, idx) => (
                  <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                        #{idx + 1}
                      </div>
                      <span className="font-medium text-sm">User {entry.userId.slice(-4)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-mono">
                      <span className="text-muted-foreground">{t("level")} {entry.level}</span>
                      <span className="text-primary">{entry.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground p-8">{t("noLeaderboard")}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Swords className="w-5 h-5 text-blue-400" />
                {t("recentLfg")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {lfgLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : lfgSessions && lfgSessions.length > 0 ? (
              <div className="space-y-4">
                {lfgSessions.slice(0, 4).map((session) => (
                  <div key={session.id} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm tracking-wide text-primary-foreground">{session.game}</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-mono">
                        {session.participants.length} / {session.playersNeeded}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{session.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground p-8">{t("noLfg")}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
