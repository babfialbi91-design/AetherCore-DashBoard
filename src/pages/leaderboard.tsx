import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/hooks/use-language";
import { PageTransition, Stagger } from "@/components/page-transitions";

async function apiCall<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type LeaderboardEntry = { userId: string; level: number; xp: number; username?: string; avatar?: string };

export default function Leaderboard() {
  const { t } = useLanguage();
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({ queryKey: ["bot-leaderboard"], queryFn: () => apiCall("/api/bot/leaderboard") });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
            <Trophy className="w-8 h-8 text-cyan" /> {t("leaderboardTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("leaderboardDesc")}</p>
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground/30 uppercase font-mono text-[10px] tracking-wider border-b border-white/[0.04]">
                <tr>
                  <th className="px-6 py-4 font-bold">{t("rank")}</th>
                  <th className="px-6 py-4 font-bold">{t("userId")}</th>
                  <th className="px-6 py-4 font-bold">{t("level")}</th>
                  <th className="px-6 py-4 font-bold text-right">{t("totalXp")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {isLoading ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-6 py-4"><Skeleton className="h-6 w-8" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-12" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-6 w-24" /></td>
                  </tr>
                )) : leaderboard && leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
                  <tr key={entry.userId} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-bold ${
                        idx === 0 ? "bg-yellow-500/15 text-yellow-400" : idx === 1 ? "bg-gray-300/10 text-gray-300" : idx === 2 ? "bg-orange-500/10 text-orange-400" : "bg-white/[0.03] text-muted-foreground/40"
                      }`}>
                        {idx < 3 ? <Medal className="w-4 h-4" /> : idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 border border-white/[0.08]">
                          <AvatarImage src={entry.avatar || undefined} />
                          <AvatarFallback className="text-[10px] bg-white/[0.05]">{(entry.username || entry.userId).substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium group-hover:text-foreground transition-colors">{entry.username || "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground/30 font-mono">{entry.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-mono bg-cyan/5 text-cyan border-cyan/15 text-[10px]">{entry.level}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-cyan">{entry.xp.toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground/30"><Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>{t("noLeaderboardData")}</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </PageTransition>
    </div>
  );
}
