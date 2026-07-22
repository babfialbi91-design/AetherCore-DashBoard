import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, Trophy, Gamepad2, Swords, ShoppingBag, Calendar, Coins,
  ShoppingCart, Ticket, MessageCircleWarning, ScrollText, TrendingUp, Bell,
  GitBranch, ShieldBan, AlertTriangle, Bot, Megaphone, Palette,
  LogOut, Globe, PanelLeftClose, PanelLeft, Zap, Activity, Star, Settings
} from "lucide-react";

const navSections = [
  { label: "MAIN", items: [
    { path: "/", icon: LayoutDashboard, labelKey: "navOverview", accent: "#FF006E" },
    { path: "/leaderboard", icon: Trophy, labelKey: "navLeaderboard", accent: "#FFB800" },
    { path: "/levels", icon: TrendingUp, labelKey: "navLevels", accent: "#00D4FF" },
  ]},
  { label: "ECONOMY", items: [
    { path: "/economy", icon: Coins, labelKey: "navEconomy", accent: "#FFB800" },
    { path: "/shop", icon: ShoppingBag, labelKey: "navShop", accent: "#FF006E" },
    { path: "/purchases", icon: ShoppingCart, labelKey: "navPurchases", accent: "#8B5CF6" },
    { path: "/daily", icon: Calendar, labelKey: "navDaily", accent: "#10B981" },
  ]},
  { label: "COMMUNITY", items: [
    { path: "/lfg", icon: Gamepad2, labelKey: "navLfg", accent: "#00D4FF" },
    { path: "/tournaments", icon: Swords, labelKey: "navTournaments", accent: "#F43F5E" },
    { path: "/events", icon: Calendar, labelKey: "navEvents", accent: "#FFB800" },
    { path: "/tickets", icon: Ticket, labelKey: "navTickets", accent: "#8B5CF6" },
  ]},
  { label: "MODERATION", items: [
    { path: "/warnings", icon: AlertTriangle, labelKey: "navWarnings", accent: "#F43F5E" },
    { path: "/badwords", icon: ShieldBan, labelKey: "navBadwords", accent: "#F43F5E" },
    { path: "/autorules", icon: GitBranch, labelKey: "navAutorules", accent: "#00D4FF" },
    { path: "/logs", icon: ScrollText, labelKey: "navLogs", accent: "#FFB800" },
  ]},
  { label: "CUSTOMIZATION", items: [
    { path: "/welcome", icon: MessageCircleWarning, labelKey: "navWelcome", accent: "#10B981" },
    { path: "/notifications", icon: Bell, labelKey: "navNotifications", accent: "#FFB800" },
    { path: "/autoresponses", icon: Bot, labelKey: "navAutoResponses", accent: "#8B5CF6" },
    { path: "/embedbuilder", icon: Palette, labelKey: "navEmbedBuilder", accent: "#00D4FF" },
    { path: "/announce", icon: Megaphone, labelKey: "navAnnounce", accent: "#FF006E" },
  ]},
  { label: "SYSTEM", items: [
    { path: "/settings", icon: Settings, labelKey: "navSettings", accent: "#8B5CF6" },
  ]},
];

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#FF006E", "#8B5CF6", "#00D4FF", "#FFB800", "#10B981"];
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 0.03;
      ctx.strokeStyle = "#FF006E";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.6 }} />;
}

const THEME_KEY = "aethercore-theme";

type ThemeMode = "modern" | "classic";

export function getTheme(): ThemeMode {
  return (localStorage.getItem(THEME_KEY) as ThemeMode) || "modern";
}

