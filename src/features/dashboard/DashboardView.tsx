import React from 'react';
import {
  KeyRound,
  Shield,
  Sparkles,
  Bookmark,
  CheckSquare,
  Wrench,
  Code,
  Terminal,
  FileCode2,
  Plus,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle2,
  Copy,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getPlatformAdapters } from '../../core/adapters';
import { useToastStore } from '../../store/useToastStore';
import { getTranslation } from '../../core/i18n/translations';

export const DashboardView: React.FC = () => {
  const { setActiveTab, setActiveToolboxTab, activityLogs, isVaultUnlocked, language } = useAppStore();
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
  const { showToast } = useToastStore();

  const activeKeysCount = apiKeys.filter((k) => k.status === 'active').length;
  const pendingTodosCount = todos.filter((t) => !t.completed).length;
  const favoriteVaultItems = vaultItems.filter((v) => v.isFavorite);
  const favoritePrompts = prompts.slice(0, 3);
  const favoriteBookmarks = bookmarks.filter((b) => b.isFavorite);

  const handleCopy = async (text: string, label: string) => {
    try {
      await getPlatformAdapters().clipboard.writeText(text);
      showToast('success', `${label} copied to clipboard`);
    } catch {
      showToast('error', 'Failed to copy');
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Welcome / Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/30 border border-zinc-800 shadow-sm text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              {getTranslation(language, 'app_title')}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v1.0.0 Desktop-Ready
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            {getTranslation(language, 'app_tagline')}. 100% Local-First, Encrypted PBKDF2/AES-GCM Storage, Zero External Tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setActiveTab('toolbox')}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
          >
            <Wrench className="h-3.5 w-3.5 -ms-0.5 me-1.5" />
            Dev Tools
          </Button>
          <Button size="sm" onClick={() => setActiveTab('vault')}>
            <Shield className="h-3.5 w-3.5 -ms-0.5 me-1.5" />
            {isVaultUnlocked ? 'Open Vault' : 'Unlock Vault'}
          </Button>
        </div>
      </div>

      {/* Summary Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card
          variant="interactive"
          onClick={() => setActiveTab('api-keys')}
          className="p-3.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">{getTranslation(language, 'active_keys')}</span>
            <KeyRound className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {activeKeysCount}
            </span>
            <span className="text-[11px] text-zinc-400">/ {apiKeys.length}</span>
          </div>
        </Card>

        <Card
          variant="interactive"
          onClick={() => setActiveTab('prompts')}
          className="p-3.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">{getTranslation(language, 'prompts_count')}</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {prompts.length}
            </span>
            <span className="text-[11px] text-emerald-500 font-medium">Ready</span>
          </div>
        </Card>

        <Card
          variant="interactive"
          onClick={() => setActiveTab('vault')}
          className="p-3.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">{getTranslation(language, 'vault_items')}</span>
            <Shield className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {vaultItems.length}
            </span>
            <span className="text-[10px] text-zinc-400">
              {isVaultUnlocked ? 'Unlocked' : 'AES-GCM'}
            </span>
          </div>
        </Card>

        <Card
          variant="interactive"
          onClick={() => setActiveTab('mcp')}
          className="p-3.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">MCP Servers</span>
            <Terminal className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {mcp.length}
            </span>
            <span className="text-[11px] text-zinc-400">Configs</span>
          </div>
        </Card>

        <Card
          variant="interactive"
          onClick={() => setActiveTab('notes-todos')}
          className="p-3.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">{getTranslation(language, 'pending_tasks')}</span>
            <CheckSquare className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {pendingTodosCount}
            </span>
            <span className="text-[11px] text-zinc-400">/ {todos.length}</span>
          </div>
        </Card>

        <Card
          variant="interactive"
          onClick={() => setActiveTab('snippets')}
          className="p-3.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">{getTranslation(language, 'snippets_count')}</span>
            <Code className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {snippets.length}
            </span>
            <span className="text-[11px] text-zinc-400">Codes</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Quick Actions + Recent Activity + Featured Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & Pinned Items (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Bar */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              {getTranslation(language, 'quick_actions')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('toolbox');
                  setActiveToolboxTab('qr');
                }}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors text-start"
              >
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <QrCode className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">QR Generator</div>
                  <div className="text-[10px] text-zinc-400 truncate">SVG / PNG Wi-Fi</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('vault')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors text-start"
              >
                <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Password Gen</div>
                  <div className="text-[10px] text-zinc-400 truncate">Entropy & Vault</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('api-keys')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors text-start"
              >
                <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Test API Key</div>
                  <div className="text-[10px] text-zinc-400 truncate">HTTP / CORS check</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('prompts')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors text-start"
              >
                <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">New Prompt</div>
                  <div className="text-[10px] text-zinc-400 truncate">Variables detect</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('toolbox');
                  setActiveToolboxTab('json');
                }}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors text-start"
              >
                <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Dev Toolbox</div>
                  <div className="text-[10px] text-zinc-400 truncate">JSON & Hashes</div>
                </div>
              </button>
            </div>
          </Card>

          {/* Featured Prompts */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Featured AI Prompts
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('prompts')}
                className="text-xs text-indigo-500 hover:underline flex items-center gap-1 font-medium"
              >
                View all ({prompts.length}) <ChevronRight className="h-3 w-3 rtl:rotate-180" />
              </button>
            </div>

            <div className="space-y-2.5">
              {favoritePrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => setActiveTab('prompts')}
                  className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {prompt.title}
                    </span>
                    <Badge variant="indigo" size="sm">
                      {prompt.category}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {prompt.description}
                  </p>
                  {prompt.variables.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-zinc-400 font-mono">Vars:</span>
                      {prompt.variables.map((v) => (
                        <span
                          key={v}
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        >
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Bookmarks Grid */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-sky-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Quick Bookmarks
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className="text-xs text-indigo-500 hover:underline flex items-center gap-1 font-medium"
              >
                Manage ({bookmarks.length}) <ChevronRight className="h-3 w-3 rtl:rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {favoriteBookmarks.slice(0, 4).map((bm) => (
                <a
                  key={bm.id}
                  href={bm.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {bm.faviconUrl ? (
                      <img
                        src={bm.faviconUrl}
                        alt=""
                        className="h-4 w-4 rounded-xs shrink-0 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    )}
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-500">
                      {bm.title}
                    </span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-zinc-400 opacity-60 group-hover:opacity-100 shrink-0" />
                </a>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Activity & Vault Shortcuts */}
        <div className="space-y-6">
          {/* Vault Security Status */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Password Vault
                </h3>
              </div>
              <Badge variant={isVaultUnlocked ? 'warning' : 'neutral'} size="sm">
                {isVaultUnlocked ? 'Session Unlocked' : 'Encrypted'}
              </Badge>
            </div>

            {isVaultUnlocked ? (
              <div className="space-y-2.5">
                <div className="text-xs text-zinc-500">Favorite Accounts:</div>
                {favoriteVaultItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono truncate">
                        {item.username || item.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.password, item.title)}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-100 px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      title="Copy password"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <Lock className="h-6 w-6 text-zinc-400 mx-auto" />
                <p className="text-xs text-zinc-400">
                  Vault is protected by PBKDF2 100,000 rounds + AES-GCM 256-bit encryption.
                </p>
                <Button size="sm" onClick={() => setActiveTab('vault')} className="w-full mt-2">
                  Unlock Vault
                </Button>
              </div>
            )}
          </Card>

          {/* Activity Stream */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-zinc-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {getTranslation(language, 'recent_activity')}
              </h3>
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 7).map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {log.action} {log.targetType}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{log.targetTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
