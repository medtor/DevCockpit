import { create } from 'zustand';
import {
  ApiKeyItem,
  PromptItem,
  McpServerConfig,
  SkillItem,
  BookmarkItem,
  NoteItem,
  TodoItem,
  SnippetItem,
  VaultItem,
  AppBackupData,
} from '../types';
import {
  INITIAL_API_KEYS,
  INITIAL_PROMPTS,
  INITIAL_MCP_SERVERS,
  INITIAL_SKILLS,
  INITIAL_BOOKMARKS,
  INITIAL_NOTES,
  INITIAL_TODOS,
  INITIAL_SNIPPETS,
  INITIAL_VAULT_ITEMS,
} from '../data/initialData';
import { getPlatformAdapters } from '../core/adapters';
import { AppBackupDataSchema } from '../core/schema/backup.schema';
import { useAppStore } from './useAppStore';

interface DataStoreState {
  isInitialized: boolean;
  apiKeys: ApiKeyItem[];
  prompts: PromptItem[];
  mcp: McpServerConfig[];
  skills: SkillItem[];
  bookmarks: BookmarkItem[];
  notes: NoteItem[];
  todos: TodoItem[];
  snippets: SnippetItem[];
  vaultItems: VaultItem[];

  // Init & Persistence
  initStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;

  // API Keys Actions
  addApiKey: (item: Omit<ApiKeyItem, 'id' | 'createdAt'>) => void;
  updateApiKey: (id: string, item: Partial<ApiKeyItem>) => void;
  deleteApiKey: (id: string) => void;

