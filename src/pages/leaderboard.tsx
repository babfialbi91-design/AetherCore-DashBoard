import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Star, Crown, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/hooks/use-language";
import { PageTransition, Stagger, GlowCard, ProgressRing } from "@/components/page-transitions";

async function apiCall<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type LeaderboardEntry = { userId: string; level: number; xp: number; username?: string; avatar?: string };

function PodiumPlace({ entry, rank, height }: { entry: LeaderboardEntry; rank: number; height: string }) {
  const { t } = useLanguage();
  const colors = [
    "from-amber-500/20 via-amber-400/10 to-transparent border-amber-500/30",
    "from-slate-300/15 via-slate-200/8 to-transparent border-slate-300/20",
    "from-orange-500/15 via-orange-400/8 to-transparent border-orange-500/20",
  ];
  const glowClasses = ["glow-amber", "", ""];
  const labelColors = ["text-amber-400", "text-slate-300", "text-orange-400"];

  return (
    <div className={`flex flex-col items-center ${rank === 0 ? "order-2 scale-110 z-10" : rank === 1 ? "order-1" : "order-3"}`}>
      <div className={`animate-float ${rank === 0 ? "animation-delay-0" : rank === 1 ? "animation-delay-200" : "animation-delay-400"}`}>
        <div className="relative mb-4">
          <Avatar className={`${rank === 0 ? "w-20 h-20" : "w-14 h-14"} border-2 ${colors[rank]} ${glowClasses[rank]} transition-all`}>
            <AvatarImage src={entry.avatar || undefined} />
            <AvatarFallback className={`${rank === 0 ? "text-xl" : "text-sm"} bg-white/[0.05] font-bold`}>
              {(entry.username || entry.userId).substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {rank === 0 && (
            <div className="absolute -top-3 -right-1 animate-pulse-neon">
              <Crown className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(255,184,0,0.6)]" />
            </div>
          )}
        </div>
      </div>

      <p className={`font-bold text-sm mb-1 ${labelColors[rank]}`}>{entry.username || "Unknown"}</p>
      <p className="text-[10px] text-muted-foreground/30 font-mono mb-3">{entry.xp.toLocaleString()} XP</p>

      <div className={`w-full ${height} bg-gradient-to-b ${colors[rank]} border rounded-t-2xl flex items-start justify-center pt-4`}>
        <span className={`text-3xl font-black ${labelColors[rank]} opacity-30`}>#{rank + 1}</span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { t } = useLanguage();
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["bot-leaderboard"],
    queryFn: () => apiCall("/api/bot/leaderboard"),
  });

  const top3 = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-amber flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#FFB800]" /> {t("leaderboardTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("leaderboardDesc")}</p>
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-6 items-end">
            {[140, 180, 120].map((h, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full mb-4" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className={`w-full rounded-t-2xl`} style={{ height: h }} />
              </div>
            ))}
          </div>
        ) : top3.length > 0 ? (
          <div className="glass rounded-3xl border border-amber-500/10 p-8 pt-4">
            <div className="grid grid-cols-3 gap-6 items-end max-w-2xl mx-auto">
              {top3[1] && <PodiumPlace entry={top3[1]} rank={1} height="h-28" />}
              {top3[0] && <PodiumPlace entry={top3[0]} rank={0} height="h-36" />}
              {top3[2] && <PodiumPlace entry={top3[2]} rank={2} height="h-22" />}
            </div>
          </div>
        ) : null}
      </PageTransition>

      {rest.length > 0 && (
        <PageTransition delay={200}>
          <div className="glass rounded-3xl border border-white/[0.06] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30">{t("allRanks")}</p>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {rest.map((entry, idx) => {
                const globalRank = idx + 3;
                const xpPercent = Math.min((entry.xp / (leaderboard?.[0]?.xp || 1)) * 100, 100);
                return (
                  <div key={entry.userId} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all group">
                    <span className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[11px] font-bold text-muted-foreground/40 font-mono">
                      {globalRank + 1}
                    </span>

                    <Avatar className="w-9 h-9 border border-white/[0.08]">
                      <AvatarImage src={entry.avatar || undefined} />
                      <AvatarFallback className="text-[10px] bg-white/[0.05]">
                        {(entry.username || entry.userId).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm group-hover:text-foreground transition-colors truncate">{entry.username || "Unknown"}</p>
                        <Badge variant="outline" className="font-mono bg-violet-500/5 text-[#8B5CF6] border-violet-500/15 text-[10px] shrink-0">
                          Lv.{entry.level}
                        </Badge>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400/60 transition-all duration-700"
                          style={{ width: `${xpPercent}%` }}
                        />
                      </div>
                    </div>

                    <span className="font-mono font-bold text-sm text-[#FFB800] shrink-0">{entry.xp.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </PageTransition>
      )}

      {!isLoading && leaderboard?.length === 0 && (
        <div className="py-16 text-center text-muted-foreground/30 rounded-3xl border border-white/[0.04] border-dashed bg-white/[0.01]">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>{t("noLeaderboardData")}</p>
        </div>
      )}
    </div>
  );
}
