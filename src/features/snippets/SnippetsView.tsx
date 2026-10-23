import React, { useState } from 'react';
import {
  Code,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Search,
  Check,
  Star,
  Layers,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { SnippetItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { CodeViewer } from '../../components/ui/CodeViewer';
import { EmptyState } from '../../components/ui/EmptyState';
import { getPlatformAdapters } from '../../core/adapters';
import { useToastStore } from '../../store/useToastStore';

const LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'bash',
  'sql',
  'rust',
  'go',
  'yaml',
  'json',
  'markdown',
];

export const SnippetsView: React.FC = () => {
  const { snippets, addSnippet, updateSnippet, deleteSnippet } = useDataStore();
  const { showToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(snippets[0]?.id || null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState('');
  const [tagsInput, setTagsInput] = useState('Frontend, React');

  const activeSnippet = snippets.find((s) => s.id === activeSnippetId) || snippets[0] || null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('Debounce Hook (React)');
    setDescription('Custom hook to debounce rapidly changing input state.');
    setLanguage('typescript');
    setCode(`import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`);
    setTagsInput('React, Hooks, TS');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: SnippetItem) => {
    setEditingId(s.id);
    setTitle(s.title);
    setDescription(s.description || '');
    setLanguage(s.language);
    setCode(s.code);
    setTagsInput((s.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      showToast('error', 'Title and Code are required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      updateSnippet(editingId, {
        title,
        description,
        language,
        code,
        tags,
      });
      showToast('success', 'Snippet updated');
    } else {
      addSnippet({
        title,
        description,
        language,
        code,
        tags,
        isFavorite: false,
      });
      showToast('success', 'Snippet saved');
    }
    setIsModalOpen(false);
  };

  const handleCopy = async (text: string) => {
    await getPlatformAdapters().clipboard.writeText(text);
    showToast('success', 'Code copied to clipboard');
  };

  const filteredSnippets = snippets.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      (s.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesLang = langFilter === 'all' || s.language === langFilter;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-500" />
            Developer Code Snippets & Gists
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Store essential boilerplate algorithms, shell one-liners, SQL queries, and hooks.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 -ms-0.5 me-1.5" />
          Add Snippet
        </Button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Snippets List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <Input
            placeholder="Search code, title, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startIcon={<Search className="h-4 w-4" />}
          />

          {/* Language filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setLangFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition-colors ${
                langFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
              }`}
            >
              All
            </button>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLangFilter(lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition-colors ${
                  langFilter === lang
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredSnippets.length > 0 ? (
              filteredSnippets.map((item) => {
                const isSelected = activeSnippet?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveSnippetId(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-start ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <Badge variant="neutral" size="sm">
                        {item.language}
                      </Badge>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap">
                        {(item.tags || []).map((t) => (
                          <span key={t} className="text-[10px] text-zinc-400 font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 text-zinc-400 hover:text-zinc-200"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSnippet(item.id)}
                          className="p-1 text-zinc-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon={<Code className="h-5 w-5" />}
                title="No Snippets"
                description="Save algorithms, boilerplate, and helper scripts."
                actionLabel="Add Snippet"
                onAction={handleOpenAdd}
              />
            )}
          </div>
        </div>

        {/* Right Column: Code Viewer (7 cols) */}
        <div className="lg:col-span-7">
          {activeSnippet ? (
            <Card className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {activeSnippet.title}
                    </h3>
                    <Badge variant="indigo" size="sm">
                      {activeSnippet.language}
                    </Badge>
                  </div>
                  {activeSnippet.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {activeSnippet.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" onClick={() => handleCopy(activeSnippet.code)}>
                    <Copy className="h-3.5 w-3.5 -ms-0.5 me-1" />
                    Copy Code
                  </Button>
                </div>
              </div>

              <div>
                <CodeViewer
                  code={activeSnippet.code}
                  language={activeSnippet.language}
                  maxHeight="450px"
                  showLineNumbers
                />
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-zinc-400">
              Select or create a snippet to view source code.
            </Card>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Snippet' : 'Add Snippet'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Snippet Title"
                placeholder="e.g. Postgres Connection Pooler"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Language</label>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={LANGUAGES.map((l) => ({ value: l, label: l.toUpperCase() }))}
              />
            </div>
          </div>

          <Input
            label="Description"
            placeholder="Brief purpose of the snippet..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Textarea
            label="Source Code"
            rows={10}
            className="font-mono text-xs"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Input
            label="Tags (comma-separated)"
            placeholder="TypeScript, Database, Backend"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Snippet</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
