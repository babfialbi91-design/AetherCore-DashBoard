import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, Trophy, Gamepad2, Swords, ShoppingBag, Calendar, Coins,
  ShoppingCart, Ticket, MessageCircleWarning, ScrollText, TrendingUp, Bell,
  GitBranch, ShieldBan, AlertTriangle, Bot, Megaphone, Palette, ChevronLeft,
  ChevronRight, LogOut, Globe, Image, PanelLeftClose, PanelLeft
} from "lucide-react";

const navSections = [
  { label: "MAIN", items: [
    { path: "/", icon: LayoutDashboard, labelKey: "navOverview" },
    { path: "/leaderboard", icon: Trophy, labelKey: "navLeaderboard" },
    { path: "/levels", icon: TrendingUp, labelKey: "navLevels" },
  ]},
  { label: "ECONOMY", items: [
    { path: "/economy", icon: Coins, labelKey: "navEconomy" },
    { path: "/shop", icon: ShoppingBag, labelKey: "navShop" },
    { path: "/purchases", icon: ShoppingCart, labelKey: "navPurchases" },
    { path: "/daily", icon: Calendar, labelKey: "navDaily" },
  ]},
  { label: "COMMUNITY", items: [
    { path: "/lfg", icon: Gamepad2, labelKey: "navLfg" },
    { path: "/tournaments", icon: Swords, labelKey: "navTournaments" },
    { path: "/events", icon: Calendar, labelKey: "navEvents" },
    { path: "/tickets", icon: Ticket, labelKey: "navTickets" },
  ]},
  { label: "MODERATION", items: [
    { path: "/warnings", icon: AlertTriangle, labelKey: "navWarnings" },
    { path: "/badwords", icon: ShieldBan, labelKey: "navBadwords" },
    { path: "/autorules", icon: GitBranch, labelKey: "navAutorules" },
    { path: "/logs", icon: ScrollText, labelKey: "navLogs" },
  ]},
  { label: "CUSTOMIZATION", items: [
    { path: "/welcome", icon: MessageCircleWarning, labelKey: "navWelcome" },
    { path: "/notifications", icon: Bell, labelKey: "navNotifications" },
    { path: "/autoresponses", icon: Bot, labelKey: "navAutoResponses" },
    { path: "/embedbuilder", icon: Palette, labelKey: "navEmbedBuilder" },
    { path: "/announce", icon: Megaphone, labelKey: "navAnnounce" },
  ]},
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-mesh">
      {/* Floating orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-magenta/[0.03] blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet/[0.04] blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-bright/[0.02] blur-[80px] animate-float-slow" style={{ animationDelay: "-5s" }} />
      </div>

      {/* Sidebar */}
      <aside className={`relative z-10 flex flex-col border-r border-white/[0.04] bg-[#08060E]/80 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${collapsed ? "w-[68px]" : "w-[240px]"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.04] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-magenta via-violet to-cyan-bright flex items-center justify-center shrink-0 shadow-lg shadow-magenta/20">
            <span className="text-white font-black text-sm tracking-tighter">A</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold tracking-tight text-foreground/90 truncate">AetherCore</p>
              <p className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-widest">Dashboard</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-3 px-2">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[9px] font-black tracking-[0.2em] text-muted-foreground/25 uppercase">{section.label}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = location === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path}>
                      <div className={`group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        active
                          ? "bg-magenta/10 text-magenta"
                          : "text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.03]"
                      }`}>
                        <Icon className={`w-[18px] h-[18px] shrink-0 transition-all duration-300 ${active ? "drop-shadow-[0_0_8px_rgba(255,0,110,0.5)]" : "group-hover:scale-110"}`} />
                        {!collapsed && (
                          <span className="text-[13px] font-medium truncate">{t(item.labelKey)}</span>
                        )}
                        {active && !collapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-magenta animate-pulse-neon" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Bottom */}
        <div className="border-t border-white/[0.04] p-2 space-y-1 shrink-0">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.03] transition-all"
          >
            <Globe className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-[13px] font-medium">{language === "en" ? "العربية" : "English"}</span>}
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground/40 hover:text-rose hover:bg-rose/[0.06] transition-all"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-[13px] font-medium">{t("logout")}</span>}
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.03] transition-all"
          >
            {collapsed ? <PanelLeft className="w-[18px] h-[18px] shrink-0" /> : <PanelLeftClose className="w-[18px] h-[18px] shrink-0" />}
            {!collapsed && <span className="text-[13px] font-medium">{t("collapse")}</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
