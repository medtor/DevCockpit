import { z } from 'zod';

export const ApiKeyItemSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  apiKey: z.string(),
  baseUrl: z.string().default(''),
  defaultModel: z.string().default(''),
  environment: z.enum(['dev', 'staging', 'prod']).default('dev'),
  tags: z.array(z.string()).default([]),
  notes: z.string().default(''),
  status: z.enum(['active', 'disabled']).default('active'),
  createdAt: z.string(),
  lastTestedAt: z.string().optional(),
  lastTestStatus: z.enum(['success', 'error', 'cors_restricted']).optional(),
});

export const VaultItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  username: z.string().default(''),
  password: z.string().default(''),
  email: z.string().optional(),
  url: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PromptItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(''),
  content: z.string(),
  category: z.string().default('General'),
  tags: z.array(z.string()).default([]),
  variables: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const McpServerConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  type: z.enum(['stdio', 'http', 'sse']).default('stdio'),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  envVars: z.record(z.string(), z.string()).optional(),
  url: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  createdAt: z.string(),
});


export const SkillItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  category: z.string().default('Development'),
  content: z.string(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BookmarkItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  category: z.string().default('Tools'),
  tags: z.array(z.string()).default([]),
  faviconUrl: z.string().optional(),
  isFavorite: z.boolean().default(false),
  createdAt: z.string(),
});

export const NoteItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TodoSubtaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean().default(false),
});

export const TodoItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
  subtasks: z.array(TodoSubtaskSchema).default([]),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
});

export const SnippetItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(''),
  language: z.string().default('javascript'),
  code: z.string(),
  tags: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
  createdAt: z.string(),
});

export const AppBackupDataSchema = z.object({
  schemaVersion: z.string(),
  exportedAt: z.string(),
  data: z.object({
    apiKeys: z.array(ApiKeyItemSchema).default([]),
    prompts: z.array(PromptItemSchema).default([]),
    mcp: z.array(McpServerConfigSchema).default([]),
    skills: z.array(SkillItemSchema).default([]),
    passwords: z.array(VaultItemSchema).default([]),
    bookmarks: z.array(BookmarkItemSchema).default([]),
    notes: z.array(NoteItemSchema).default([]),
    todos: z.array(TodoItemSchema).default([]),
    snippets: z.array(SnippetItemSchema).default([]),
  }),
});
