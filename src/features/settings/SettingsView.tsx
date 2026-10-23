import React, { useState, useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldAlert,
  Database,
  Layers,
  Globe,
  Moon,
  Sun,
  HardDrive,
  CheckCircle2,
  FileCheck,
  Code,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Switch } from '../../components/ui/Switch';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { CodeViewer } from '../../components/ui/CodeViewer';
import { getTranslation } from '../../core/i18n/translations';
import { useToastStore } from '../../store/useToastStore';
import { SupportedLanguage } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
  } = useAppStore();

  const {
    exportBackupData,
    importBackupData,
    resetToDemoData,
    clearAllData,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [pendingImportData, setPendingImportData] = useState<any>(null);

  const handleExportBackup = () => {
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
      showToast('success', 'Backup JSON exported successfully');
    } catch {
      showToast('error', 'Export failed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setPendingImportData(json);
        setIsImportModalOpen(true);
      } catch {
        showToast('error', 'Invalid JSON file format');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeImport = () => {
    if (!pendingImportData) return;
    const res = importBackupData(pendingImportData, importMode === 'overwrite');
    if (res.success) {
      showToast('success', 'Backup imported successfully with Zod validation');
      setIsImportModalOpen(false);
    } else {
      showToast('error', 'Import validation failed', res.error);
    }
  };

  const handleResetDemo = () => {
    resetToDemoData();
    setIsResetConfirmOpen(false);
    showToast('success', 'Restored initial demo data');
  };


  const handleClearAll = () => {
    clearAllData();
    setIsClearConfirmOpen(false);
    showToast('info', 'All local data cleared');
  };

  const totalRecords =
    apiKeys.length +
    prompts.length +
    mcp.length +
    skills.length +
    bookmarks.length +
    notes.length +
    todos.length +
    snippets.length +
    vaultItems.length;

  const estimatedStorageBytes = JSON.stringify(exportBackupData()).length;

  return (
    <div className="space-y-6 text-start max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-500" />
          Settings & Local Data Engine
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Manage local storage adapters, language, dark mode, and encrypted backup snapshots.
        </p>
      </div>

      {/* Storage & Engine Status */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Local Storage Adapter Status
            </h3>
          </div>
          <Badge variant="success" size="sm">
            Local-First / Offline Ready
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-zinc-400">Active Storage Provider</span>
            <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              BrowserStorageAdapter
            </div>
            <span className="text-[10px] text-zinc-500">IndexedDB / LocalStorage</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-zinc-400">Total Persisted Entities</span>
            <div className="font-mono font-semibold text-indigo-500">{totalRecords} items</div>
            <span className="text-[10px] text-zinc-500">Across 9 domain modules</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-zinc-400">Estimated JSON Footprint</span>
            <div className="font-mono font-semibold text-emerald-500">
              {(estimatedStorageBytes / 1024).toFixed(2)} KB
            </div>
            <span className="text-[10px] text-zinc-500">Fast client-side payload</span>
          </div>
        </div>
      </Card>

      {/* Preferences Section */}
      <Card className="p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Application Preferences
        </h3>

        <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Appearance Theme</span>
              <p className="text-zinc-400 text-[11px]">
                Currently active: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5 -ms-0.5 me-1 text-amber-400" /> Switch to Light
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 -ms-0.5 me-1 text-indigo-500" /> Switch to Dark
                </>
              )}
            </Button>
          </div>

          {/* Language Selection */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Interface Language</span>
              <p className="text-zinc-400 text-[11px]">
                Supports English (LTR), French (LTR), and Arabic (العربية - Native RTL)
              </p>
            </div>
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5">
              {(['en', 'fr', 'ar'] as SupportedLanguage[]).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setLanguage(lng)}
                  className={`px-3 py-1 text-xs font-medium rounded-md uppercase transition-colors ${
                    language === lng
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Backup, Import & Migration Engine */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Backup, Export & Migration
            </h3>
          </div>
          <Badge variant="indigo" size="sm">
            Zod Schema Validated
          </Badge>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Create structured JSON backups containing API keys, encrypted vault items, prompts, MCP
          servers, and tasks. You can seamlessly restore this backup on another computer or Electron
          desktop build.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button onClick={handleExportBackup}>
            <Download className="h-4 w-4 -ms-0.5 me-1.5" />
            Export Backup (.JSON)
          </Button>

          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 -ms-0.5 me-1.5" />
            Import Backup (.JSON)
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button variant="outline" onClick={() => setIsResetConfirmOpen(true)}>
            <RefreshCw className="h-4 w-4 -ms-0.5 me-1.5" />
            Reset to Demo Data
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-5 border-rose-500/20 bg-rose-500/5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500">Danger Zone</h3>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              Purge All Local Workspace Data
            </span>
            <p className="text-zinc-400 text-[11px]">
              Erase all keys, secrets, notes, and preferences from this browser session.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsClearConfirmOpen(true)}
            className="shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5 -ms-0.5 me-1" />
            Purge All Data
          </Button>
        </div>
      </Card>

      {/* Architecture & Porting Guide */}
      <Card className="p-5 space-y-3 bg-zinc-900 text-zinc-100 border-zinc-800">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Tauri & Electron Porting Architecture
          </h3>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          DevDesk uses the <strong>Decoupled Platform Adapter Pattern</strong> (
          <code>IStorageAdapter</code>, <code>IHttpAdapter</code>, <code>ICryptoAdapter</code>,{' '}
          <code>IClipboardAdapter</code>). To compile into a native desktop binary (Tauri / Rust or
          Electron), simply replace <code>BrowserHttpAdapter</code> with a native Rust/Node HTTP
          fetcher to eliminate CORS limitations completely.
        </p>
      </Card>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Data Snapshot"
        description="Choose how to combine the imported file with your current data."
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="font-semibold text-zinc-300">Import Strategy:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImportMode('merge')}
                className={`p-3 rounded-lg border text-start transition-colors ${
                  importMode === 'merge'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                }`}
              >
                <div className="font-bold">Merge with Existing</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">Keep existing records and add new ones.</div>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('overwrite')}
                className={`p-3 rounded-lg border text-start transition-colors ${
                  importMode === 'overwrite'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-200'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                }`}
              >
                <div className="font-bold">Overwrite All</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">Replace entire database with imported file.</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={executeImport}>Confirm Import</Button>
          </div>
        </div>
      </Modal>

      {/* Reset to Demo Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset to Demo Data?"
        description="This will replace current items with standard developer presets."
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Are you sure? Any custom API keys or passwords you added might be overwritten.
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetDemo}>Reset to Demo</Button>
          </div>
        </div>
      </Modal>

      {/* Clear All Modal */}
      <Modal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        title="Purge All Data?"
        description="This will wipe all records and settings from local storage."
      >
        <div className="space-y-4">
          <p className="text-xs text-rose-400">
            Warning: This action cannot be undone. Make sure you have exported a JSON backup first!
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Yes, Purge Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
