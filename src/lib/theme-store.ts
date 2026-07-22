const THEME_KEY = "aethercore-theme";
const SETTINGS_KEY = "aethercore-settings";

export type ThemeMode = "modern" | "classic";

const COLOR_MAP: Record<string, { primary: string; secondary: string; accent: string }> = {
  Nebula:  { primary: "#FF006E", secondary: "#8B5CF6", accent: "#00D4FF" },
  Ocean:   { primary: "#00D4FF", secondary: "#0EA5E9", accent: "#06B6D4" },
  Forest:  { primary: "#10B981", secondary: "#059669", accent: "#34D399" },
  Sunset:  { primary: "#F97316", secondary: "#EF4444", accent: "#FBBF24" },
  Royal:   { primary: "#8B5CF6", secondary: "#7C3AED", accent: "#A78BFA" },
  Rose:    { primary: "#F43F5E", secondary: "#E11D48", accent: "#FB7185" },
  Cyan:    { primary: "#00D4FF", secondary: "#22D3EE", accent: "#67E8F9" },
  Amber:   { primary: "#FFB800", secondary: "#F59E0B", accent: "#FCD34D" },
};

export function getTheme(): ThemeMode {
  return (localStorage.getItem(THEME_KEY) as ThemeMode) || "modern";
}

export function setTheme(mode: ThemeMode) {
  localStorage.setItem(THEME_KEY, mode);
  window.dispatchEvent(new Event("theme-changed"));
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    theme: "modern",
    colorPreset: "Nebula",
    overview: { showStats: true, showLeaderboard: true, showWarnings: true, showTickets: true, showEconomy: true, showShop: true },
  };
}

export function saveSettings(settings: any) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("settings-changed"));
}

export function applyColorPreset(presetName: string) {
  const preset = COLOR_MAP[presetName];
  if (!preset) return;
  const root = document.documentElement;
  root.style.setProperty("--color-magenta", preset.primary);
  root.style.setProperty("--color-cyan-bright", preset.accent);
  root.style.setProperty("--color-violet", preset.secondary);
}

export function applyAllSettings() {
  const settings = getSettings();
  if (settings.colorPreset) {
    applyColorPreset(settings.colorPreset);
  }
}
