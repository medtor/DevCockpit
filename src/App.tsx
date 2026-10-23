import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { useDataStore } from './store/useDataStore';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastProvider } from './components/ui/ToastProvider';

// Views
import { DashboardView } from './features/dashboard/DashboardView';
import { ApiKeyManagerView } from './features/api-keys/ApiKeyManagerView';
import { PasswordVaultView } from './features/vault/PasswordVaultView';
import { PromptManagerView } from './features/prompts/PromptManagerView';
import { McpManagerView } from './features/mcp/McpManagerView';
import { SkillsManagerView } from './features/skills/SkillsManagerView';
import { BookmarksView } from './features/bookmarks/BookmarksView';
import { NotesTodosView } from './features/notes-todos/NotesTodosView';
import { DevToolboxView } from './features/toolbox/DevToolboxView';
import { SnippetsView } from './features/snippets/SnippetsView';
import { SettingsView } from './features/settings/SettingsView';

export default function App() {
  const { activeTab, language, theme } = useAppStore();
  const { initStorage } = useDataStore();

  useEffect(() => {
    initStorage();
  }, [initStorage]);


  // Sync HTML dir and lang attributes for full RTL/LTR native logical support
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [language, theme]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'api-keys':
        return <ApiKeyManagerView />;
      case 'vault':
        return <PasswordVaultView />;
      case 'prompts':
        return <PromptManagerView />;
      case 'mcp':
        return <McpManagerView />;
      case 'skills':
        return <SkillsManagerView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'notes-todos':
        return <NotesTodosView />;
      case 'toolbox':
        return <DevToolboxView />;
      case 'snippets':
        return <SnippetsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      {/* Decoupled Desktop Shell Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <Topbar />

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin bg-zinc-100/60 dark:bg-transparent">
          <div className="mx-auto max-w-7xl w-full">{renderActiveView()}</div>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Global Toast System */}
      <ToastProvider />
    </div>
  );
}

