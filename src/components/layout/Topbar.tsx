import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Globe,
  Lock,
  Unlock,
  Download,
  Menu,
  Shield,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';
import { getTranslation } from '../../core/i18n/translations';
import { SupportedLanguage } from '../../types';
import { useToastStore } from '../../store/useToastStore';

export const Topbar: React.FC = () => {
  const {
    activeTab,
    theme,
    toggleTheme,
    language,
    setLanguage,
    setCommandPaletteOpen,
    isVaultUnlocked,
    lockVault,
    setActiveTab,
    toggleSidebar,
  } = useAppStore();

  const { exportBackupData } = useDataStore();
  const { showToast } = useToastStore();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return getTranslation(language, 'nav_dashboard');
      case 'api-keys':
        return getTranslation(language, 'nav_api_keys');
      case 'vault':
        return getTranslation(language, 'nav_vault');
      case 'prompts':
        return getTranslation(language, 'nav_prompts');
      case 'mcp':
        return getTranslation(language, 'nav_mcp');
      case 'skills':
        return getTranslation(language, 'nav_skills');
      case 'bookmarks':
        return getTranslation(language, 'nav_bookmarks');
      case 'notes-todos':
        return getTranslation(language, 'nav_notes_todos');
      case 'toolbox':
        return getTranslation(language, 'nav_toolbox');
      case 'snippets':
        return getTranslation(language, 'nav_snippets');
      case 'settings':
        return getTranslation(language, 'nav_settings');
      default:
        return 'DevDesk';
    }
  };

  const handleQuickExport = () => {
    try {
      const data = exportBackupData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `devdesk-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', 'Backup downloaded successfully');
    } catch {
      showToast('error', 'Export failed');
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800/90 bg-white/80 dark:bg-zinc-950/80 px-4 backdrop-blur-xs z-10 select-none">
      {/* Left: Mobile Menu + View Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="sm:hidden flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {getTabTitle()}
          </span>
          <span className="hidden sm:inline-block h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="hidden sm:inline-block text-[11px] text-zinc-400">
            {getTranslation(language, 'app_tagline')}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-zinc-400" />
            <span>{getTranslation(language, 'search_placeholder')}</span>
          </div>
          <kbd className="inline-flex items-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Mobile Search button */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Vault Status Indicator */}
        <button
          type="button"
          onClick={() => {
            if (isVaultUnlocked) {
              lockVault();
              showToast('info', 'Vault Locked', 'Master password cleared from memory');
            } else {
              setActiveTab('vault');
            }
          }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
            isVaultUnlocked
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
          title={isVaultUnlocked ? 'Vault is Unlocked. Click to Lock.' : 'Vault is Locked. Click to Unlock.'}
        >
          {isVaultUnlocked ? (
            <>
              <Unlock className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Unlocked</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Locked</span>
            </>
          )}
        </button>

        {/* Quick Export Button */}
        <button
          type="button"
          onClick={handleQuickExport}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title="Quick Backup JSON"
        >
          <Download className="h-4 w-4" />
        </button>

        {/* Language Switcher */}
        <div className="relative group">
          <button
            type="button"
            className="flex h-8 items-center gap-1 px-2 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="uppercase">{language}</span>
          </button>
          <div className="absolute end-0 top-full mt-1 hidden group-hover:block group-focus-within:block w-32 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg py-1 z-30">
            <button
              onClick={() => setLanguage('en')}
              className={`w-full text-start px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                language === 'en' ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <span>English</span>
              <span className="text-[10px] text-zinc-400">LTR</span>
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`w-full text-start px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                language === 'ar' ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <span>العربية</span>
              <span className="text-[10px] text-zinc-400">RTL</span>
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`w-full text-start px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                language === 'fr' ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <span>Français</span>
              <span className="text-[10px] text-zinc-400">LTR</span>
            </button>
          </div>
        </div>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-zinc-700" />
          )}
        </button>
      </div>
    </header>
  );
};
