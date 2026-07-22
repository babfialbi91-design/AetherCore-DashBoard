import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { getTheme, setTheme, getSettings, saveSettings, applyColorPreset } from "@/lib/theme-store";
import { Settings, Palette, Monitor, Eye, Layout, Sparkles, Save, Check, LayoutDashboard, Bell, Shield, Users, Coins, ShoppingBag } from "lucide-react";

const COLOR_PRESETS = [
  { name: "Nebula", primary: "#FF006E", secondary: "#8B5CF6", accent: "#00D4FF" },
  { name: "Ocean", primary: "#00D4FF", secondary: "#0EA5E9", accent: "#06B6D4" },
  { name: "Forest", primary: "#10B981", secondary: "#059669", accent: "#34D399" },
  { name: "Sunset", primary: "#F97316", secondary: "#EF4444", accent: "#FBBF24" },
  { name: "Royal", primary: "#8B5CF6", secondary: "#7C3AED", accent: "#A78BFA" },
  { name: "Rose", primary: "#F43F5E", secondary: "#E11D48", accent: "#FB7185" },
  { name: "Cyan", primary: "#00D4FF", secondary: "#22D3EE", accent: "#67E8F9" },
  { name: "Amber", primary: "#FFB800", secondary: "#F59E0B", accent: "#FCD34D" },
];

