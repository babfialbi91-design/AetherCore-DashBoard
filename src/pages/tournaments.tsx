import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Swords, Trophy, Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/hooks/use-language";

async function apiCall<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type Tournament = {
  id: string;
  name: string;
  game: string;
  status: string;
  hostId: string;
  participants: string[];
  maxPlayers: number;
  createdAt: string;
};

export default function Tournaments() {
  const { t } = useLanguage();
  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ["bot-tournaments"],
    queryFn: () => apiCall("/api/bot/tournaments"),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Swords className="w-8 h-8 text-primary" />
            {t("tournamentsTitle")}
          </h2>
          <p className="text-muted-foreground mt-2">{t("tournamentsDesc")}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-white/5">
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : tournaments && tournaments.length > 0 ? (
          tournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-card/50 border-white/5 overflow-hidden flex flex-col">
              <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-600" />
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
                <div className="flex items-center gap-6 text-sm text-muted-foreground bg-black/20 p-4 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-mono">
                      {tournament.participants.length} / {tournament.maxPlayers}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{tournament.createdAt != null ? formatDistanceToNow(new Date(tournament.createdAt), { addSuffix: true }) : "Unknown"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/5 bg-black/40 py-3">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Trophy className="w-3 h-3" />
                  Hosted by <span className="font-medium text-foreground">{tournament.hostId}</span>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-card/30 rounded-xl border border-white/5 border-dashed">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">{t("noTournaments")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