  // Prompts Actions
  addPrompt: (item: Omit<PromptItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrompt: (id: string, item: Partial<PromptItem>) => void;
  deletePrompt: (id: string) => void;

  // MCP Actions
  addMcpServer: (item: Omit<McpServerConfig, 'id' | 'createdAt'>) => void;
  updateMcpServer: (id: string, item: Partial<McpServerConfig>) => void;
  deleteMcpServer: (id: string) => void;

  // Skills Actions
  addSkill: (item: Omit<SkillItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSkill: (id: string, item: Partial<SkillItem>) => void;
  deleteSkill: (id: string) => void;

  // Bookmarks Actions
  addBookmark: (item: Omit<BookmarkItem, 'id' | 'createdAt'>) => void;
  updateBookmark: (id: string, item: Partial<BookmarkItem>) => void;
  deleteBookmark: (id: string) => void;

  // Notes Actions
  addNote: (item: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, item: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;

  // Todos Actions
  addTodo: (item: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  updateTodo: (id: string, item: Partial<TodoItem>) => void;
  toggleTodoCompleted: (id: string) => void;
  toggleSubtask: (todoId: string, subtaskId: string) => void;
  deleteTodo: (id: string) => void;

  // Snippets Actions
  addSnippet: (item: Omit<SnippetItem, 'id' | 'createdAt'>) => void;
  updateSnippet: (id: string, item: Partial<SnippetItem>) => void;
  deleteSnippet: (id: string) => void;

  // Vault Actions
  addVaultItem: (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateVaultItem: (id: string, item: Partial<VaultItem>) => void;
  deleteVaultItem: (id: string) => void;

  // Backup & Restore
  exportBackupData: () => AppBackupData;
  importBackupData: (jsonData: any, overwrite?: boolean) => { success: boolean; error?: string };
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

export const useDataStore = create<DataStoreState>((set, get) => ({
  isInitialized: false,
  apiKeys: INITIAL_API_KEYS,
  prompts: INITIAL_PROMPTS,
  mcp: INITIAL_MCP_SERVERS,
  skills: INITIAL_SKILLS,
  bookmarks: INITIAL_BOOKMARKS,
  notes: INITIAL_NOTES,
  todos: INITIAL_TODOS,
  snippets: INITIAL_SNIPPETS,
  vaultItems: INITIAL_VAULT_ITEMS,

  initStorage: async () => {
    try {
      const storage = getPlatformAdapters().storage;
      const stored = await storage.get<AppBackupData>('main_data');
      if (stored && stored.data) {
        set({
          apiKeys: stored.data.apiKeys || INITIAL_API_KEYS,
          prompts: stored.data.prompts || INITIAL_PROMPTS,
          mcp: stored.data.mcp || INITIAL_MCP_SERVERS,
          skills: stored.data.skills || INITIAL_SKILLS,
          bookmarks: stored.data.bookmarks || INITIAL_BOOKMARKS,
          notes: stored.data.notes || INITIAL_NOTES,
          todos: stored.data.todos || INITIAL_TODOS,
          snippets: stored.data.snippets || INITIAL_SNIPPETS,
          vaultItems: stored.data.passwords || INITIAL_VAULT_ITEMS,
          isInitialized: true,
        });
      } else {
        // Save initial demo data
        await get().saveToStorage();
        set({ isInitialized: true });
      }
    } catch {
      set({ isInitialized: true });
    }
  },

  saveToStorage: async () => {
    try {
      const storage = getPlatformAdapters().storage;
      const backup = get().exportBackupData();
      await storage.set('main_data', backup);
    } catch (err) {
      console.warn('Storage save failed:', err);
    }
  },

  // API Keys
  addApiKey: (item) => {
    const newItem: ApiKeyItem = {
      ...item,
      id: `key-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ apiKeys: [newItem, ...state.apiKeys] }));
    get().saveToStorage();
    useAppStore.getState().logActivity('Added', 'API Key', newItem.providerName);
  },
  updateApiKey: (id, item) => {
    set((state) => ({
      apiKeys: state.apiKeys.map((k) => (k.id === id ? { ...k, ...item } : k)),
    }));
    get().saveToStorage();
  },
  deleteApiKey: (id) => {
    const item = get().apiKeys.find((k) => k.id === id);
    set((state) => ({ apiKeys: state.apiKeys.filter((k) => k.id !== id) }));
    get().saveToStorage();
    if (item) {
      useAppStore.getState().logActivity('Deleted', 'API Key', item.providerName);
    }
  },

  // Prompts
  addPrompt: (item) => {
    const now = new Date().toISOString();
    const newItem: PromptItem = {
      ...item,
      id: `prompt-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ prompts: [newItem, ...state.prompts] }));
    get().saveToStorage();
    useAppStore.getState().logActivity('Created', 'Prompt', newItem.title);
  },
  updatePrompt: (id, item) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, ...item, updatedAt: new Date().toISOString() } : p
      ),
    }));
    get().saveToStorage();
  },
  deletePrompt: (id) => {
    const item = get().prompts.find((p) => p.id === id);
    set((state) => ({ prompts: state.prompts.filter((p) => p.id !== id) }));
    get().saveToStorage();
    if (item) {
      useAppStore.getState().logActivity('Deleted', 'Prompt', item.title);
    }
  },

