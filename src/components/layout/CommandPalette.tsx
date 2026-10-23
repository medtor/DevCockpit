import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  KeyRound,
  FileCode2,
  Terminal,
  Sparkles,
  Bookmark,
  CheckSquare,
  Wrench,
  Shield,
  Settings,
  LayoutDashboard,
  Moon,
  Sun,
  Globe,
  Plus,
  ArrowRight,
  Code,
  FileText,
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

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    setActiveToolboxTab,
    toggleTheme,
    setLanguage,
    language,
    theme,
  } = useAppStore();

  const {
    apiKeys,
    prompts,
    mcp,
    skills,
    bookmarks,
    notes,
    todos,
    snippets,
    vaultItems,
  } = useDataStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open with Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const items = useMemo(() => {
    const list: {
      id: string;
      title: string;
      subtitle?: string;
      category: string;
      icon: React.ReactNode;
      action: () => void;
    }[] = [];

    // Navigation
    const navItems: { id: NavigationTab; title: string; icon: React.ReactNode }[] = [
      { id: 'dashboard', title: 'Go to Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: 'api-keys', title: 'Go to API Key Manager & Tester', icon: <KeyRound className="h-4 w-4" /> },
      { id: 'vault', title: 'Go to Password Vault', icon: <Shield className="h-4 w-4" /> },
      { id: 'prompts', title: 'Go to Prompt Studio', icon: <Sparkles className="h-4 w-4" /> },
      { id: 'mcp', title: 'Go to MCP Server Manager', icon: <Terminal className="h-4 w-4" /> },
      { id: 'skills', title: 'Go to Skills & Instructions', icon: <FileCode2 className="h-4 w-4" /> },
      { id: 'bookmarks', title: 'Go to Bookmarks', icon: <Bookmark className="h-4 w-4" /> },
      { id: 'notes-todos', title: 'Go to Notes & Tasks', icon: <CheckSquare className="h-4 w-4" /> },
      { id: 'toolbox', title: 'Go to Dev Toolbox', icon: <Wrench className="h-4 w-4" /> },
      { id: 'snippets', title: 'Go to Code Snippets', icon: <Code className="h-4 w-4" /> },
      { id: 'settings', title: 'Go to Settings & Data', icon: <Settings className="h-4 w-4" /> },
    ];

    navItems.forEach((n) => {
      list.push({
        id: `nav-${n.id}`,
        title: n.title,
        category: 'Navigation',
        icon: n.icon,
        action: () => {
          setActiveTab(n.id);
          setCommandPaletteOpen(false);
        },
      });
    });

    // Quick Actions
    list.push({
      id: 'act-theme',
      title: `Toggle Theme (Current: ${theme === 'dark' ? 'Dark' : 'Light'})`,
      category: 'Preferences',
      icon: theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />,
      action: () => {
        toggleTheme();
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'act-lang-ar',
      title: 'Switch Language to Arabic (العربية - RTL)',
      category: 'Preferences',
      icon: <Globe className="h-4 w-4 text-emerald-400" />,
      action: () => {
        setLanguage('ar');
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'act-lang-en',
      title: 'Switch Language to English (LTR)',
      category: 'Preferences',
      icon: <Globe className="h-4 w-4 text-sky-400" />,
      action: () => {
        setLanguage('en');
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'act-lang-fr',
      title: 'Switch Language to French (Français)',
      category: 'Preferences',
      icon: <Globe className="h-4 w-4 text-purple-400" />,
      action: () => {
        setLanguage('fr');
        setCommandPaletteOpen(false);
      },
    });

    // Dev Toolbox Sub-tools
    const tools: { id: string; title: string; subtitle: string; icon: React.ReactNode }[] = [
      {
        id: 'qr',
        title: 'Tool: QR Code Generator',
        subtitle: 'Vector SVG, PNG, Wi-Fi, URL, vCard, Email, SMS',
        icon: <QrCode className="h-4 w-4 text-emerald-400" />,
      },
      {
        id: 'json',
        title: 'Tool: JSON Formatter & TypeScript Interface',
        subtitle: 'Format, minify, generate TypeScript types',
        icon: <FileJson className="h-4 w-4 text-amber-400" />,
      },
      {
        id: 'base64',
        title: 'Tool: Base64 / URL / Hex Encoder & Decoder',
        subtitle: 'Encode and decode strings and hex data',
        icon: <Binary className="h-4 w-4 text-sky-400" />,
      },
      {
        id: 'uuid',
        title: 'Tool: UUID v4 Generator',
        subtitle: 'Generate random bulk unique identifiers',
        icon: <Fingerprint className="h-4 w-4 text-purple-400" />,
      },
      {
        id: 'hash',
        title: 'Tool: Crypto Hashes (SHA-256 / SHA-512)',
        subtitle: 'Compute client-side cryptographic hashes',
        icon: <Hash className="h-4 w-4 text-rose-400" />,
      },
      {
        id: 'regex',
        title: 'Tool: Regex Tester & Matcher',
        subtitle: 'Test regular expressions with capture groups and flags',
        icon: <SearchCode className="h-4 w-4 text-teal-400" />,
      },
      {
        id: 'timestamp',
        title: 'Tool: Unix Timestamp & Date Converter',
        subtitle: 'Convert epoch seconds/ms to ISO, UTC and local time',
        icon: <Clock className="h-4 w-4 text-indigo-400" />,
      },
      {
        id: 'color',
        title: 'Tool: Color Space Converter',
        subtitle: 'Convert HEX, RGB, HSL, RGBA palettes',
        icon: <Palette className="h-4 w-4 text-fuchsia-400" />,
      },
      {
        id: 'text',
        title: 'Tool: Text Case & Line Deduplicator',
        subtitle: 'camelCase, PascalCase, snake_case, kebab-case transformations',
        icon: <Type className="h-4 w-4 text-blue-400" />,
      },
    ];

    tools.forEach((t) => {
      list.push({
        id: `tool-${t.id}`,
        title: t.title,
        subtitle: t.subtitle,
        category: 'Dev Toolbox',
        icon: t.icon,
        action: () => {
          setActiveTab('toolbox');
          setActiveToolboxTab(t.id);
          setCommandPaletteOpen(false);
        },
      });
    });

    // Domain items
    apiKeys.forEach((k) => {
      list.push({
        id: `key-${k.id}`,
        title: `API Key: ${k.providerName} (${k.defaultModel || 'Default'})`,
        subtitle: `Env: ${k.environment} • Tags: ${k.tags.join(', ')}`,
        category: 'API Keys',
        icon: <KeyRound className="h-4 w-4 text-indigo-400" />,
        action: () => {
          setActiveTab('api-keys');
          setCommandPaletteOpen(false);
        },
      });
    });

    prompts.forEach((p) => {
      list.push({
        id: `prompt-${p.id}`,
        title: `Prompt: ${p.title}`,
        subtitle: `${p.category} • Variables: ${p.variables.join(', ') || 'None'}`,
        category: 'Prompts',
        icon: <Sparkles className="h-4 w-4 text-amber-400" />,
        action: () => {
          setActiveTab('prompts');
          setCommandPaletteOpen(false);
        },
      });
    });

    mcp.forEach((m) => {
      list.push({
        id: `mcp-${m.id}`,
        title: `MCP Server: ${m.name}`,
        subtitle: `Type: ${m.type} • ${m.description}`,
        category: 'MCP Configs',
        icon: <Terminal className="h-4 w-4 text-emerald-400" />,
        action: () => {
          setActiveTab('mcp');
          setCommandPaletteOpen(false);
        },
      });
    });

    notes.forEach((n) => {
      list.push({
        id: `note-${n.id}`,
        title: `Note: ${n.title}`,
        subtitle: n.tags.join(', '),
        category: 'Notes',
        icon: <FileText className="h-4 w-4 text-sky-400" />,
        action: () => {
          setActiveTab('notes-todos');
          setCommandPaletteOpen(false);
        },
      });
    });

    snippets.forEach((s) => {
      list.push({
        id: `snip-${s.id}`,
        title: `Snippet: ${s.title} (${s.language})`,
        subtitle: s.tags.join(', '),
        category: 'Snippets',
        icon: <Code className="h-4 w-4 text-pink-400" />,
        action: () => {
          setActiveTab('snippets');
          setCommandPaletteOpen(false);
        },
      });
    });

    vaultItems.forEach((v) => {
      list.push({
        id: `vault-${v.id}`,
        title: `Vault Secret: ${v.title}`,
        subtitle: v.username || v.email,
        category: 'Vault',
        icon: <Shield className="h-4 w-4 text-emerald-400" />,
        action: () => {
          setActiveTab('vault');
          setCommandPaletteOpen(false);
        },
      });
    });

    return list;
  }, [apiKeys, prompts, mcp, skills, bookmarks, notes, todos, snippets, vaultItems, theme, language, setActiveTab, setActiveToolboxTab, setCommandPaletteOpen, setLanguage, toggleTheme]);

  const filteredItems = useMemo(() => {
    if (!query) return items.slice(0, 15);
    const q = query.toLowerCase();
    return items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [items, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3.5">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredItems.length > 0 ? (
            <div className="space-y-1">
              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors text-start ${
                      isSelected
                        ? 'bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-200'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-1.5 rounded-md ${
                          isSelected
                            ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{item.title}</div>
                        {item.subtitle && (
                          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {item.category}
                      </span>
                      {isSelected && <ArrowRight className="h-3 w-3 text-indigo-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching commands or resources found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 px-4 py-2 text-[11px] text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="font-mono text-[10px]">DevDesk Local-First Engine</span>
        </div>
      </div>
    </div>
  );
};
