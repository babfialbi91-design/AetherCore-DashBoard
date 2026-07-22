import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, Users, Clock, Plus, Sparkles } from "lucide-react";
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

type LfgSession = {
  id: string;
  game: string;
  description: string;
  hostId: string;
  host?: { id: string; displayName?: string; avatar?: string };
  participants: string[];
  playersNeeded: number;
  createdAt: string;
};

const cardGlows: Array<"magenta" | "cyan" | "violet" | "amber"> = ["magenta", "cyan", "violet", "amber"];

export default function Lfg() {
  const { t } = useLanguage();
  const { data: sessions, isLoading } = useQuery<LfgSession[]>({
    queryKey: ["bot-lfg-sessions"],
    queryFn: () => apiCall("/api/bot/lfg"),
  });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-violet/[0.04] via-transparent to-emerald/[0.03] pointer-events-none" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet/[0.06] rounded-full blur-[60px] animate-float" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center glow-violet">
                <Gamepad2 className="w-6 h-6 text-violet" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gradient-violet">{t("lfgTitle")}</h2>
                <p className="text-muted-foreground/40 text-sm mt-0.5">{t("lfgDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-4 py-1.5 text-xs bg-violet/5 font-mono border-violet/15 text-violet animate-pulse-neon">
                <span className="w-2 h-2 rounded-full bg-violet mr-2 animate-pulse-neon" />
                {sessions?.length || 0} {t("active")}
              </Badge>
              <button className="w-10 h-10 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center hover:bg-violet/20 transition-colors">
                <Plus className="w-5 h-5 text-violet" />
              </button>
            </div>
          </div>
        </div>
      </PageTransition>

      <Stagger className="columns-1 md:columns-2 lg:columns-3 gap-5" staggerMs={60}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-5">
                <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <Skeleton className="h-44 w-full rounded-xl" />
                </div>
              </div>
            ))
          : sessions && sessions.length > 0
          ? sessions.map((session, idx) => {
              const fill = session.playersNeeded > 0 ? session.participants.length / session.playersNeeded : 1;
              return (
                <div key={session.id} className="break-inside-avoid mb-5">
                  <GlowCard color={cardGlows[idx % cardGlows.length]}>
                    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden flex flex-col">
                      <div className="p-6 pb-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-tight">{session.game}</h3>
                          <Badge className="bg-violet/10 text-violet border-violet/15 font-mono text-[10px] shrink-0 animate-fade-in">
                            {session.participants.length}/{session.playersNeeded}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald" />
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald">Active</span>
                          <span className="text-[10px] text-muted-foreground/20 mx-1">·</span>
                          <span className="text-[10px] text-muted-foreground/30 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {session.createdAt != null ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : "Unknown"}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground/40 leading-relaxed line-clamp-3">{session.description || "No description provided."}</p>
                      </div>

                      <div className="px-6 pb-4">
                        <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet/60 to-violet transition-all duration-500"
                            style={{ width: `${Math.min(fill * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground/20 mt-1.5 font-mono">
                          {session.participants.length} of {session.playersNeeded} slots filled
                        </p>
                      </div>

                      <div className="border-t border-white/[0.04] bg-white/[0.015] px-6 py-3.5 flex items-center gap-3">
                        <Avatar className="w-8 h-8 border-2 border-white/[0.06]">
                          <AvatarImage src={session.host?.avatar || undefined} />
                          <AvatarFallback className="text-[9px] bg-white/[0.05]">
                            {(session.host?.displayName || session.hostId).substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-muted-foreground/30 uppercase font-bold tracking-wider">{t("host")}</p>
                          <p className="text-xs font-semibold truncate">{session.host?.displayName || session.hostId}</p>
                        </div>
                        <Sparkles className="w-3.5 h-3.5 text-violet/30" />
                      </div>
                    </div>
                  </GlowCard>
                </div>
              );
            })
          : (
              <div className="col-span-full py-16 text-center text-muted-foreground/30 rounded-3xl border border-dashed border-white/[0.06] bg-white/[0.01]">
                <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-muted-foreground/15" />
                </div>
                <p className="text-xl font-bold text-muted-foreground/20 uppercase tracking-wider">No Groups Yet</p>
                <p className="text-xs text-muted-foreground/15 mt-2">{t("noLfgSessions")}</p>
              </div>
            )}
      </Stagger>
    </div>
  );
}