  // MCP Servers
  addMcpServer: (item) => {
    const newItem: McpServerConfig = {
      ...item,
      id: `mcp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ mcp: [newItem, ...state.mcp] }));
    get().saveToStorage();
    useAppStore.getState().logActivity('Configured', 'MCP Server', newItem.name);
  },
  updateMcpServer: (id, item) => {
    set((state) => ({
      mcp: state.mcp.map((m) => (m.id === id ? { ...m, ...item } : m)),
    }));
    get().saveToStorage();
  },
  deleteMcpServer: (id) => {
    const item = get().mcp.find((m) => m.id === id);
    set((state) => ({ mcp: state.mcp.filter((m) => m.id !== id) }));
    get().saveToStorage();
    if (item) {
      useAppStore.getState().logActivity('Deleted', 'MCP Server', item.name);
    }
  },

  // Skills
  addSkill: (item) => {
    const now = new Date().toISOString();
    const newItem: SkillItem = {
      ...item,
      id: `skill-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ skills: [newItem, ...state.skills] }));
    get().saveToStorage();
    useAppStore.getState().logActivity('Created', 'Skill', newItem.name);
  },
  updateSkill: (id, item) => {
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === id ? { ...s, ...item, updatedAt: new Date().toISOString() } : s
      ),
    }));
    get().saveToStorage();
  },
  deleteSkill: (id) => {
    const item = get().skills.find((s) => s.id === id);
    set((state) => ({ skills: state.skills.filter((s) => s.id !== id) }));
    get().saveToStorage();
    if (item) {
      useAppStore.getState().logActivity('Deleted', 'Skill', item.name);
    }
  },

  // Bookmarks
  addBookmark: (item) => {
    const newItem: BookmarkItem = {
      ...item,
      id: `bm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ bookmarks: [newItem, ...state.bookmarks] }));
    get().saveToStorage();
    useAppStore.getState().logActivity('Saved', 'Bookmark', newItem.title);
  },
  updateBookmark: (id, item) => {
    set((state) => ({
      bookmarks: state.bookmarks.map((b) => (b.id === id ? { ...b, ...item } : b)),
    }));
    get().saveToStorage();
  },
  deleteBookmark: (id) => {
    const item = get().bookmarks.find((b) => b.id === id);
    set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) }));
    get().saveToStorage();
    if (item) {
      useAppStore.getState().logActivity('Deleted', 'Bookmark', item.title);
    }
  },

  // Notes
  addNote: (item) => {
    const now = new Date().toISOString();
    const newItem: NoteItem = {
      ...item,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ notes: [newItem, ...state.notes] }));
    get().saveToStorage();
    useAppStore.getState().logActivity('Created', 'Note', newItem.title);
  },
  updateNote: (id, item) => {
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...item, updatedAt: new Date().toISOString() } : n
      ),
    }));
    get().saveToStorage();
  },
  deleteNote: (id) => {
    const item = get().notes.find((n) => n.id === id);
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    get().saveToStorage();
    if (item) {
      useAppStore.getState().logActivity('Deleted', 'Note', item.title);
    }
  },

  // Todos
  addTodo: (item) => {
    const newItem: TodoItem = {
      ...item,
      id: `todo-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ todos: [newItem, ...state.todos] }));
    get().saveToStorage();
    useAppStore.getState().logActivity('Created', 'Task', newItem.title);
  },
  updateTodo: (id, item) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...item } : t)),
    }));
    get().saveToStorage();
  },
  toggleTodoCompleted: (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;
    const nextCompleted = !todo.completed;
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, completed: nextCompleted } : t
      ),
    }));
    get().saveToStorage();
    useAppStore
      .getState()
      .logActivity(nextCompleted ? 'Completed' : 'Reopened', 'Task', todo.title);
  },
  toggleSubtask: (todoId, subtaskId) => {
    set((state) => ({
      todos: state.todos.map((t) => {
        if (t.id !== todoId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      }),
    }));
    get().saveToStorage();
  },
  deleteTodo: (id) => {
    const item = get().todos.find((t) => t.id === id);
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
    get().saveToStorage();
    if (item) {
      useAppStore.getState().logActivity('Deleted', 'Task', item.title);
    }
  },

  // Snippets
  addSnippet: (item) => {
    const newItem: SnippetItem = {
      ...item,
      id: `snip-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ snippets: [newItem, ...state.snippets] }));
    get().saveToStorage();
    useAppStore.getState().logActivity('Saved', 'Snippet', newItem.title);
  },
  updateSnippet: (id, item) => {
    set((state) => ({
      snippets: state.snippets.map((s) => (s.id === id ? { ...s, ...item } : s)),
    }));
    get().saveToStorage();
  },
  deleteSnippet: (id) => {
    const item = get().snippets.find((s) => s.id === id);
    set((state) => ({ snippets: state.snippets.filter((s) => s.id !== id) }));
    get().saveToStorage();
    if (item) {
      useAppStore.getState().logActivity('Deleted', 'Snippet', item.title);
    }
  },

  // Vault Items
  addVaultItem: (item) => {
    const now = new Date().toISOString();
    const newItem: VaultItem = {
      ...item,
      id: `vault-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ vaultItems: [newItem, ...state.vaultItems] }));
    get().saveToStorage();
    useAppStore.getState().logActivity('Stored', 'Vault Secret', newItem.title);
  },
  updateVaultItem: (id, item) => {
    set((state) => ({
      vaultItems: state.vaultItems.map((v) =>
        v.id === id ? { ...v, ...item, updatedAt: new Date().toISOString() } : v
      ),
    }));
    get().saveToStorage();
  },
  deleteVaultItem: (id) => {
    const item = get().vaultItems.find((v) => v.id === id);
    set((state) => ({ vaultItems: state.vaultItems.filter((v) => v.id !== id) }));
    get().saveToStorage();
    if (item) {
      useAppStore.getState().logActivity('Deleted', 'Vault Secret', item.title);
    }
  },

  // Export & Import
  exportBackupData: () => {
    const state = get();
    return {
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        apiKeys: state.apiKeys,
        prompts: state.prompts,
        mcp: state.mcp,
        skills: state.skills,
        passwords: state.vaultItems,
        bookmarks: state.bookmarks,
        notes: state.notes,
        todos: state.todos,
        snippets: state.snippets,
      },
    };
  },

  importBackupData: (jsonData, overwrite = false) => {
    try {
      const parsed = AppBackupDataSchema.safeParse(jsonData);
      if (!parsed.success) {
        return {
          success: false,
          error: `Schema validation failed: ${parsed.error.issues
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', ')}`,
        };
      }

      const imported = parsed.data.data as any;
      const current = get();

      if (overwrite) {
        set({
          apiKeys: imported.apiKeys,
          prompts: imported.prompts,
          mcp: imported.mcp,
          skills: imported.skills,
          vaultItems: imported.passwords,
          bookmarks: imported.bookmarks,
          notes: imported.notes,
          todos: imported.todos,
          snippets: imported.snippets,
        });
      } else {
        // Merge without duplicates by id
        const mergeById = <T extends { id: string }>(currentList: T[], newList: T[]) => {
          const map = new Map<string, T>();
          currentList.forEach((item) => map.set(item.id, item));
          newList.forEach((item) => map.set(item.id, item));
          return Array.from(map.values());
        };

        set({
          apiKeys: mergeById(current.apiKeys, imported.apiKeys),
          prompts: mergeById(current.prompts, imported.prompts),
          mcp: mergeById(current.mcp, imported.mcp),
          skills: mergeById(current.skills, imported.skills),
          vaultItems: mergeById(current.vaultItems, imported.passwords),
          bookmarks: mergeById(current.bookmarks, imported.bookmarks),
          notes: mergeById(current.notes, imported.notes),
          todos: mergeById(current.todos, imported.todos),
          snippets: mergeById(current.snippets, imported.snippets),
        });
      }

      get().saveToStorage();

      useAppStore
        .getState()
        .logActivity('Imported', 'Backup Data', `${parsed.data.schemaVersion} Backup`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid JSON format' };
    }
  },

  resetToDemoData: async () => {
    set({
      apiKeys: INITIAL_API_KEYS,
      prompts: INITIAL_PROMPTS,
      mcp: INITIAL_MCP_SERVERS,
      skills: INITIAL_SKILLS,
      bookmarks: INITIAL_BOOKMARKS,
      notes: INITIAL_NOTES,
      todos: INITIAL_TODOS,
      snippets: INITIAL_SNIPPETS,
      vaultItems: INITIAL_VAULT_ITEMS,
    });
    await get().saveToStorage();
    useAppStore.getState().logActivity('Reset', 'System', 'Demo Data Restored');
  },

  clearAllData: async () => {
    set({
      apiKeys: [],
      prompts: [],
      mcp: [],
      skills: [],
      bookmarks: [],
      notes: [],
      todos: [],
      snippets: [],
      vaultItems: [],
    });
    await get().saveToStorage();
    useAppStore.getState().logActivity('Cleared', 'System', 'All Datasets Emptied');
  },
}));