const OVERVIEW_OPTIONS = [
  { key: "showStats", labelEn: "Show Statistics Cards", labelAr: "إحصائيات", icon: LayoutDashboard },
  { key: "showLeaderboard", labelEn: "Show Leaderboard Preview", labelAr: "لوحة الصدارة", icon: Users },
  { key: "showWarnings", labelEn: "Show Warnings Card", labelAr: "التحذيرات", icon: Shield },
  { key: "showTickets", labelEn: "Show Tickets Card", labelAr: "التذاكر", icon: Bell },
  { key: "showEconomy", labelEn: "Show Economy Card", labelAr: "الاقتصاد", icon: Coins },
  { key: "showShop", labelEn: "Show Shop Stats", labelAr: "المتجر", icon: ShoppingBag },
];

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(getSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handler = () => setSettings(getSettings());
    window.addEventListener("settings-changed", handler);
    window.addEventListener("theme-changed", handler);
    return () => {
      window.removeEventListener("settings-changed", handler);
      window.removeEventListener("theme-changed", handler);
    };
  }, []);

  const updateTheme = (mode: "modern" | "classic") => {
    setTheme(mode);
    const next = { ...settings, theme: mode };
    setSettings(next);
    saveSettings(next);
  };

  const updateColor = (preset: typeof COLOR_PRESETS[0]) => {
    applyColorPreset(preset.name);
    const next = { ...settings, colorPreset: preset.name };
    setSettings(next);
    saveSettings(next);
  };

  const toggleOverview = (key: string) => {
    const next = { ...settings, overview: { ...settings.overview, [key]: !settings.overview?.[key] } };
    setSettings(next);
    saveSettings(next);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isClassic = settings.theme === "classic";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={isClassic ? "" : "animate-card-entrance"}>
        <div className={`relative overflow-hidden ${isClassic ? "bg-gray-800 border border-gray-700 rounded-lg" : "rounded-3xl bg-gradient-to-br from-violet/[0.08] via-magenta/[0.04] to-cyan-bright/[0.06] border border-white/[0.06] noise-overlay"} p-6 ${isClassic ? "" : "p-8"}`}>
          {!isClassic && <div className="absolute inset-0 bg-grid-nebula opacity-30" />}
          {!isClassic && <div className="absolute top-0 right-0 w-64 h-64 bg-violet/[0.1] rounded-full blur-[100px] animate-float-slow" />}
          <div className="relative z-10 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isClassic ? "bg-blue-600" : "bg-gradient-to-br from-violet to-magenta shadow-lg shadow-violet/20"}`}>
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`font-bold leading-tight ${isClassic ? "text-lg text-white" : "text-3xl text-white"}`}>{language === "ar" ? "الإعدادات" : "Settings"}</h1>
              <p className={`text-xs ${isClassic ? "text-gray-400" : "text-white/40"}`}>{language === "ar" ? "تخصيص مظهر الداشبورد" : "Customize your dashboard appearance"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme Mode */}
        <div className={isClassic ? "" : "animate-card-entrance stagger-1"}>
          <Card className={`${isClassic ? "bg-gray-800 border-gray-700" : "border-white/[0.06]"} overflow-hidden`}>
            {!isClassic && <div className="h-1.5 bg-gradient-to-r from-violet to-magenta" />}
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <Monitor className={`w-5 h-5 ${isClassic ? "text-blue-400" : "text-violet"}`} />
                <h3 className={`text-lg font-bold ${isClassic ? "text-white" : "text-white"}`}>{language === "ar" ? "التصميم" : "Design Mode"}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateTheme("modern")}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    !isClassic
                      ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                      : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                  }`}
                >
                  <Sparkles className={`w-5 h-5 mb-2 ${!isClassic ? "text-blue-400" : "text-gray-400"}`} />
                  <p className={`text-sm font-bold mb-1 ${isClassic ? "text-gray-300" : "text-white"}`}>{language === "ar" ? "حديث" : "Modern"}</p>
                  <p className="text-[10px] text-gray-500">{language === "ar" ? "تأثيرات بصرية متقدمة" : "Advanced visual effects"}</p>
                  {!isClassic && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                </button>
                <button
                  onClick={() => updateTheme("classic")}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    isClassic
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                  }`}
                >
                  <Layout className={`w-5 h-5 mb-2 ${isClassic ? "text-blue-400" : "text-gray-400"}`} />
                  <p className={`text-sm font-bold mb-1 ${isClassic ? "text-white" : "text-gray-300"}`}>{language === "ar" ? "كلاسيكي" : "Classic"}</p>
                  <p className="text-[10px] text-gray-500">{language === "ar" ? "تصميم بسيط وأنيق" : "Simple and clean design"}</p>
                  {isClassic && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-400" />}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Presets - only show in modern */}
        {!isClassic && (
          <div className="animate-card-entrance stagger-2">
            <Card className="border-white/[0.06] overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-cyan-bright to-emerald" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Palette className="w-5 h-5 text-cyan-bright" />
                  <h3 className="text-lg font-bold text-white">{language === "ar" ? "الألوان" : "Color Theme"}</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateColor(preset)}
                      className={`group relative p-3 rounded-xl border-2 transition-all duration-300 ${
                        settings.colorPreset === preset.name
                          ? "border-white/30 bg-white/[0.06]"
                          : "border-white/[0.04] bg-white/[0.02] hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="flex gap-1 mb-2">
                        <div className="w-4 h-4 rounded-full" style={{ background: preset.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ background: preset.secondary }} />
                        <div className="w-4 h-4 rounded-full" style={{ background: preset.accent }} />
                      </div>
                      <p className="text-[10px] font-bold text-white/60">{preset.name}</p>
                      {settings.colorPreset === preset.name && (
                        <div className="absolute top-2 right-2"><Check className="w-3 h-3 text-white" /></div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Classic info card */}
        {isClassic && (
          <Card className="bg-gray-800 border-gray-700 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">{language === "ar" ? "الوضع الكلاسيكي" : "Classic Mode"}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {language === "ar"
                  ? "الوضع الكلاسيكي يوفر تصميم بسيط وسريع بدون تأثيرات بصرية. الداشبورد سيكون أسرع في التحميل وأكثر.UseTextية."
                  : "Classic mode provides a simple, fast design without visual effects. The dashboard will load faster and be more lightweight."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Overview Display Settings */}
      <div className={isClassic ? "" : "animate-card-entrance stagger-3"}>
        <Card className={`${isClassic ? "bg-gray-800 border-gray-700" : "border-white/[0.06]"} overflow-hidden`}>
          {!isClassic && <div className="h-1.5 bg-gradient-to-r from-amber to-rose" />}
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <Eye className={`w-5 h-5 ${isClassic ? "text-blue-400" : "text-amber"}`} />
              <h3 className="text-lg font-bold text-white">{language === "ar" ? "إعدادات العرض" : "Overview Display"}</h3>
            </div>
            <p className={`text-sm mb-5 ${isClassic ? "text-gray-400" : "text-white/40"}`}>{language === "ar" ? "اختر ما يظهر للمدير في صفحة النظرة العامة" : "Choose what admins see on the overview page"}</p>
            <div className="space-y-2">
              {OVERVIEW_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const enabled = settings.overview?.[opt.key] !== false;
                return (
                  <button
                    key={opt.key}
                    onClick={() => toggleOverview(opt.key)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                      isClassic
                        ? enabled
                          ? "border-gray-600 bg-gray-700/50"
                          : "border-gray-700 bg-gray-800/50 opacity-50"
                        : enabled
                          ? "border-white/[0.08] bg-white/[0.04]"
                          : "border-white/[0.04] bg-white/[0.01] opacity-50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${enabled ? (isClassic ? "text-blue-400" : "text-amber") : (isClassic ? "text-gray-600" : "text-white/30")}`} />
                    <span className="flex-1 text-sm font-medium text-white/80">{language === "ar" ? opt.labelAr : opt.labelEn}</span>
                    <div className={`w-10 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 ${enabled ? "bg-blue-600 justify-end" : "bg-gray-600 justify-start"}`}>
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save */}
      <div className={`flex justify-end ${isClassic ? "" : "animate-card-entrance stagger-4"}`}>
        <Button onClick={handleSave} className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 ${saved ? "bg-green-600 text-white" : isClassic ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gradient-to-r from-magenta to-violet text-white hover:shadow-[0_0_30px_rgba(255,0,110,0.2)] hover:scale-[1.02]"}`}>
          {saved ? <><Check className="w-4 h-4 mr-2" /> {language === "ar" ? "تم الحفظ" : "Saved!"}</> : <><Save className="w-4 h-4 mr-2" /> {language === "ar" ? "حفظ" : "Save Changes"}</>}
        </Button>
      </div>
    </div>
  );
}
