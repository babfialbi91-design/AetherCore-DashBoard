import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Swords, Trophy, Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/hooks/use-language";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type TournamentParticipant = { id: string; displayName?: string; avatar?: string };
type Tournament = { id: string; name: string; game: string; status: string; participants: TournamentParticipant[]; participantIds: string[]; maxPlayers: number; host?: { id: string; displayName?: string; avatar?: string }; createdAt: string };

export default function Tournaments() {
  const { t } = useLanguage();
  const { data: tournaments, isLoading } = useQuery<Tournament[]>({ queryKey: ["bot-tournaments"], queryFn: () => apiCall("/api/bot/tournaments") });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
            <Swords className="w-8 h-8 text-cyan" /> {t("tournamentsTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("tournamentsDesc")}</p>
        </div>
      </PageTransition>

      <Stagger className="grid gap-5 md:grid-cols-2" staggerMs={80}>
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>) :
        tournaments && tournaments.length > 0 ? tournaments.map((tournament) => (
          <GlowCard key={tournament.id} color="cyan">
            <Card className="border-0 bg-transparent overflow-hidden flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-cyan via-electric to-cyan" />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold">{tournament.name}</CardTitle>
                    <p className="text-sm font-medium text-cyan mt-1">{tournament.game}</p>
                  </div>
                  <Badge variant={tournament.status === "active" ? "default" : "secondary"}
                    className={tournament.status === "active" ? "bg-green-500/15 text-green-400 border-green-500/20 font-mono text-[10px] uppercase tracking-wider" : "font-mono text-[10px] uppercase tracking-wider bg-white/[0.03] border-white/[0.06]"}>
                    {tournament.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-5 text-sm text-muted-foreground/50 bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.04]">
                  <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-cyan" /><span className="font-mono text-xs">{tournament.participants.length}/{tournament.maxPlayers}</span></div>
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-cyan" /><span className="text-xs">{tournament.createdAt != null ? formatDistanceToNow(new Date(tournament.createdAt), { addSuffix: true }) : "Unknown"}</span></div>
                </div>
                {tournament.participants.length > 0 && (
                  <div className="flex items-center gap-1 mt-3">
                    <div className="flex -space-x-1.5">
                      {tournament.participants.slice(0, 5).map((p) => (
                        <Avatar key={p.id} className="w-6 h-6 border-2 border-background"><AvatarImage src={p.avatar || undefined} /><AvatarFallback className="text-[8px] bg-white/[0.08]">{(p.displayName || p.id).substring(0, 1).toUpperCase()}</AvatarFallback></Avatar>
                      ))}
                      {tournament.participants.length > 5 && <div className="w-6 h-6 rounded-full bg-white/[0.06] border-2 border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground/50">+{tournament.participants.length - 5}</div>}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-white/[0.04] bg-white/[0.015] py-2.5">
                <div className="text-[11px] text-muted-foreground/40 flex items-center gap-2">
                  {tournament.host?.avatar ? <Avatar className="w-4 h-4"><AvatarImage src={tournament.host.avatar} /><AvatarFallback className="text-[7px]">?</AvatarFallback></Avatar> : <Trophy className="w-3 h-3" />}
                  Hosted by <span className="font-medium text-foreground/70">{tournament.host?.displayName || "Unknown"}</span>
                </div>
              </CardFooter>
            </Card>
          </GlowCard>
        )) : (
          <div className="col-span-full py-16 text-center text-muted-foreground/30 rounded-2xl border border-white/[0.04] border-dashed bg-white/[0.01]">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" /><p className="text-lg">{t("noTournaments")}</p>
          </div>
        )}
      </Stagger>
    </div>
  );
}
