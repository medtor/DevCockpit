import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Plus,
  ExternalLink,
  Star,
  Trash2,
  Edit2,
  Search,
  Globe,
  Tag,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { BookmarkItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Switch } from '../../components/ui/Switch';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToastStore } from '../../store/useToastStore';

export const BookmarksView: React.FC = () => {
  const { bookmarks, addBookmark, updateBookmark, deleteBookmark } = useDataStore();
  const { showToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Documentation');
  const [tagsInput, setTagsInput] = useState('Dev, Docs');
  const [isFavorite, setIsFavorite] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => set.add(b.category));
    return ['all', ...Array.from(set)];
  }, [bookmarks]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setUrl('');
    setDescription('');
    setCategory('Documentation');
    setTagsInput('Tech, AI');
    setIsFavorite(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bm: BookmarkItem) => {
    setEditingId(bm.id);
    setTitle(bm.title);
    setUrl(bm.url);
    setDescription(bm.description || '');
    setCategory(bm.category);
    setTagsInput((bm.tags || []).join(', '));
    setIsFavorite(bm.isFavorite);
    setIsModalOpen(true);
  };

  const extractFavicon = (targetUrl: string) => {
    try {
      const parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch {
      return '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      showToast('error', 'Title and URL are required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const faviconUrl = extractFavicon(url);

    if (editingId) {
      updateBookmark(editingId, {
        title,
        url,
        description,
        category,
        tags,
        isFavorite,
        faviconUrl,
      });
      showToast('success', 'Bookmark updated');
    } else {
      addBookmark({
        title,
        url,
        description,
        category,
        tags,
        isFavorite,
        faviconUrl,
      });
      showToast('success', 'Bookmark saved');
    }
    setIsModalOpen(false);
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase())) ||
      (b.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-sky-500" />
            Developer Bookmarks & Documentation
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Fast access to APIs, cheat sheets, SDK documentations, and essential dev portals.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 -ms-0.5 me-1.5" />
          Add Bookmark
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search bookmarks, URLs, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bm) => (
            <Card key={bm.id} className="p-4 flex flex-col justify-between space-y-3 group">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {bm.faviconUrl ? (
                      <img
                        src={bm.faviconUrl}
                        alt=""
                        className="h-5 w-5 rounded-xs object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                    )}
                    <a
                      href={bm.url.startsWith('http') ? bm.url : `https://${bm.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                    >
                      <span className="truncate">{bm.title}</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateBookmark(bm.id, { isFavorite: !bm.isFavorite })}
                      className="p-1 text-zinc-400 hover:text-amber-400"
                      title="Toggle Favorite"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          bm.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(bm)}
                      className="p-1 text-zinc-400 hover:text-zinc-200"
                      title="Edit"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBookmark(bm.id)}
                      className="p-1 text-zinc-400 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {bm.description && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {bm.description}
                  </p>
                )}

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-mono truncate">{bm.url}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <Badge variant="indigo" size="sm">
                  {bm.category}
                </Badge>
                <div className="flex items-center gap-1 flex-wrap">
                  {(bm.tags || []).map((t) => (
                    <span key={t} className="text-[10px] text-zinc-500">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark className="h-6 w-6" />}
          title="No Bookmarks Found"
          description="Save documentation portals, cloud consoles, and tools for instant access."
          actionLabel="Add Bookmark"
          onAction={handleOpenAdd}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Bookmark' : 'Add Bookmark'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Stripe API Reference"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="URL"
            placeholder="https://docs.stripe.com/api"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Category"
              placeholder="Documentation"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
            <Input
              label="Tags (comma-separated)"
              placeholder="API, Payment, SDK"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          <Textarea
            label="Description"
            rows={2}
            placeholder="Brief reference notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Switch
            checked={isFavorite}
            onChange={setIsFavorite}
            label="Pin to Favorites"
            description="Display on top dashboard shortcuts"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Bookmark</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
