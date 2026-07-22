import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Swords, Trophy, Users, Calendar, Crown, SwordsIcon } from "lucide-react";
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

const statusStyles: Record<string, { border: string; glow: string; badge: string; pulse: string }> = {
  active: {
    border: "border-t-emerald",
    glow: "glow-cyan",
    badge: "bg-emerald/15 text-emerald border-emerald/20",
    pulse: "animate-pulse-neon",
  },
  upcoming: {
    border: "border-t-amber",
    glow: "glow-amber",
    badge: "bg-amber/15 text-amber border-amber/20",
    pulse: "",
  },
  completed: {
    border: "border-t-violet",
    glow: "glow-violet",
    badge: "bg-violet/15 text-violet border-violet/20",
    pulse: "",
  },
  cancelled: {
    border: "border-t-rose",
    glow: "",
    badge: "bg-rose/15 text-rose border-rose/20",
    pulse: "",
  },
};

const fallbackStyle = { border: "border-t-cyan", glow: "", badge: "bg-white/[0.06] text-muted-foreground/50 border-white/[0.08]", pulse: "" };

export default function Tournaments() {
  const { t } = useLanguage();
  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ["bot-tournaments"],
    queryFn: () => apiCall("/api/bot/tournaments"),
  });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-magenta/20 to-violet/10 border border-white/[0.06] flex items-center justify-center glow-magenta animate-float">
            <Swords className="w-7 h-7 text-magenta" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-magenta">{t("tournamentsTitle")}</h2>
            <p className="text-muted-foreground/40 text-sm mt-0.5">{t("tournamentsDesc")}</p>
          </div>
        </div>
      </PageTransition>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="h-1 w-full bg-white/[0.04]" />
              <div className="p-6"><Skeleton className="h-48 w-full rounded-xl" /></div>
            </div>
          ))}
        </div>
      ) : tournaments && tournaments.length > 0 ? (
        <Stagger className="grid gap-6 md:grid-cols-2" staggerMs={80}>
          {tournaments.map((tournament) => {
            const style = statusStyles[tournament.status] || fallbackStyle;
            return (
              <div
                key={tournament.id}
                className={`rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden ${style.glow} hover:scale-[1.01] transition-transform duration-300`}
              >
                <div className={`h-1 w-full border-t-2 ${style.border} bg-gradient-to-r from-transparent via-current to-transparent`} />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground truncate">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground/50 mt-1">{tournament.game}</p>
                    </div>
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider shrink-0 ${style.badge} ${style.pulse}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 inline-block" />
                      {tournament.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-5 text-sm text-muted-foreground/50 p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.015] mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-magenta" />
                      <span className="font-mono text-xs">{tournament.participants.length}/{tournament.maxPlayers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-magenta/60" />
                      <span className="text-xs">
                        {tournament.createdAt != null ? formatDistanceToNow(new Date(tournament.createdAt), { addSuffix: true }) : "Unknown"}
                      </span>
                    </div>
                  </div>

                  {tournament.participants.length > 0 && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex -space-x-2">
                        {tournament.participants.slice(0, 6).map((p) => (
                          <Avatar key={p.id} className="w-8 h-8 border-2 border-background">
                            <AvatarImage src={p.avatar || undefined} />
                            <AvatarFallback className="text-[9px] bg-white/[0.08]">
                              {(p.displayName || p.id).substring(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {tournament.participants.length > 6 && (
                          <div className="w-8 h-8 rounded-full bg-white/[0.06] border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground/50">
                            +{tournament.participants.length - 6}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/30">
                        {tournament.participants.length} player{tournament.participants.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/[0.04] bg-white/[0.015] px-6 py-3 flex items-center gap-2.5">
                  <Crown className="w-3.5 h-3.5 text-amber" />
                  {tournament.host?.avatar ? (
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={tournament.host.avatar} />
                      <AvatarFallback className="text-[7px]">?</AvatarFallback>
                    </Avatar>
                  ) : null}
                  <span className="text-[11px] text-muted-foreground/40">
                    Hosted by <span className="font-semibold text-foreground/60">{tournament.host?.displayName || "Unknown"}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </Stagger>
      ) : (
        <PageTransition delay={100}>
          <div className="rounded-3xl border border-dashed border-white/[0.06] bg-white/[0.01] py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <SwordsIcon className="w-10 h-10 text-muted-foreground/15" />
            </div>
            <p className="text-xl font-bold text-muted-foreground/20 uppercase tracking-wider">No Battles Yet</p>
            <p className="text-xs text-muted-foreground/15 mt-2">{t("noTournaments")}</p>
          </div>
        </PageTransition>
      )}
    </div>
  );
}
