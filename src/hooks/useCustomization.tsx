import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";

export interface CustomizationSettings {
  primaryColor: string; // HSL hue value
  iconStyle: "outline" | "filled";
  fontSize: "small" | "medium" | "large";
  sidebarPosition: "left" | "right";
  compactMode: boolean;
}

const DEFAULT_SETTINGS: CustomizationSettings = {
  primaryColor: "220",
  iconStyle: "outline",
  fontSize: "medium",
  sidebarPosition: "left",
  compactMode: false,
};

const STORAGE_KEY = "user_customization";

function loadSettings(): CustomizationSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

interface CustomizationContextType {
  settings: CustomizationSettings;
  updateSettings: (partial: Partial<CustomizationSettings>) => void;
  resetSettings: () => void;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

const COLOR_PRESETS: Record<string, { hue: string; accent: string }> = {
  "220": { hue: "220", accent: "252" },   // Azul (padrão)
  "160": { hue: "160", accent: "180" },   // Verde
  "280": { hue: "280", accent: "310" },   // Roxo
  "340": { hue: "340", accent: "10" },    // Rosa
  "30":  { hue: "30",  accent: "45" },    // Laranja
  "0":   { hue: "0",   accent: "20" },    // Vermelho
  "190": { hue: "190", accent: "210" },   // Ciano
};

function applyColorTheme(hue: string) {
  const root = document.documentElement;
  const preset = COLOR_PRESETS[hue] || { hue, accent: String(Number(hue) + 30) };
  const h = preset.hue;
  const ah = preset.accent;

  root.style.setProperty("--primary", `${h} 90% 56%`);
  root.style.setProperty("--ring", `${h} 90% 56%`);
  root.style.setProperty("--accent", `${ah} 100% 67%`);
  root.style.setProperty("--sidebar-accent", `${h} 90% 56%`);
  root.style.setProperty("--sidebar-ring", `${h} 90% 56%`);

  // Update gradients
  root.style.setProperty("--gradient-primary", `linear-gradient(135deg, hsl(${h}, 90%, 56%) 0%, hsl(${ah}, 100%, 67%) 100%)`);
  root.style.setProperty("--gradient-blue", `linear-gradient(135deg, hsl(${h}, 90%, 56%) 0%, hsl(${Number(h) - 20}, 100%, 50%) 100%)`);
  root.style.setProperty("--gradient-aurora", `linear-gradient(135deg, hsl(${h}, 90%, 56%) 0%, hsl(${ah}, 100%, 67%) 50%, hsl(180, 80%, 45%) 100%)`);
  root.style.setProperty("--shadow-glow", `0 0 60px hsl(${h} 90% 56% / 0.15)`);
  root.style.setProperty("--shadow-float", `0 20px 60px hsl(${h} 90% 56% / 0.15)`);
}

function applyFontSize(size: "small" | "medium" | "large") {
  const root = document.documentElement;
  const sizes = { small: "13px", medium: "14px", large: "16px" };
  root.style.setProperty("font-size", sizes[size]);
}

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CustomizationSettings>(loadSettings);

  const applyAll = useCallback((s: CustomizationSettings) => {
    applyColorTheme(s.primaryColor);
    applyFontSize(s.fontSize);
    document.documentElement.classList.toggle("icon-filled", s.iconStyle === "filled");
    document.documentElement.classList.toggle("compact-mode", s.compactMode);
  }, []);

  useEffect(() => {
    applyAll(settings);
  }, [settings, applyAll]);

  const updateSettings = (partial: Partial<CustomizationSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetSettings = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <CustomizationContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const ctx = useContext(CustomizationContext);
  if (!ctx) throw new Error("useCustomization must be used within CustomizationProvider");
  return ctx;
}

export { COLOR_PRESETS };
