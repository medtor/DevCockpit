import React, { useState } from 'react';
import {
  LayoutDashboard,
  KeyRound,
  Shield,
  Sparkles,
  Terminal,
  FileCode2,
  Bookmark,
  CheckSquare,
  Wrench,
  Code,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  QrCode,
  FileJson,
  Binary,
  Fingerprint,
  Hash,
  SearchCode,
  Clock,
  Palette,
  Type,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';
import { NavigationTab } from '../../types';
import { getTranslation } from '../../core/i18n/translations';

interface NavItemDef {
  id: NavigationTab;
  titleKey: keyof typeof import('../../core/i18n/translations').translations['en'];
  icon: React.ReactNode;
  countKey?: keyof ReturnType<typeof useDataStore.getState>;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeToolboxTab,
    setActiveToolboxTab,
    isSidebarCollapsed,
    toggleSidebar,
    language,
  } = useAppStore();
  const dataStore = useDataStore();
  const [isToolboxSublistOpen, setIsToolboxSublistOpen] = useState(true);

  const toolboxSubItems: {
    id: string;
    titleKey: keyof typeof import('../../core/i18n/translations').translations['en'];
    icon: React.ReactNode;
  }[] = [
    { id: 'qr', titleKey: 'tool_qr', icon: <QrCode className="h-3.5 w-3.5 shrink-0" /> },
    { id: 'json', titleKey: 'tool_json', icon: <FileJson className="h-3.5 w-3.5 shrink-0" /> },
    { id: 'base64', titleKey: 'tool_base64', icon: <Binary className="h-3.5 w-3.5 shrink-0" /> },
    { id: 'uuid', titleKey: 'tool_uuid', icon: <Fingerprint className="h-3.5 w-3.5 shrink-0" /> },
    { id: 'hash', titleKey: 'tool_hash', icon: <Hash className="h-3.5 w-3.5 shrink-0" /> },
    { id: 'regex', titleKey: 'tool_regex', icon: <SearchCode className="h-3.5 w-3.5 shrink-0" /> },
    { id: 'timestamp', titleKey: 'tool_timestamp', icon: <Clock className="h-3.5 w-3.5 shrink-0" /> },
    { id: 'color', titleKey: 'tool_color', icon: <Palette className="h-3.5 w-3.5 shrink-0" /> },
    { id: 'text', titleKey: 'tool_text', icon: <Type className="h-3.5 w-3.5 shrink-0" /> },
  ];

  const navItems: NavItemDef[] = [
    {
      id: 'dashboard',
      titleKey: 'nav_dashboard',
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
    },
    {
      id: 'api-keys',
      titleKey: 'nav_api_keys',
      icon: <KeyRound className="h-4 w-4 shrink-0" />,
      countKey: 'apiKeys',
    },
    {
      id: 'vault',
      titleKey: 'nav_vault',
      icon: <Shield className="h-4 w-4 shrink-0" />,
      countKey: 'vaultItems',
    },
    {
      id: 'prompts',
      titleKey: 'nav_prompts',
      icon: <Sparkles className="h-4 w-4 shrink-0" />,
      countKey: 'prompts',
    },
    {
      id: 'mcp',
      titleKey: 'nav_mcp',
      icon: <Terminal className="h-4 w-4 shrink-0" />,
      countKey: 'mcp',
    },
    {
      id: 'skills',
      titleKey: 'nav_skills',
      icon: <FileCode2 className="h-4 w-4 shrink-0" />,
      countKey: 'skills',
    },
    {
      id: 'bookmarks',
      titleKey: 'nav_bookmarks',
      icon: <Bookmark className="h-4 w-4 shrink-0" />,
      countKey: 'bookmarks',
    },
    {
      id: 'notes-todos',
      titleKey: 'nav_notes_todos',
      icon: <CheckSquare className="h-4 w-4 shrink-0" />,
      countKey: 'todos',
    },
    {
      id: 'toolbox',
      titleKey: 'nav_toolbox',
      icon: <Wrench className="h-4 w-4 shrink-0" />,
    },
    {
      id: 'snippets',
      titleKey: 'nav_snippets',
      icon: <Code className="h-4 w-4 shrink-0" />,
      countKey: 'snippets',
    },
    {
      id: 'settings',
      titleKey: 'nav_settings',
      icon: <Settings className="h-4 w-4 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-e border-zinc-200 dark:border-zinc-800/90 bg-zinc-50 dark:bg-zinc-950/80 transition-all duration-200 select-none z-20 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-3.5 border-b border-zinc-200 dark:border-zinc-800/90">
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col text-start leading-tight">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
                DevDesk
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">Desktop Utility OS</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden sm:flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          ) : (
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const count = item.countKey
            ? ((dataStore as any)[item.countKey]?.length ?? 0)
            : undefined;

          if (item.id === 'toolbox') {
            return (
              <div key={item.id} className="space-y-0.5">
                <div
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-start relative group cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                  onClick={() => {
                    setActiveTab('toolbox');
                    if (!isToolboxSublistOpen) setIsToolboxSublistOpen(true);
                  }}
                  title={isSidebarCollapsed ? getTranslation(language, item.titleKey) : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
                      }`}
                    >
                      {item.icon}
                    </div>

                    {!isSidebarCollapsed && (
                      <span className="truncate">{getTranslation(language, item.titleKey)}</span>
                    )}
                  </div>

                  {!isSidebarCollapsed && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsToolboxSublistOpen(!isToolboxSublistOpen);
                      }}
                      className="p-1 rounded hover:bg-zinc-300/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      title={isToolboxSublistOpen ? 'Collapse Tools' : 'Expand Tools'}
                    >
                      {isToolboxSublistOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Sublist under Dev Toolbox */}
                {!isSidebarCollapsed && isToolboxSublistOpen && (
                  <div className="ms-3 ps-3 border-s border-zinc-200 dark:border-zinc-800/80 space-y-0.5 py-0.5">
                    {toolboxSubItems.map((sub) => {
                      const isSubActive =
                        activeTab === 'toolbox' && (activeToolboxTab || 'qr') === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setActiveTab('toolbox');
                            setActiveToolboxTab(sub.id);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors text-start ${
                            isSubActive
                              ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-semibold'
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/60'
                          }`}
                        >
                          <span
                            className={
                              isSubActive
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-zinc-400'
                            }
                          >
                            {sub.icon}
                          </span>
                          <span className="truncate">{getTranslation(language, sub.titleKey)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-start relative group ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title={isSidebarCollapsed ? getTranslation(language, item.titleKey) : undefined}
            >
              <div
                className={`${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
                }`}
              >
                {item.icon}
              </div>

              {!isSidebarCollapsed && (
                <span className="flex-1 truncate">{getTranslation(language, item.titleKey)}</span>
              )}

              {!isSidebarCollapsed && count !== undefined && count > 0 && (
                <span
                  className={`ms-auto px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive
                      ? 'bg-indigo-200/80 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Offline Badge */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/90">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="truncate font-medium">{getTranslation(language, 'offline_badge')}</span>
          </div>
        ) : (
          <div className="flex justify-center" title="Local-First / Offline Ready">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
