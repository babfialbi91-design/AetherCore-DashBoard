import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, Trophy, Gamepad2, Swords, ShoppingBag, Calendar, Coins,
  ShoppingCart, Ticket, MessageCircleWarning, ScrollText, TrendingUp, Bell,
  GitBranch, ShieldBan, AlertTriangle, Bot, Megaphone, Palette, ChevronLeft,
  ChevronRight, LogOut, Globe, Image, PanelLeftClose, PanelLeft, Zap, Activity
} from "lucide-react";

async function apiCall<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

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
  const [botProfile, setBotProfile] = useState<{ username: string; avatar: string; status: string; serverCount: number; servers: { id: string; name: string; memberCount: number }[] } | null>(null);
  const [pageKey, setPageKey] = useState(0);

  useEffect(() => {
    apiCall("/bot/profile").then((data) => setBotProfile(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setPageKey((k) => k + 1);
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden bg-mesh">
      {/* Floating orbs — more of them, bigger */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] rounded-full bg-magenta/[0.04] blur-[150px] animate-float-slow" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-violet/[0.05] blur-[130px] animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-[30%] right-[15%] w-[400px] h-[400px] rounded-full bg-cyan-bright/[0.03] blur-[100px] animate-float-slow" style={{ animationDelay: "-5s" }} />
        <div className="absolute top-[70%] left-[30%] w-[350px] h-[350px] rounded-full bg-amber/[0.02] blur-[90px] animate-float" style={{ animationDelay: "-7s" }} />
        <div className="absolute top-[10%] right-[40%] w-[250px] h-[250px] rounded-full bg-emerald/[0.02] blur-[80px] animate-float-slow" style={{ animationDelay: "-2s" }} />
      </div>

      {/* Sidebar */}
      <aside className={`relative z-10 flex flex-col border-r border-white/[0.05] bg-[#08060E]/85 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${collapsed ? "w-[76px]" : "w-[280px]"}`}>
        {/* Bot Profile Header */}
        {!collapsed ? (
          <div className="px-4 pt-5 pb-4 border-b border-white/[0.05] shrink-0 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                {botProfile?.avatar ? (
                  <img src={botProfile.avatar} alt="" className="w-12 h-12 rounded-2xl ring-2 ring-magenta/30 shadow-lg shadow-magenta/10 object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-magenta via-violet to-cyan-bright flex items-center justify-center shadow-lg shadow-magenta/20">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald border-2 border-[#08060E] animate-pulse-neon" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[15px] font-bold tracking-tight text-foreground/90 truncate">{botProfile?.username || "AetherCore"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Zap className="w-3 h-3 text-emerald" />
                  <p className="text-[11px] text-emerald font-medium">{botProfile?.status || "Online"}</p>
                </div>
              </div>
            </div>
            {botProfile?.servers && botProfile.servers.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <Activity className="w-3.5 h-3.5 text-violet shrink-0" />
                <p className="text-[11px] text-muted-foreground/60 truncate">
                  {botProfile.servers.length} {botProfile.servers.length === 1 ? "server" : "servers"} • {botProfile.servers.reduce((a, s) => a + (s.memberCount || 0), 0).toLocaleString()} members
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 border-b border-white/[0.05] shrink-0">
            {botProfile?.avatar ? (
              <div className="relative">
                <img src={botProfile.avatar} alt="" className="w-10 h-10 rounded-xl ring-2 ring-magenta/30 shadow-lg shadow-magenta/10 object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald border-2 border-[#08060E] animate-pulse-neon" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-magenta via-violet to-cyan-bright flex items-center justify-center shadow-lg shadow-magenta/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        )}

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
                      <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                        active
                          ? "bg-magenta/10 text-magenta shadow-[0_0_20px_rgba(255,0,110,0.08)]"
                          : "text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.04]"
                      }`}>
                        <Icon className={`w-[18px] h-[18px] shrink-0 transition-all duration-300 ${active ? "drop-shadow-[0_0_10px_rgba(255,0,110,0.6)]" : "group-hover:scale-110 group-hover:rotate-3"}`} />
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
        <div className="border-t border-white/[0.05] p-2 space-y-1 shrink-0">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.02]"
          >
            <Globe className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-[13px] font-medium">{language === "en" ? "العربية" : "English"}</span>}
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground/40 hover:text-rose hover:bg-rose/[0.06] transition-all duration-300 hover:scale-[1.02]"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-[13px] font-medium">{t("logout")}</span>}
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground/40 hover:text-foreground/70 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.02]"
          >
            {collapsed ? <PanelLeft className="w-[18px] h-[18px] shrink-0" /> : <PanelLeftClose className="w-[18px] h-[18px] shrink-0" />}
            {!collapsed && <span className="text-[13px] font-medium">{t("collapse")}</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
          <div key={pageKey} className="animate-page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
