import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import { Stagger, GlowCard } from "@/components/page-transitions";
import { Coins, Users, ShoppingBag, MessageCircle, Shield, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

async function apiCall<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function Overview() {
  const { t } = useLanguage();

  const { data: economy, isLoading: loadingEconomy } = useQuery({
    queryKey: ["economy"],
    queryFn: () => apiCall<any[]>("/api/bot/economy"),
  });

  const { data: tickets, isLoading: loadingTickets } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => apiCall<any[]>("/api/bot/tickets"),
  });

  const { data: shopData, isLoading: loadingShop } = useQuery({
    queryKey: ["shop"],
    queryFn: () => apiCall<{ items: any[]; channelId: string | null }>("/api/bot/shop"),
  });

  const { data: leaderboard, isLoading: loadingLb } = useQuery({
    queryKey: ["bot-leaderboard"],
    queryFn: () => apiCall<any[]>("/api/bot/leaderboard"),
  });

  const { data: warnings, isLoading: loadingWarnings } = useQuery({
    queryKey: ["warnings"],
    queryFn: () => apiCall<any[]>("/api/bot/warnings"),
  });

  const totalCoins = economy?.reduce((s: number, e: any) => s + (e.balance || 0), 0) || 0;
  const totalUsers = economy?.length || 0;
  const openTickets = tickets?.filter((t: any) => t.status === "open").length || 0;
  const totalTickets = tickets?.length || 0;
  const shopItems = shopData?.items?.length || 0;
  const topUser = leaderboard?.[0];
  const totalWarnings = warnings?.reduce((s: number, w: any) => s + (w.warnings?.length || 0), 0) || 0;

  const statCards = [
    { label: t("economyTotal"), value: totalCoins.toLocaleString(), icon: Coins, color: "from-amber to-[#F59E0B]", iconColor: "text-amber", loading: loadingEconomy, glow: "glow-amber" },
    { label: t("navLeaderboard"), value: totalUsers.toString(), icon: Users, color: "from-magenta to-rose", iconColor: "text-magenta", loading: loadingEconomy, glow: "glow-magenta" },
    { label: t("navShop"), value: shopItems.toString(), icon: ShoppingBag, color: "from-cyan-bright to-[#00A8CC]", iconColor: "text-cyan-bright", loading: loadingShop, glow: "glow-cyan" },
    { label: "Open Tickets", value: openTickets.toString(), icon: MessageCircle, color: "from-violet to-[#7C3AED]", iconColor: "text-violet", loading: loadingTickets, glow: "glow-violet" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="animate-card-entrance">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-magenta/[0.08] via-violet/[0.04] to-cyan-bright/[0.06] border border-white/[0.06] p-8 lg:p-10 animate-glow-breathe">
          <div className="absolute inset-0 bg-grid-nebula opacity-30" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-magenta/[0.1] rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet/[0.08] rounded-full blur-[80px] animate-float" style={{ animationDelay: "-2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-bright/[0.05] rounded-full blur-[60px] animate-float-slow" style={{ animationDelay: "-4s" }} />
          {/* Floating particles */}
          <div className="absolute top-8 right-20 w-1.5 h-1.5 rounded-full bg-magenta/30 animate-particle-drift" style={{ animationDelay: "0s" }} />
          <div className="absolute top-16 right-40 w-1 h-1 rounded-full bg-cyan-bright/20 animate-particle-drift" style={{ animationDelay: "-2s" }} />
          <div className="absolute bottom-12 left-24 w-1 h-1 rounded-full bg-violet/25 animate-particle-drift" style={{ animationDelay: "-4s" }} />
          <div className="absolute bottom-8 right-32 w-1.5 h-1.5 rounded-full bg-amber/20 animate-particle-drift" style={{ animationDelay: "-1s" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald animate-pulse-neon" />
              <span className="text-[10px] font-black tracking-[0.25em] text-emerald uppercase">{t("online")}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gradient-nebula mb-3 leading-tight animate-neon-flicker">{t("welcome")}</h1>
            <p className="text-muted-foreground/50 text-base max-w-lg">{t("overviewDesc")}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" staggerMs={100}>
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <GlowCard key={stat.label}>
              <Card className={`overflow-hidden card-hover border-white/[0.06] animate-card-entrance stagger-${i + 1}`}>
                <div className={`h-1.5 bg-gradient-to-r ${stat.color}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/30 uppercase mb-2">{stat.label}</p>
                      {stat.loading ? (
                        <Skeleton className="h-9 w-24" />
                      ) : (
                        <p className="text-3xl font-black stat-number text-foreground/90">{stat.value}</p>
                      )}
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg animate-float-slow`} style={{ animationDelay: `${i * -1.5}s` }}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </GlowCard>
          );
        })}
      </Stagger>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Users */}
        <div className="lg:col-span-2 animate-slide-in-left" style={{ animationDelay: "0.3s" }}>
          <Card className="border-white/[0.06]">
            <div className="p-6 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber to-[#F59E0B] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground/90">Top Members</h3>
                  <p className="text-[10px] text-muted-foreground/30 font-mono tracking-wider">BY LEVEL & XP</p>
                </div>
              </div>
            </div>
            <CardContent className="p-0">
              {loadingLb ? (
                <div className="p-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="divide-y divide-white/[0.03]">
                  {/* Top 3 Podium */}
                  <div className="p-6 flex items-end justify-center gap-6">
                    {[leaderboard[1], leaderboard[0], leaderboard[2]].filter(Boolean).map((user, i) => {
                      const heights = ["h-20", "h-28", "h-16"];
                      const medals = ["🥈", "🥇", "🥉"];
                      const gradients = ["from-gray-300/20 to-gray-400/10", "from-amber/30 to-amber/10", "from-orange-400/20 to-orange-500/10"];
                      return (
                        <div key={user.userId} className="flex flex-col items-center gap-2">
                          <Avatar className="w-10 h-10 border-2 border-white/[0.1]">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback className="text-xs bg-white/[0.05]">{(user.username || user.userId).substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <p className="text-[11px] text-muted-foreground/50 font-medium max-w-[80px] truncate text-center">{user.username || "Unknown"}</p>
                          <div className={`${heights[i]} w-20 rounded-t-xl bg-gradient-to-b ${gradients[i]} border border-white/[0.06] border-b-0 flex flex-col items-center justify-end pb-2`}>
                            <span className="text-lg mb-1">{medals[i]}</span>
                            <span className="text-[10px] font-bold text-foreground/70">Lv.{user.level}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Rest of leaderboard */}
                  <div className="p-4">
                    {leaderboard.slice(3, 8).map((user, idx) => (
                      <div key={user.userId} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                        <span className="text-[11px] font-bold text-muted-foreground/30 w-6 text-center">{idx + 4}</span>
                        <Avatar className="w-8 h-8 border border-white/[0.06]">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="text-[9px] bg-white/[0.04]">{(user.username || user.userId).substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground/70 truncate">{user.username || "Unknown"}</p>
                          <p className="text-[9px] text-muted-foreground/25 font-mono">{user.userId}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-magenta/[0.05] text-magenta border-magenta/15 font-mono">Lv.{user.level}</Badge>
                        <span className="text-[11px] font-mono text-amber">{user.xp?.toLocaleString()} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground/20">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">{t("noLeaderboardData")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-5 animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
          {/* Warnings Card */}
          <Card className="border-white/[0.06] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-rose to-[#E11D48]" />
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-rose" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/30 uppercase">Warnings</p>
                  <p className="text-2xl font-black stat-number text-rose">{totalWarnings}</p>
                </div>
              </div>
              <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose to-[#E11D48] rounded-full" style={{ width: `${Math.min(totalWarnings * 10, 100)}%` }} />
              </div>
            </CardContent>
          </Card>

          {/* Tickets Overview */}
          <Card className="border-white/[0.06] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet to-[#7C3AED]" />
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-violet" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/30 uppercase">Tickets</p>
                  <p className="text-2xl font-black stat-number text-violet">{openTickets}/{totalTickets}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 p-2.5 rounded-lg bg-emerald/[0.06] border border-emerald/10 text-center">
                  <p className="text-[9px] font-bold text-emerald/60 uppercase mb-0.5">Open</p>
                  <p className="text-lg font-black stat-number text-emerald">{openTickets}</p>
                </div>
                <div className="flex-1 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <p className="text-[9px] font-bold text-muted-foreground/30 uppercase mb-0.5">Closed</p>
                  <p className="text-lg font-black stat-number text-muted-foreground/50">{totalTickets - openTickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Economy Pulse */}
          <Card className="border-white/[0.06] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber to-[#F59E0B]" />
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/30 uppercase">Economy</p>
                  <p className="text-2xl font-black stat-number text-amber">{totalCoins.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <p className="text-[9px] text-muted-foreground/25 uppercase font-bold">Total Users</p>
                  <p className="text-sm font-bold text-foreground/60">{totalUsers}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <p className="text-[9px] text-muted-foreground/25 uppercase font-bold">Avg Balance</p>
                  <p className="text-sm font-bold text-foreground/60">{totalUsers > 0 ? Math.round(totalCoins / totalUsers).toLocaleString() : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