export function setTheme(mode: ThemeMode) {
  localStorage.setItem(THEME_KEY, mode);
  window.dispatchEvent(new Event("theme-changed"));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [botProfile, setBotProfile] = useState<{ username: string; avatar: string; status: string; servers: { id: string; name: string; memberCount: number }[] } | null>(null);
  const [pageKey, setPageKey] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [theme, setThemeState] = useState<ThemeMode>(getTheme);

  const isClassic = theme === "classic";

  useEffect(() => {
    const loadProfile = () => {
      fetch("/bot/profile", { headers: { "Content-Type": "application/json" } })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data) setBotProfile(data); })
        .catch(() => {});
    };
    loadProfile();
    const onThemeChange = () => setThemeState(getTheme());
    window.addEventListener("theme-changed", onThemeChange);
    return () => window.removeEventListener("theme-changed", onThemeChange);
  }, []);

  useEffect(() => {
    setPageKey((k) => k + 1);
  }, [location]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const allNavItems = navSections.flatMap((s) => s.items);
  const activeIdx = allNavItems.findIndex((item) => location === item.path);
  const activeAccent = activeIdx >= 0 ? allNavItems[activeIdx].accent : "#FF006E";

  if (isClassic) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#1a1a2e]">
        <aside className="relative z-10 flex flex-col border-r border-white/10 bg-[#16213e] w-[220px] shrink-0">
          <div className="px-4 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              {botProfile?.avatar ? (
                <img src={botProfile.avatar} alt="" className="w-10 h-10 rounded-full ring-2 ring-white/20 object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0f3460] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white/70" />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{botProfile?.username || "AetherCore"}</p>
                <p className="text-[10px] text-green-400">{botProfile?.status || "Online"}</p>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1 py-2 px-2">
            {navSections.map((section) => (
              <div key={section.label} className="mb-3">
                <p className="px-3 mb-1 text-[10px] font-bold text-white/30 uppercase tracking-wider">{section.label}</p>
                {section.items.map((item) => {
                  const active = location === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path}>
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        active ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70 hover:bg-white/5"
                      }`}>
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-sm truncate">{t(item.labelKey)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </ScrollArea>
          <div className="border-t border-white/10 p-2 space-y-1 shrink-0">
            <button onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors">
              <Globe className="w-4 h-4 shrink-0" />
              <span className="text-sm">{language === "en" ? "العربية" : "English"}</span>
            </button>
            <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="text-sm">{t("logout")}</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto relative z-10 bg-[#1a1a2e]">
          <div className="max-w-[1200px] mx-auto px-6 py-6">
            <div key={pageKey} className="animate-fade-in">{children}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mesh" onMouseMove={handleMouseMove}>
      <ParticleCanvas />

      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-magenta/[0.05] blur-[200px] animate-float-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-violet/[0.06] blur-[180px] animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-[30%] right-[20%] w-[500px] h-[500px] rounded-full bg-cyan-bright/[0.04] blur-[150px] animate-float-slow" style={{ animationDelay: "-5s" }} />
        <div className="absolute top-[70%] left-[25%] w-[400px] h-[400px] rounded-full bg-amber/[0.03] blur-[120px] animate-float" style={{ animationDelay: "-7s" }} />
        <div className="absolute top-[5%] right-[35%] w-[300px] h-[300px] rounded-full bg-emerald/[0.03] blur-[100px] animate-float-slow" style={{ animationDelay: "-2s" }} />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-magenta/[0.06] blur-[120px] transition-all duration-1000 ease-out" style={{ left: mousePos.x - 150, top: mousePos.y - 150 }} />
      </div>

      <aside className={`relative z-10 flex flex-col border-r border-white/[0.06] bg-[#06040D]/90 backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${collapsed ? "w-[80px]" : "w-[280px]"}`}>
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
          <div className="h-full w-[200%] animate-gradient-border" style={{ background: `linear-gradient(90deg, ${activeAccent}, #8B5CF6, #00D4FF, ${activeAccent})` }} />
        </div>

        {!collapsed ? (
          <div className="px-4 pt-5 pb-4 border-b border-white/[0.05] shrink-0 animate-fade-in">
            <div className="flex items-center gap-3.5 mb-3">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-magenta via-violet to-cyan-bright opacity-40 blur-md group-hover:opacity-70 transition-opacity duration-500 animate-rotate-slow" style={{ animationDuration: "8s" }} />
                {botProfile?.avatar ? (
                  <img src={botProfile.avatar} alt="" className="relative w-12 h-12 rounded-2xl ring-2 ring-white/10 object-cover" />
                ) : (
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-magenta via-violet to-cyan-bright flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald border-[2.5px] border-[#06040D] animate-pulse-neon shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[15px] font-bold tracking-tight text-white truncate">{botProfile?.username || "AetherCore"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse-neon" />
                  <p className="text-[11px] text-emerald font-semibold tracking-wide uppercase">{botProfile?.status || "Online"}</p>
                </div>
              </div>
            </div>
            {botProfile?.servers && botProfile.servers.length > 0 && (
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                {botProfile.servers.map((server) => (
                  <div key={server.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04] mb-1.5 hover:bg-white/[0.05] transition-colors group">
                    {server.icon ? (
                      <img src={server.icon} alt="" className="w-6 h-6 rounded-lg object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet/30 to-cyan-bright/20 flex items-center justify-center">
                        <Star className="w-3 h-3 text-violet/60" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-white/70 truncate group-hover:text-white/90 transition-colors">{server.name}</p>
                    </div>
                    <span className="text-[9px] font-mono text-white/40">{(server.memberCount || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 border-b border-white/[0.05] shrink-0">
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-magenta via-violet to-cyan-bright opacity-30 blur-sm group-hover:opacity-60 transition-opacity" />
              {botProfile?.avatar ? (
                <img src={botProfile.avatar} alt="" className="relative w-10 h-10 rounded-xl ring-2 ring-white/10 object-cover" />
              ) : (
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-magenta via-violet to-cyan-bright flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald border-2 border-[#06040D] animate-pulse-neon" />
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 py-3 px-2">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[9px] font-black tracking-[0.2em] text-white/25 uppercase">{section.label}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = location === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path}>
                      <div
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                          active
                            ? "text-white"
                            : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                        }`}
                        style={active ? { background: `linear-gradient(135deg, ${item.accent}15, ${item.accent}08)`, boxShadow: `0 0 20px ${item.accent}10` } : {}}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full animate-pulse-neon" style={{ background: item.accent, boxShadow: `0 0 10px ${item.accent}60` }} />
                        )}
                        <Icon
                          className="w-[18px] h-[18px] shrink-0 transition-all duration-300"
                          style={active ? { color: item.accent, filter: `drop-shadow(0 0 8px ${item.accent}60)` } : {}}
                        />
                        {!collapsed && (
                          <span className="text-[13px] font-medium truncate">{t(item.labelKey)}</span>
                        )}
                        {active && !collapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse-neon" style={{ background: item.accent, boxShadow: `0 0 6px ${item.accent}` }} />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="border-t border-white/[0.05] p-2 space-y-1 shrink-0">
          <button onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-300">
            <Globe className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-[13px] font-medium">{language === "en" ? "العربية" : "English"}</span>}
          </button>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-rose hover:bg-rose/[0.06] transition-all duration-300">
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-[13px] font-medium">{t("logout")}</span>}
          </button>
          <button onClick={() => setCollapsed((v) => !v)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-300">
            {collapsed ? <PanelLeft className="w-[18px] h-[18px] shrink-0" /> : <PanelLeftClose className="w-[18px] h-[18px] shrink-0" />}
            {!collapsed && <span className="text-[13px] font-medium">{t("collapse")}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
          <div key={pageKey} className="animate-page-enter">{children}</div>
        </div>
      </main>
    </div>
  );
}
