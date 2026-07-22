const THEME_KEY = "aethercore-theme";
const SETTINGS_KEY = "aethercore-settings";

export type ThemeMode = "modern" | "classic";

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
