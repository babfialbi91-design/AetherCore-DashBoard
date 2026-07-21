import React from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Trophy,
  Gamepad2,
  Swords,
  AlertTriangle,
  MessageSquare,
  Megaphone,
  Loader2,
  Server,
  ShoppingBag,
  PartyPopper,
  Calendar,
  Ticket,
  Globe,
  LogOut,
  Wallet,
  ShoppingCart,
  UserPlus,
  ScrollText,
  TrendingUp,
  Bell,
  GitBranch,
  ShieldBan,
  Paintbrush,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
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
      label: t("overview") ? "MAIN" : "MAIN",
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

  const sidebarW = collapsed ? "w-[68px]" : "w-64";

  return (
    <div className={`flex h-screen bg-background text-foreground overflow-hidden ${locale === "ar" ? "rtl" : "ltr"}`}>
      {/* Sidebar */}
      <aside className={`${sidebarW} border-r border-white/5 glass-strong flex flex-col z-10 transition-all duration-300 ease-in-out`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 glow-purple-sm">
              <Server className="w-5 h-5 text-primary" />
            </div>
            {!collapsed && (
              <h1 className="font-bold text-base tracking-wider text-gradient whitespace-nowrap">AETHERCORE</h1>
            )}
          </div>
        </div>

        {/* Bot Status */}
        {!collapsed && (
          <div className="p-4 border-b border-white/5">
            <div className="glass rounded-xl p-3 border border-white/5">
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-9 h-9 animate-spin text-muted-foreground" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 w-20 bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              ) : stats ? (
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 border border-white/10">
                    <AvatarImage src={stats.avatar ?? undefined} />
                    <AvatarFallback className="text-xs">{(stats.tag ?? "??").substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{stats.tag}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-1.5 w-1.5">
                        {isOnline && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        )}
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                        {isOnline ? t("online") : t("offline")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t("statusUnavailable")}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          {navSections.map((section, si) => (
            <div key={si} className="mb-4">
              {!collapsed && (
                <p className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
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
                      className={`flex items-center gap-3 mx-1 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        active
                          ? "bg-primary/12 text-primary font-medium border border-primary/15 glow-purple-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-primary" : ""}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Bottom actions */}
        <div className="p-2 border-t border-white/5 space-y-1">
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
            title={locale === "en" ? "العربية" : "English"}
          >
            <Globe className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>{locale === "en" ? "العربية" : "English"}</span>}
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            title={t("logout")}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>{t("logout")}</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-white/5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle radial gradient at top */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-radial pointer-events-none" />
        <div className="relative max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
