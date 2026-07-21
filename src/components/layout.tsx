import React from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, Trophy, Gamepad2, Swords, AlertTriangle, MessageSquare,
  Megaphone, Loader2, Server, ShoppingBag, PartyPopper, Calendar, Ticket,
  Globe, LogOut, Wallet, ShoppingCart, UserPlus, ScrollText, TrendingUp,
  Bell, GitBranch, ShieldBan, Paintbrush, ChevronLeft, ChevronRight, Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiCall<{ tag: string; id: string; avatar: string; status: string; ping: number; guildCount: number; guildName: string; memberCount: number; commandCount: number; uptime: number }>("/api/bot/stats"),
  });
  const { locale, setLocale, t } = useLanguage();
  const { signOut } = useAuth();
  const isOnline = stats?.status === "online";

  const navSections = [
    {
      label: "COMMAND CENTER",
      items: [
        { href: "/", label: t("overview"), icon: LayoutDashboard },
        { href: "/leaderboard", label: t("leaderboard"), icon: Trophy },
        { href: "/levels", label: t("levels"), icon: TrendingUp },
        { href: "/economy", label: t("economy"), icon: Wallet },
      ],
    },
    {
      label: "ENGAGE",
      items: [
        { href: "/lfg", label: t("lfgSessions"), icon: Gamepad2 },
        { href: "/tournaments", label: t("tournaments"), icon: Swords },
        { href: "/events", label: t("events"), icon: PartyPopper },
        { href: "/daily", label: t("daily"), icon: Calendar },
      ],
    },
    {
      label: "MANAGE",
      items: [
        { href: "/shop", label: t("shop"), icon: ShoppingBag },
        { href: "/purchases", label: t("purchases"), icon: ShoppingCart },
        { href: "/tickets", label: t("tickets"), icon: Ticket },
        { href: "/welcome", label: t("welcome"), icon: UserPlus },
      ],
    },
    {
      label: "MODERATION",
      items: [
        { href: "/warnings", label: t("warnings"), icon: AlertTriangle },
        { href: "/logs", label: t("logs"), icon: ScrollText },
        { href: "/badwords", label: t("badWords"), icon: ShieldBan },
        { href: "/autorules", label: t("autoRules"), icon: GitBranch },
      ],
    },
    {
      label: "COMMS",
      items: [
        { href: "/notifications", label: t("notifications"), icon: Bell },
        { href: "/autoresponses", label: t("autoResponses"), icon: MessageSquare },
        { href: "/announce", label: t("announcements"), icon: Megaphone },
        { href: "/embedbuilder", label: t("embedBuilder"), icon: Paintbrush },
      ],
    },
  ];

  const sidebarW = collapsed ? "w-[72px]" : "w-64";

  return (
    <div className={`flex h-screen bg-background text-foreground overflow-hidden ${locale === "ar" ? "rtl" : "ltr"}`}>
      {/* Sidebar */}
      <aside className={`${sidebarW} flex flex-col z-10 transition-all duration-300 ease-out border-r border-white/[0.04] relative`}>
        {/* Animated gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />

        {/* Sidebar glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="h-16 flex items-center px-5 relative">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan/20 to-electric/10 flex items-center justify-center flex-shrink-0 border border-cyan/20 relative overflow-hidden">
              <Zap className="w-5 h-5 text-cyan relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 to-transparent" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-base tracking-wider text-gradient-cyber">AETHERCORE</h1>
                <p className="text-[9px] text-muted-foreground/50 font-mono tracking-widest">DASHBOARD</p>
              </div>
            )}
          </div>
        </div>

        {/* Bot Status */}
        {!collapsed && (
          <div className="px-3 mb-3">
            <div className="rounded-xl p-3 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.04] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan/5 rounded-full blur-[40px] pointer-events-none" />
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-9 h-9 animate-spin text-muted-foreground" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 w-20 bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              ) : stats ? (
                <div className="flex items-center gap-3 relative z-10">
                  <div className="relative">
                    <Avatar className="w-9 h-9 border border-cyan/20">
                      <AvatarImage src={stats.avatar ?? undefined} />
                      <AvatarFallback className="text-xs bg-cyan/10 text-cyan">{(stats.tag ?? "??").substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${isOnline ? "bg-cyan" : "bg-red-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{stats.tag}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono">
                      {isOnline ? "ONLINE" : "OFFLINE"} · {stats.memberCount?.toLocaleString()} members
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/50">{t("statusUnavailable")}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          {navSections.map((section, si) => (
            <div key={si} className="mb-4">
              {!collapsed && (
                <p className="px-5 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                  {section.label}
                </p>
              )}
              <div className="px-2 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 mx-1 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative group ${
                        active
                          ? "text-cyan font-medium"
                          : "text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.03]"
                      }`}
                    >
                      {active && (
                        <div className="absolute inset-0 rounded-xl bg-cyan/[0.06] border border-cyan/10" />
                      )}
                      <Icon className={`w-[18px] h-[18px] flex-shrink-0 relative z-10 ${active ? "text-cyan" : ""}`} />
                      {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                      {active && !collapsed && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan rounded-l-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Bottom */}
        <div className="p-2 border-t border-white/[0.04] space-y-1">
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.03] transition-all"
            title={locale === "en" ? "العربية" : "English"}
          >
            <Globe className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>{locale === "en" ? "العربية" : "English"}</span>}
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
            title={t("logout")}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>{t("logout")}</span>}
          </button>
        </div>

        {/* Collapse */}
        <div className="p-2 border-t border-white/[0.04]">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 rounded-xl text-muted-foreground/40 hover:text-foreground hover:bg-white/[0.03] transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        {/* Top radial glow */}
        <div className="absolute top-0 left-0 right-0 h-80 bg-radial-cyan pointer-events-none" />
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-noise pointer-events-none" />

        <div className="relative max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
