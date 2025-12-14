import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppSettings {
  logo_url: string | null;
  app_name: string;
  trial_duration_days: number;
}

interface AppSettingsContextType {
  settings: AppSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  logo_url: null,
  app_name: "Backstage Pro",
  trial_duration_days: 3,
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_key, setting_value");

      if (error) {
        console.error("Error fetching app settings:", error);
        return;
      }

      const newSettings = { ...defaultSettings };
      
      data?.forEach(setting => {
        if (setting.setting_key === "logo_url") {
          newSettings.logo_url = setting.setting_value;
        } else if (setting.setting_key === "app_name") {
          newSettings.app_name = setting.setting_value || "Backstage Pro";
        } else if (setting.setting_key === "trial_duration_days") {
          newSettings.trial_duration_days = parseInt(setting.setting_value || "3", 10);
        }
      });

      setSettings(newSettings);
    } catch (err) {
      console.error("Error fetching app settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <AppSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }
  return context;
}
