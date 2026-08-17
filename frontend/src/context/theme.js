import { createContext, useContext } from "react";
import { DEFAULT_THEME_PRESET_ID, HERO_UI_THEME_PRESETS } from "../data/herouiThemePresets";

export const ThemeContext = createContext(null);

const PRESET_IDS = new Set(HERO_UI_THEME_PRESETS.map((p) => p.id));

export function isValidThemePreset(presetId) {
  return presetId.startsWith("#") || PRESET_IDS.has(presetId);
}

/** apply preset to `<html>` immediately so `--accent` updates before paint. */
export function applyThemePresetToDocument(presetId) {
  if (presetId.startsWith("#")) {
    document.documentElement.style.setProperty("--accent", presetId);
    // Rough estimate for foreground color based on background hex
    document.documentElement.style.setProperty("--accent-foreground", "#ffffff");
    document.documentElement.removeAttribute("data-theme-preset");
  } else {
    document.documentElement.style.removeProperty("--accent");
    document.documentElement.style.removeProperty("--accent-foreground");
    const id = isValidThemePreset(presetId) ? presetId : DEFAULT_THEME_PRESET_ID;
    document.documentElement.setAttribute("data-theme-preset", id);
  }
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
