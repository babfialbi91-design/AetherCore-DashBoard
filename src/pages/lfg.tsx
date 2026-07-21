import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Gamepad2, Users, Clock } from "lucide-react";
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

type LfgSession = { id: string; game: string; description: string; hostId: string; host?: { id: string; displayName?: string; avatar?: string }; participants: string[]; playersNeeded: number; createdAt: string };

export default function Lfg() {
  const { t } = useLanguage();
  const { data: sessions, isLoading } = useQuery<LfgSession[]>({ queryKey: ["bot-lfg-sessions"], queryFn: () => apiCall("/api/bot/lfg") });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-cyan" /> {t("lfgTitle")}
            </h2>
            <p className="text-muted-foreground/60 mt-2 text-sm">{t("lfgDesc")}</p>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-xs bg-cyan/5 font-mono border-cyan/15 text-cyan">
            {sessions?.length || 0} {t("active")}
          </Badge>
        </div>
      </PageTransition>

      <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" staggerMs={60}>
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-44 w-full" /></CardContent></Card>) :
        sessions && sessions.length > 0 ? sessions.map((session) => (
          <GlowCard key={session.id} color="cyan">
            <Card className="border-0 bg-transparent flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                  <CardTitle className="text-base font-bold line-clamp-1">{session.game}</CardTitle>
                  <Badge className="bg-cyan/10 text-cyan border-cyan/15 font-mono text-[10px] shrink-0">
                    {session.participants.length}/{session.playersNeeded}
                  </Badge>
                </div>
                <div className="flex items-center text-[10px] text-muted-foreground/30 mt-1.5 font-mono">
                  <Clock className="w-3 h-3 mr-1" />
                  {session.createdAt != null ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : "Unknown"}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-xs text-muted-foreground/50 leading-relaxed">{session.description || "No description provided."}</p>
              </CardContent>
              <CardFooter className="pt-3 border-t border-white/[0.04] bg-white/[0.015] flex items-center gap-2.5">
                <Avatar className="w-7 h-7 border border-white/[0.08]">
                  <AvatarImage src={session.host?.avatar || undefined} />
                  <AvatarFallback className="text-[9px] bg-white/[0.05]">{(session.host?.displayName || session.hostId).substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-[9px] text-muted-foreground/30 uppercase font-bold tracking-wider">{t("host")}</div>
                  <div className="text-xs font-medium">{session.host?.displayName || session.hostId}</div>
                </div>
              </CardFooter>
            </Card>
          </GlowCard>
        )) : (
          <div className="col-span-full py-12 text-center text-muted-foreground/30 rounded-2xl border border-white/[0.04] border-dashed bg-white/[0.01]">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>{t("noLfgSessions")}</p>
          </div>
        )}
      </Stagger>
    </div>
  );
}
