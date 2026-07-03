import React from "react";
import { useGetBotStats, useGetBotLeaderboard, useGetBotLfgSessions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Clock, Terminal, Trophy, Swords } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Overview() {
  const { data: stats, isLoading: statsLoading } = useGetBotStats();
  const { data: leaderboard, isLoading: leaderboardLoading } = useGetBotLeaderboard();
  const { data: lfgSessions, isLoading: lfgLoading } = useGetBotLfgSessions();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-2">Monitor bot performance and server metrics.</p>
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
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Members</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary-foreground">{stats.memberCount?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">In {stats.guildName || "Primary Guild"}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/5 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Commands Run</CardTitle>
              <Terminal className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary-foreground">{stats.commandCount?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Since last restart</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/5 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gateway Ping</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary-foreground">{stats.ping || 0}ms</div>
              <p className="text-xs text-muted-foreground mt-1">Discord WebSocket</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/5 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary-foreground">{stats.uptime != null ? `${Math.floor((stats.uptime as number) / 3600)}h` : "0h"}</div>
              <p className="text-xs text-muted-foreground mt-1">Online duration</p>
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
                Top Players
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
                      <span className="text-muted-foreground">Lvl {entry.level}</span>
                      <span className="text-primary">{entry.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground p-8">No leaderboard data found.</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Swords className="w-5 h-5 text-blue-400" />
                Recent LFG Sessions
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
              <div className="h-full flex items-center justify-center text-muted-foreground p-8">No active LFG sessions.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
