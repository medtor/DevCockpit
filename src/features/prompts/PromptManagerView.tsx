import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Copy,
  Download,
  Trash2,
  Edit2,
  Play,
  Layers,
  Search,
  Code,
  Check,
  Tag,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { PromptItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { CodeViewer } from '../../components/ui/CodeViewer';
import { EmptyState } from '../../components/ui/EmptyState';
import { getPlatformAdapters } from '../../core/adapters';
import { useToastStore } from '../../store/useToastStore';

export const PromptManagerView: React.FC = () => {
  const { prompts, addPrompt, updatePrompt, deletePrompt } = useDataStore();
  const { showToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activePromptId, setActivePromptId] = useState<string | null>(prompts[0]?.id || null);

  // Playground variable inputs state
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Engineering');
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('AI, System');

  // Extract variables helper
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g);
    if (!matches) return [];
    const unique = new Set(matches.map((m) => m.replace(/[{}]/g, '').trim()));
    return Array.from(unique);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((p) => set.add(p.category));
    return ['all', ...Array.from(set)];
  }, [prompts]);

  const activePrompt = useMemo(() => {
    return prompts.find((p) => p.id === activePromptId) || prompts[0] || null;
  }, [prompts, activePromptId]);

  // Interpolated prompt with variables replaced
  const interpolatedContent = useMemo(() => {
    if (!activePrompt) return '';
    let result = activePrompt.content || '';
    const vars = activePrompt.variables || [];
    vars.forEach((v) => {
      const val = variableValues[v] || `{{${v}}}`;
      result = result.split(`{{${v}}}`).join(val);
    });
    return result;
  }, [activePrompt, variableValues]);

  const handleOpenAdd = () => {
    setEditingPromptId(null);
    setFormTitle('');
    setFormCategory('Engineering');
    setFormDescription('');
    setFormContent(`You are an expert in {{domain}}.\nHelp me with:\n{{task_description}}`);
    setFormTags('Prompt, Template');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prompt: PromptItem) => {
    setEditingPromptId(prompt.id);
    setFormTitle(prompt.title);
    setFormCategory(prompt.category || 'General');
    setFormDescription(prompt.description || '');
    setFormContent(prompt.content || '');
    setFormTags((prompt.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('error', 'Title and Content are required');
      return;
    }

    const variables = extractVariables(formContent);
    const tags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingPromptId) {
      updatePrompt(editingPromptId, {
        title: formTitle,
        category: formCategory,
        description: formDescription,
        content: formContent,
        tags,
        variables,
      });
      showToast('success', 'Prompt updated');
    } else {
      addPrompt({
        title: formTitle,
        category: formCategory,
        description: formDescription,
        content: formContent,
        tags,
        variables,
      });
      showToast('success', 'Prompt saved');
    }
    setIsModalOpen(false);
  };

  const handleCopy = async (text: string, label: string) => {
    await getPlatformAdapters().clipboard.writeText(text);
    showToast('success', `${label} copied!`);
  };

  const handleExportMarkdown = (prompt: PromptItem) => {
    const md = `# ${prompt.title}\n\n**Category:** ${prompt.category}\n**Tags:** ${prompt.tags.join(', ')}\n**Variables:** ${prompt.variables.join(', ')}\n\n---\n\n${prompt.content}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Downloaded as Markdown');
  };

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Prompt Studio & Variable Playground
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Craft system prompts with dynamic variables <code>{`{{var}}`}</code> and live input testing.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 -ms-0.5 me-1.5" />
          Create Prompt
        </Button>
      </div>

      {/* Main Studio Layout: Left Prompt List + Right Interactive Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Prompts Selector & Filters (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <Input
            placeholder="Search prompts, tags, variables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startIcon={<Search className="h-4 w-4" />}
          />

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Prompts List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map((p) => {
                const isSelected = activePrompt?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePromptId(p.id);
                      setVariableValues({});
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-start ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {p.title}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {p.description}
                        </p>
                      </div>
                      <Badge variant="neutral" size="sm">
                        {p.category}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap">
                        {(p.variables || []).map((v) => (
                          <span
                            key={v}
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          >
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 text-zinc-400 hover:text-zinc-200"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePrompt(p.id)}
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
                icon={<Sparkles className="h-5 w-5" />}
                title="No Prompts"
                description="Create your first structured prompt template."
                actionLabel="Create Prompt"
                onAction={handleOpenAdd}
              />
            )}
          </div>
        </div>

        {/* Right Column: Interactive Prompt Playground (7 cols) */}
        <div className="lg:col-span-7">
          {activePrompt ? (
            <Card className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {activePrompt.title}
                    </h3>
                    <Badge variant="indigo" size="sm">
                      {activePrompt.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {activePrompt.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportMarkdown(activePrompt)}
                    title="Export Markdown file"
                  >
                    <Download className="h-3.5 w-3.5 -ms-0.5 me-1" />
                    .MD
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCopy(interpolatedContent, 'Rendered Prompt')}
                  >
                    <Copy className="h-3.5 w-3.5 -ms-0.5 me-1" />
                    Copy Rendered
                  </Button>
                </div>
              </div>

              {/* Dynamic Variables Form */}
              {(activePrompt.variables || []).length > 0 && (
                <div className="space-y-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Input Variables ({(activePrompt.variables || []).length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setVariableValues({})}
                      className="text-[11px] text-zinc-400 hover:text-zinc-200"
                    >
                      Clear Inputs
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(activePrompt.variables || []).map((varName) => (
                      <Input
                        key={varName}
                        label={`{{${varName}}}`}
                        placeholder={`Value for ${varName}...`}
                        value={variableValues[varName] || ''}
                        onChange={(e) =>
                          setVariableValues((prev) => ({
                            ...prev,
                            [varName]: e.target.value,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rendered Prompt Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-zinc-400 uppercase">
                    Interpolated Output Preview
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {interpolatedContent.length} chars • {interpolatedContent.split(/\s+/).length}{' '}
                    words
                  </span>
                </div>
                <CodeViewer
                  code={interpolatedContent}
                  language="markdown"
                  maxHeight="350px"
                  showLineNumbers
                />
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-zinc-400">
              Select or create a prompt to open playground.
            </Card>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPromptId ? 'Edit Prompt' : 'Create New Prompt'}
        description="Wrap variables in {{variable_name}} to auto-generate testing fields."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Prompt Title"
                placeholder="e.g. Senior Security Auditor"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Category"
                placeholder="Engineering"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                required
              />
            </div>
          </div>

          <Input
            label="Short Description"
            placeholder="What does this prompt do?"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <Textarea
            label="Prompt Template Body (Supports {{variable_name}})"
            rows={8}
            className="font-mono text-xs"
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            required
          />

          <Input
            label="Tags (comma-separated)"
            placeholder="AI, Code, Review"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Prompt</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
