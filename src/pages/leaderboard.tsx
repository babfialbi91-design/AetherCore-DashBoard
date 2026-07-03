import React from "react";
import { useGetBotLeaderboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetBotLeaderboard();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          Server Leaderboard
        </h2>
        <p className="text-muted-foreground mt-2">Global XP and leveling rankings across the guild.</p>
      </div>

      <Card className="bg-card/50 border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/40 text-muted-foreground uppercase font-mono text-xs">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Rank</th>
                <th className="px-6 py-4 font-medium tracking-wider">User ID</th>
                <th className="px-6 py-4 font-medium tracking-wider">Level</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4"><Skeleton className="h-6 w-8" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-12" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-6 w-24" /></td>
                  </tr>
                ))
              ) : leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((entry, idx) => (
                  <tr key={entry.userId} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Medal className="w-5 h-5 text-yellow-500" />}
                        {idx === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                        {idx === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                        {idx > 2 && <span className="w-5 h-5 flex items-center justify-center font-bold text-muted-foreground text-xs">{idx + 1}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <Star className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        {entry.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/20">
                        {entry.level}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-primary">
                      {entry.xp.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No leaderboard data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
