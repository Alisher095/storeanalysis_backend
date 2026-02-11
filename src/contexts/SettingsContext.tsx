import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NotificationSettings {
  performanceAlerts: boolean;
  importCompletion: boolean;
  weeklyReports: boolean;
  productRecommendations: boolean;
}

interface AppSettings {
  compactMode: boolean;
  dataRetention: string;
  notifications: NotificationSettings;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateNotification: (key: keyof NotificationSettings, value: boolean) => void;
  resetSettings: () => void;
  saveSettings: () => void;
  isSaving: boolean;
}

const defaultSettings: AppSettings = {
  compactMode: false,
  dataRetention: '12',
  notifications: {
    performanceAlerts: true,
    importCompletion: true,
    weeklyReports: true,
    productRecommendations: true,
  },
};

const STORAGE_KEY = 'shelfiq_settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setIsSaving(false);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateNotification,
        resetSettings,
        saveSettings,
        isSaving,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
