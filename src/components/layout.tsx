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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiCall<{ tag: string; id: string; avatar: string; status: string; ping: number; guildCount: number; guildName: string; memberCount: number; commandCount: number; uptime: number }>("/api/bot/stats"),
  });
  const { locale, setLocale, t } = useLanguage();
  const { signOut } = useAuth();

  const isOnline = stats?.status === "online";

  const navItems = [
    { href: "/", label: t("overview"), icon: LayoutDashboard },
    { href: "/leaderboard", label: t("leaderboard"), icon: Trophy },
    { href: "/lfg", label: t("lfgSessions"), icon: Gamepad2 },
    { href: "/tournaments", label: t("tournaments"), icon: Swords },
    { href: "/shop", label: t("shop"), icon: ShoppingBag },
    { href: "/events", label: t("events"), icon: PartyPopper },
    { href: "/daily", label: t("daily"), icon: Calendar },
    { href: "/economy", label: t("economy"), icon: Wallet },
    { href: "/purchases", label: t("purchases"), icon: ShoppingCart },
    { href: "/tickets", label: t("tickets"), icon: Ticket },
    { href: "/welcome", label: t("welcome"), icon: UserPlus },
    { href: "/logs", label: t("logs"), icon: ScrollText },
    { href: "/levels", label: t("levels"), icon: TrendingUp },
    { href: "/notifications", label: t("notifications"), icon: Bell },
    { href: "/autorules", label: t("autoRules"), icon: GitBranch },
    { href: "/badwords", label: t("badWords"), icon: ShieldBan },
    { href: "/warnings", label: t("warnings"), icon: AlertTriangle },
    { href: "/autoresponses", label: t("autoResponses"), icon: MessageSquare },
    { href: "/announce", label: t("announcements"), icon: Megaphone },
    { href: "/embedbuilder", label: t("embedBuilder"), icon: Paintbrush },
  ];

  return (
    <div className={`flex h-screen bg-background text-foreground overflow-hidden ${locale === "ar" ? "rtl" : "ltr"}`}>
      <aside className="w-64 border-r border-border bg-card flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Server className="w-6 h-6 mr-3 text-primary" />
          <h1 className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">AETHERCORE</h1>
        </div>

        <div className="p-6 border-b border-border bg-black/20">
          {isLoading ? (
            <div className="flex items-center space-x-4">
              <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ) : stats ? (
            <div className="flex items-center space-x-4">
              <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={stats.avatar ?? undefined} />
                <AvatarFallback>{(stats.tag ?? "??").substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{stats.tag}</p>
                <div className="flex items-center mt-1">
                  <span className="relative flex h-2 w-2 mr-2">
                    {isOnline && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </span>
                  <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">{isOnline ? t("online") : t("offline")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{t("statusUnavailable")}</div>
          )}
        </div>

        <div className="px-4 py-3 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          >
            <Globe className="w-4 h-4" />
            <span>{locale === "en" ? "العربية" : "English"}</span>
          </Button>
        </div>

        <div className="px-4 py-3 border-t border-border mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4" />
            <span>{t("logout")}</span>
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${active ? "bg-primary/10 text-primary font-medium border border-primary/20 shadow-[inset_0_0_15px_rgba(139,92,246,0.1)]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                <Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-black/40">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
