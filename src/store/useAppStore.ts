import { create } from 'zustand';
import {
  ActivityLog,
  DashboardWidgetConfig,
  NavigationTab,
  SupportedLanguage,
  ThemeMode,
} from '../types';

const INITIAL_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'stats', title: 'System Overview', visible: true, order: 0 },
  { id: 'quickActions', title: 'Quick Actions', visible: true, order: 1 },
  { id: 'recentActivity', title: 'Recent Activity', visible: true, order: 2 },
  { id: 'pinnedVault', title: 'Vault Favorites', visible: true, order: 3 },
  { id: 'pinnedPrompts', title: 'Featured Prompts', visible: true, order: 4 },
  { id: 'bookmarks', title: 'Quick Bookmarks', visible: true, order: 5 },
  { id: 'activeTasks', title: 'Priority Tasks', visible: true, order: 6 },
];

interface AppState {
  theme: ThemeMode;
  language: SupportedLanguage;
  activeTab: NavigationTab;
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  activityLogs: ActivityLog[];
  dashboardWidgets: DashboardWidgetConfig[];
  isVaultUnlocked: boolean;
  masterVaultKey: string | null;
  activeToolboxTab: string;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setActiveTab: (tab: NavigationTab) => void;
  setActiveToolboxTab: (toolTab: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  logActivity: (action: string, targetType: string, targetTitle: string) => void;
  unlockVault: (masterKey: string) => void;
  lockVault: () => void;
  toggleWidgetVisibility: (id: string) => void;
  reorderWidgets: (newWidgets: DashboardWidgetConfig[]) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  // Load saved preferences synchronously or defaults
  const savedTheme = (typeof window !== 'undefined' && (localStorage.getItem('devdesk_theme') as ThemeMode)) || 'dark';
  const savedLang = (typeof window !== 'undefined' && (localStorage.getItem('devdesk_lang') as SupportedLanguage)) || 'en';
  const savedSidebar = typeof window !== 'undefined' ? localStorage.getItem('devdesk_sidebar_collapsed') === 'true' : false;

  // Initialize html class & dir
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', savedLang);
  }

  return {
    theme: savedTheme,
    language: savedLang,
    activeTab: 'dashboard',
    isSidebarCollapsed: savedSidebar,
    isCommandPaletteOpen: false,
    activityLogs: [
      {
        id: 'act-1',
        action: 'Initialized',
        targetType: 'System',
        targetTitle: 'DevDesk Local-First Ready',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'act-2',
        action: 'Tested',
        targetType: 'API Key',
        targetTitle: 'Google Gemini 2.5 Flash',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'act-3',
        action: 'Synced',
        targetType: 'MCP Server',
        targetTitle: 'filesystem-server',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ],
    dashboardWidgets: INITIAL_WIDGETS,
    isVaultUnlocked: false,
    masterVaultKey: null,
    activeToolboxTab: 'qr',

    setTheme: (theme) => {
      set({ theme });
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        localStorage.setItem('devdesk_theme', theme);
      }
    },

    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(nextTheme);
    },

    setLanguage: (lang) => {
      set({ language: lang });
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        root.setAttribute('lang', lang);
        localStorage.setItem('devdesk_lang', lang);
      }
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
    },

    setActiveToolboxTab: (toolTab) => {
      set({ activeToolboxTab: toolTab });
    },

    setSidebarCollapsed: (collapsed) => {
      set({ isSidebarCollapsed: collapsed });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('devdesk_sidebar_collapsed', String(collapsed));
      }
    },

    toggleSidebar: () => {
      const next = !get().isSidebarCollapsed;
      get().setSidebarCollapsed(next);
    },

    setCommandPaletteOpen: (open) => {
      set({ isCommandPaletteOpen: open });
    },

    logActivity: (action, targetType, targetTitle) => {
      const newLog: ActivityLog = {
        id: `act-${Date.now()}`,
        action,
        targetType,
        targetTitle,
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        activityLogs: [newLog, ...state.activityLogs.slice(0, 9)],
      }));
    },

    unlockVault: (masterKey) => {
      set({ isVaultUnlocked: true, masterVaultKey: masterKey });
    },

    lockVault: () => {
      set({ isVaultUnlocked: false, masterVaultKey: null });
    },

    toggleWidgetVisibility: (id) => {
      set((state) => ({
        dashboardWidgets: state.dashboardWidgets.map((w) =>
          w.id === id ? { ...w, visible: !w.visible } : w
        ),
      }));
    },

    reorderWidgets: (newWidgets) => {
      set({ dashboardWidgets: newWidgets });
    },
  };
});
