import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Gamepad2, Users, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/hooks/use-language";

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
  participants: string[];
  playersNeeded: number;
  createdAt: string;
};

export default function Lfg() {
  const { t } = useLanguage();
  const { data: sessions, isLoading } = useQuery<LfgSession[]>({
    queryKey: ["bot-lfg-sessions"],
    queryFn: () => apiCall("/api/bot/lfg/sessions"),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            {t("lfgTitle")}
          </h2>
          <p className="text-muted-foreground mt-2">{t("lfgDesc")}</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 text-sm bg-black/40 font-mono">
          {sessions?.length || 0} {t("active")}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-white/5">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <Card key={session.id} className="bg-card/50 border-white/5 hover:border-primary/30 transition-all group flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-xl font-bold text-foreground line-clamp-1">{session.game}</CardTitle>
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
              <CardFooter className="pt-4 border-t border-white/5 bg-black/20 flex flex-col items-start gap-2">
                <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{t("host")}</div>
                <div className="text-sm font-medium">{session.hostId}</div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card/30 rounded-xl border border-white/5 border-dashed">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{t("noLfgSessions")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
