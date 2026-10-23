import React, { useState } from 'react';
import {
  FileCode2,
  Plus,
  Copy,
  Download,
  Trash2,
  Edit2,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { SkillItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { CodeViewer } from '../../components/ui/CodeViewer';
import { EmptyState } from '../../components/ui/EmptyState';
import { getPlatformAdapters } from '../../core/adapters';
import { useToastStore } from '../../store/useToastStore';

export const SkillsManagerView: React.FC = () => {
  const { skills, addSkill, updateSkill, deleteSkill } = useDataStore();
  const { showToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [activeSkillId, setActiveSkillId] = useState<string | null>(skills[0]?.id || null);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [compatibilityInput, setCompatibilityInput] = useState('Anthropic, OpenAI, Gemini');
  const [tagsInput, setTagsInput] = useState('Skill, Architecture');

  const activeSkill = skills.find((s) => s.id === activeSkillId) || skills[0] || null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('Database Migration Architect');
    setVersion('1.0.0');
    setDescription('Standard operating guidelines for zero-downtime PostgreSQL migrations.');
    setContent(`---
name: database-migration-architect
description: Guides zero-downtime database migrations with rollback plans.
version: 1.0.0
---

# Database Migration Skill

## Core Principles
1. Always write expandable & contractible migrations (Expand/Contract pattern).
2. Never rename columns in a single migration step.
3. Include explicit down migration scripts.
`);
    setCompatibilityInput('Cursor, Claude, Gemini');
    setTagsInput('PostgreSQL, Drizzle, Prisma');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: SkillItem) => {
    setEditingId(skill.id);
    setName(skill.name);
    setVersion(skill.version || '1.0.0');
    setDescription(skill.description || '');
    setContent(skill.content || '');
    setCompatibilityInput((skill.compatibility || []).join(', '));
    setTagsInput((skill.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      showToast('error', 'Name and Content are required');
      return;
    }

    const compatibility = compatibilityInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      updateSkill(editingId, {
        name,
        version,
        description,
        content,
        compatibility,
        tags,
      });
      showToast('success', 'Skill updated');
    } else {
      addSkill({
        name,
        category: 'Engineering',
        version,
        description,
        content,
        compatibility,
        tags,
      });
      showToast('success', 'Skill created');
    }

    setIsModalOpen(false);
  };

  const handleExportSkillFile = (skill: SkillItem) => {
    const blob = new Blob([skill.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKILL.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Exported SKILL.md');
  };

  const handleCopy = async (text: string, label: string) => {
    await getPlatformAdapters().clipboard.writeText(text);
    showToast('success', `${label} copied to clipboard`);
  };

  const filteredSkills = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      (s.compatibility || []).some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-indigo-500" />
            Skills & System Instructions Manager
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Define system personas, capabilities, and 1-click export as standard <code>SKILL.md</code>.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 -ms-0.5 me-1.5" />
          Create Skill
        </Button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Skills List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <Input
            placeholder="Search skills, models, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startIcon={<Search className="h-4 w-4" />}
          />

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill) => {
                const isSelected = activeSkill?.id === skill.id;
                const compatibilityList = skill.compatibility || [];
                const tagsList = skill.tags || [];
                return (
                  <div
                    key={skill.id}
                    onClick={() => setActiveSkillId(skill.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-start ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                          <span>{skill.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">v{skill.version || '1.0.0'}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {skill.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(skill)}
                          className="p-1 text-zinc-400 hover:text-zinc-200"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSkill(skill.id)}
                          className="p-1 text-zinc-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {(compatibilityList.length > 0 || tagsList.length > 0) && (
                      <div className="mt-2.5 flex items-center gap-1 flex-wrap">
                        {compatibilityList.map((model) => (
                          <Badge key={model} variant="neutral" size="sm">
                            {model}
                          </Badge>
                        ))}
                        {tagsList.map((tag) => (
                          <Badge key={tag} variant="indigo" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon={<FileCode2 className="h-5 w-5" />}
                title="No Skills Defined"
                description="Package AI behavior and agent instructions."
                actionLabel="Create Skill"
                onAction={handleOpenAdd}
              />
            )}
          </div>
        </div>

        {/* Right Column: Skill Viewer & Exporter (7 cols) */}
        <div className="lg:col-span-7">
          {activeSkill ? (
            <Card className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {activeSkill.name}
                    </h3>
                    <Badge variant="indigo" size="sm">
                      v{activeSkill.version || '1.0.0'}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {activeSkill.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportSkillFile(activeSkill)}
                  >
                    <Download className="h-3.5 w-3.5 -ms-0.5 me-1" />
                    Export SKILL.md
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCopy(activeSkill.content, 'SKILL.md Markdown')}
                  >
                    <Copy className="h-3.5 w-3.5 -ms-0.5 me-1" />
                    Copy Content
                  </Button>
                </div>
              </div>

              {/* Compatibility Pill Bar */}
              {activeSkill.compatibility && activeSkill.compatibility.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-400">Target Models:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeSkill.compatibility.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Code / Markdown View */}
              <div>
                <CodeViewer
                  code={activeSkill.content}
                  language="markdown"
                  maxHeight="420px"
                  showLineNumbers
                />
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-zinc-400">
              Select or create a skill to inspect its instructions.
            </Card>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Skill' : 'Create New Skill'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Skill Name"
                placeholder="Database Migration Architect"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Version"
                placeholder="1.0.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
              />
            </div>
          </div>

          <Input
            label="Description"
            placeholder="Guides zero-downtime database migrations"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Textarea
            label="SKILL.md Markdown Content"
            rows={10}
            className="font-mono text-xs"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Compatibility (comma-separated)"
              placeholder="Claude, GPT-4o, Gemini, Cursor"
              value={compatibilityInput}
              onChange={(e) => setCompatibilityInput(e.target.value)}
            />
            <Input
              label="Tags"
              placeholder="Architecture, Database, DevOps"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Skill</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
