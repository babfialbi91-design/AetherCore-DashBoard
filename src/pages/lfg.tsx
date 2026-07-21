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

export default function Lfg() {
  const { t } = useLanguage();
  const { data: sessions, isLoading } = useQuery<LfgSession[]>({
    queryKey: ["bot-lfg-sessions"],
    queryFn: () => apiCall("/api/bot/lfg"),
  });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-primary" />
              {t("lfgTitle")}
            </h2>
            <p className="text-muted-foreground mt-2">{t("lfgDesc")}</p>
          </div>
          <Badge variant="outline" className="px-4 py-1.5 text-sm bg-white/[0.03] font-mono border-white/10">
            {sessions?.length || 0} {t("active")}
          </Badge>
        </div>
      </PageTransition>

      <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerMs={70}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
          ))
        ) : sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <GlowCard key={session.id} color="primary">
              <Card className="border-0 bg-transparent flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-bold line-clamp-1">{session.game}</CardTitle>
                    <Badge className="bg-primary/20 text-primary border-primary/30 font-mono shrink-0">
                      {session.participants.length} / {session.playersNeeded}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2 font-mono">
                    <Clock className="w-3 h-3 mr-1" />
                    {session.createdAt != null ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : "Unknown"}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {session.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="pt-4 border-t border-white/5 bg-white/[0.02] flex items-center gap-3">
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarImage src={session.host?.avatar || undefined} />
                    <AvatarFallback className="text-xs bg-white/5">{(session.host?.displayName || session.hostId).substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{t("host")}</div>
                    <div className="text-sm font-medium">{session.host?.displayName || session.hostId}</div>
                  </div>
                </CardFooter>
              </Card>
            </GlowCard>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground rounded-xl border border-white/5 border-dashed bg-white/[0.02]">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{t("noLfgSessions")}</p>
          </div>
        )}
      </Stagger>
    </div>
  );
}
