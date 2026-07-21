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

type Tournament = {
  id: string;
  name: string;
  game: string;
  status: string;
  participants: TournamentParticipant[];
  participantIds: string[];
  maxPlayers: number;
  host?: { id: string; displayName?: string; avatar?: string };
  createdAt: string;
};

export default function Tournaments() {
  const { t } = useLanguage();
  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ["bot-tournaments"],
    queryFn: () => apiCall("/api/bot/tournaments"),
  });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
              <Swords className="w-8 h-8 text-primary" />
              {t("tournamentsTitle")}
            </h2>
            <p className="text-muted-foreground mt-2">{t("tournamentsDesc")}</p>
          </div>
        </div>
      </PageTransition>

      <Stagger className="grid gap-6 md:grid-cols-2" staggerMs={80}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
          ))
        ) : tournaments && tournaments.length > 0 ? (
          tournaments.map((tournament) => (
            <GlowCard key={tournament.id} color="primary">
              <Card className="border-0 bg-transparent overflow-hidden flex flex-col">
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-500 to-primary" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold">{tournament.name}</CardTitle>
                      <p className="text-sm font-medium text-primary mt-1">{tournament.game}</p>
                    </div>
                    <Badge
                      variant={tournament.status === "active" ? "default" : "secondary"}
                      className={tournament.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30 font-mono uppercase tracking-wider" : "font-mono uppercase tracking-wider"}
                    >
                      {tournament.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground bg-white/[0.03] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-mono">{tournament.participants.length} / {tournament.maxPlayers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{tournament.createdAt != null ? formatDistanceToNow(new Date(tournament.createdAt), { addSuffix: true }) : "Unknown"}</span>
                    </div>
                  </div>
                  {tournament.participants.length > 0 && (
                    <div className="flex items-center gap-1 mt-3">
                      <span className="text-xs text-muted-foreground mr-2">{t("participants") || "Players"}:</span>
                      <div className="flex -space-x-2">
                        {tournament.participants.slice(0, 5).map((p) => (
                          <Avatar key={p.id} className="w-7 h-7 border-2 border-background">
                            <AvatarImage src={p.avatar || undefined} />
                            <AvatarFallback className="text-[9px] bg-white/10">{(p.displayName || p.id).substring(0, 1).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        ))}
                        {tournament.participants.length > 5 && (
                          <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                            +{tournament.participants.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-white/5 bg-white/[0.02] py-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {tournament.host?.avatar ? (
                      <Avatar className="w-5 h-5"><AvatarImage src={tournament.host.avatar} /><AvatarFallback className="text-[8px]">?</AvatarFallback></Avatar>
                    ) : (
                      <Trophy className="w-3 h-3" />
                    )}
                    Hosted by <span className="font-medium text-foreground">{tournament.host?.displayName || tournament.host?.id || "Unknown"}</span>
                  </div>
                </CardFooter>
              </Card>
            </GlowCard>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-muted-foreground rounded-xl border border-white/5 border-dashed bg-white/[0.02]">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">{t("noTournaments")}</p>
          </div>
        )}
      </Stagger>
    </div>
  );
}
