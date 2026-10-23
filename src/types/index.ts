export type Environment = 'dev' | 'staging' | 'prod';
export type KeyStatus = 'active' | 'disabled';
export type McpType = 'stdio' | 'http' | 'sse';
export type Priority = 'low' | 'medium' | 'high';
export type ThemeMode = 'dark' | 'light';
export type SupportedLanguage = 'en' | 'ar' | 'fr';

export interface ApiKeyItem {
  id: string;
  providerId: string;
  providerName: string;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  environment: Environment;
  tags: string[];
  notes: string;
  status: KeyStatus;
  createdAt: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'error' | 'cors_restricted';
}

export interface VaultItem {
  id: string;
  title: string;
  username: string;
  password: string; // Plaintext in runtime memory once unlocked, encrypted in storage
  email?: string;
  url?: string;
  notes?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptItem {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[]; // extracted {{variable}}
  createdAt: string;
  updatedAt: string;
}

export interface McpServerConfig {
  id: string;
  name: string;
  description: string;
  type: McpType;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  envVars?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  enabled?: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  version?: string;
  compatibility?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  description?: string;
  faviconUrl?: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  subtasks: TodoSubtask[];
  tags: string[];
  createdAt: string;
}

export interface SnippetItem {
  id: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  tags: string[];
  isFavorite?: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  targetType: string;
  targetTitle: string;
  timestamp: string;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export interface AppBackupData {
  schemaVersion: string;
  exportedAt: string;
  data: {
    apiKeys: ApiKeyItem[];
    prompts: PromptItem[];
    mcp: McpServerConfig[];
    skills: SkillItem[];
    passwords: VaultItem[];
    bookmarks: BookmarkItem[];
    notes: NoteItem[];
    todos: TodoItem[];
    snippets: SnippetItem[];
  };
}

export type NavigationTab =
  | 'dashboard'
  | 'api-keys'
  | 'vault'
  | 'prompts'
  | 'mcp'
  | 'skills'
  | 'bookmarks'
  | 'notes-todos'
  | 'toolbox'
  | 'snippets'
  | 'settings';

