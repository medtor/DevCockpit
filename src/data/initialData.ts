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
} from '../types';

export const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: 'key-1',
    providerId: 'openai',
    providerName: 'OpenAI',
    apiKey: 'sk-proj-demo-992a7f8e3d1b4c5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    environment: 'dev',
    tags: ['AI', 'LLM', 'Production'],
    notes: 'Development API key for OpenAI GPT-4o and o1 models testing.',
    status: 'active',
    createdAt: '2026-08-20T10:00:00Z',
    lastTestedAt: '2026-08-28T14:20:00Z',
    lastTestStatus: 'success',
  },
  {
    id: 'key-2',
    providerId: 'gemini',
    providerName: 'Google Gemini',
    apiKey: 'AIzaSyDemo-GeminiKey_8x99_q2w3e4r5t6y7u8i9o0p',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.5-flash',
    environment: 'dev',
    tags: ['Google', 'Multimodal', 'Fast'],
    notes: 'Google AI Studio key for rapid multimodal prototyping.',
    status: 'active',
    createdAt: '2026-08-22T09:15:00Z',
    lastTestedAt: '2026-08-29T11:00:00Z',
    lastTestStatus: 'success',
  },
  {
    id: 'key-3',
    providerId: 'anthropic',
    providerName: 'Anthropic Claude',
    apiKey: 'sk-ant-api03-demo-claude-3-7-sonnet-example-secret',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-7-sonnet-20250219',
    environment: 'staging',
    tags: ['Reasoning', 'Code'],
    notes: 'Key for high-precision code generation and reasoning pipelines.',
    status: 'active',
    createdAt: '2026-08-24T16:45:00Z',
  },
  {
    id: 'key-4',
    providerId: 'groq',
    providerName: 'Groq Cloud',
    apiKey: 'gsk_demo_UltraFastLpuHardwareKey9928374',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    environment: 'dev',
    tags: ['Ultra-Fast', 'OpenSource'],
    notes: 'Ultra-low latency inference engine for real-time applications.',
    status: 'active',
    createdAt: '2026-08-25T11:30:00Z',
  },
  {
    id: 'key-5',
    providerId: 'mistral',
    providerName: 'Mistral AI',
    apiKey: 'mis_demo_MistralLargeEuropeanSecretKey123',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    environment: 'prod',
    tags: ['European', 'Codestral'],
    notes: 'Codestral and Mistral Large endpoints.',
    status: 'active',
    createdAt: '2026-08-26T08:00:00Z',
  },
];

export const INITIAL_PROMPTS: PromptItem[] = [
  {
    id: 'prompt-1',
    title: 'Senior TypeScript Code Reviewer',
    description: 'Performs a comprehensive architecture, type-safety, and performance review.',
    category: 'Engineering',
    tags: ['TypeScript', 'CodeReview', 'BestPractices'],
    variables: ['code', 'context', 'focus_area'],
    content: `You are a Principal Software Architect and TypeScript Specialist.
Analyze the following code with high attention to:
1. Type safety, strictness, and avoiding \`any\`.
2. Memory leaks, performance bottlenecks, and time complexity.
3. Clean architecture, separation of concerns, and error handling.

Target context: {{context}}
Specific focus: {{focus_area}}

\`\`\`typescript
{{code}}
\`\`\`

Provide actionable feedback with before/after refactoring diffs.`,
    createdAt: '2026-08-21T12:00:00Z',
    updatedAt: '2026-08-25T15:30:00Z',
  },
  {
    id: 'prompt-2',
    title: 'System Architecture Generator',
    description: 'Generates detailed C4 model architecture specifications and data contracts.',
    category: 'Architecture',
    tags: ['SystemDesign', 'Cloud', 'Microservices'],
    variables: ['system_name', 'requirements', 'cloud_provider'],
    content: `Act as a Cloud Enterprise Architect.
Design a resilient, fault-tolerant system architecture for: {{system_name}}
Cloud target: {{cloud_provider}}
Business & Technical requirements:
{{requirements}}

Structure your output into:
1. High-level Context & Container Diagrams (ASCII or Mermaid.js).
2. Data Flow & Event Bus Architecture.
3. Security, Encryption & RBAC Strategy.
4. Estimated Cloud Infrastructure Footprint & Cost Optimization.`,
    createdAt: '2026-08-23T14:10:00Z',
    updatedAt: '2026-08-23T14:10:00Z',
  },
  {
    id: 'prompt-3',
    title: 'Regex & Parsing Specialist',
    description: 'Constructs bulletproof regex with comprehensive unit test vectors.',
    category: 'Tools',
    tags: ['Regex', 'Parsing', 'Validation'],
    variables: ['pattern_description', 'edge_cases'],
    content: `You are a Regular Expression and Formal Grammars expert.
Create an optimal Regular Expression matching:
Description: {{pattern_description}}
Edge cases to handle: {{edge_cases}}

Include:
1. The exact Regex pattern with flags (e.g. /pattern/gmu).
2. Step-by-step breakdown of each token and capture group.
3. A list of 5 valid test inputs and 5 invalid edge-case test inputs.`,
    createdAt: '2026-08-24T18:00:00Z',
    updatedAt: '2026-08-24T18:00:00Z',
  },
];

export const INITIAL_MCP_SERVERS: McpServerConfig[] = [
  {
    id: 'mcp-1',
    name: 'filesystem-server',
    description: 'Local filesystem access for Claude Desktop and Cursor',
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/developer/Projects'],
    envVars: {
      NODE_ENV: 'production',
    },
    status: 'active',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'mcp-2',
    name: 'sqlite-db-manager',
    description: 'Direct SQL query and schema inspection for local SQLite databases',
    type: 'stdio',
    command: 'uvx',
    args: ['mcp-server-sqlite', '--db-path', './database.sqlite'],
    envVars: {
      SQLITE_READONLY: 'false',
    },
    status: 'active',
    createdAt: '2026-08-22T11:00:00Z',
  },
  {
    id: 'mcp-3',
    name: 'github-enterprise-connector',
    description: 'GitHub pull requests, issues, and repo management via MCP',
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    envVars: {
      GITHUB_PERSONAL_ACCESS_TOKEN: 'ghp_demo_secret_token_123456789',
    },
    status: 'active',
    createdAt: '2026-08-24T09:30:00Z',
  },
  {
    id: 'mcp-4',
    name: 'remote-memory-sse',
    description: 'Long-term vector memory server connected via Server-Sent Events',
    type: 'sse',
    url: 'https://mcp.internal.devdesk.local/sse',
    headers: {
      Authorization: 'Bearer mem_live_token_7788',
    },
    status: 'active',
    createdAt: '2026-08-26T15:00:00Z',
  },
];

export const INITIAL_SKILLS: SkillItem[] = [
  {
    id: 'skill-1',
    name: 'Clean Code & SOLID Specialist',
    category: 'Engineering',
    version: '1.0.0',
    description: 'Enforces SOLID principles, DRY, clean functional code, and immutability.',
    compatibility: ['Claude 3.7', 'GPT-4o', 'Gemini 2.5', 'Cursor'],
    tags: ['Architecture', 'BestPractices', 'Refactoring'],
    content: `# Clean Code & SOLID Specialist Skill

## Capabilities & Directives
1. **Single Responsibility**: Ensure every function and class has exactly one reason to change.
2. **Open/Closed Principle**: Favor composition and strategy pattern over giant switch/if blocks.
3. **Liskov Substitution**: Ensure subtypes preserve all parent behavior guarantees.
4. **Interface Segregation**: Create focused, granular interfaces instead of monoliths.
5. **Dependency Inversion**: High-level modules should depend on abstractions (interfaces), never concrete platform APIs.

## Implementation Guidelines
- Prefer pure functions without hidden side-effects.
- Keep cyclomatic complexity under 8 per method.
- Return early (Guard Clauses) to reduce indentation depth.`,
    createdAt: '2026-08-21T10:00:00Z',
    updatedAt: '2026-08-21T10:00:00Z',
  },
  {
    id: 'skill-2',
    name: 'Security & OWASP Top 10 Auditor',
    category: 'Security',
    version: '1.2.0',
    description: 'Audits web apps against XSS, CSRF, Injection, and Insecure Storage.',
    compatibility: ['Claude 3.7', 'GPT-4o', 'DeepSeek-R1', 'Ollama'],
    tags: ['Security', 'OWASP', 'Crypto'],
    content: `# Security & OWASP Auditor Skill

## Security Directives
- **Zero Trust Storage**: Never store plaintext passwords or unencrypted tokens in browser storage.
- **Input Sanitization**: Validate all inputs using schema parsers like Zod.
- **Cryptography Standards**: Always use Web Crypto API (AES-GCM 256-bit with PBKDF2 100,000 iterations minimum).
- **CORS & Headers**: Enforce CSP (Content Security Policy) and strict SameSite cookies.`,
    createdAt: '2026-08-23T16:00:00Z',
    updatedAt: '2026-08-23T16:00:00Z',
  },
];

export const INITIAL_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'bm-1',
    title: 'Tailwind CSS Documentation',
    url: 'https://tailwindcss.com/docs',
    category: 'Documentation',
    tags: ['CSS', 'Frontend', 'Styling'],
    faviconUrl: 'https://tailwindcss.com/favicons/favicon.ico',
    isFavorite: true,
    createdAt: '2026-08-20T08:00:00Z',
  },
  {
    id: 'bm-2',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    category: 'Documentation',
    tags: ['Web', 'JavaScript', 'HTML', 'CSS'],
    faviconUrl: 'https://developer.mozilla.org/favicon-48x48.png',
    isFavorite: true,
    createdAt: '2026-08-20T08:05:00Z',
  },
  {
    id: 'bm-3',
    title: 'TypeScript Official Handbook',
    url: 'https://www.typescriptlang.org/docs/',
    category: 'Documentation',
    tags: ['TypeScript', 'Language'],
    faviconUrl: 'https://www.typescriptlang.org/favicon-32x32.png',
    isFavorite: false,
    createdAt: '2026-08-21T09:00:00Z',
  },
  {
    id: 'bm-4',
    title: 'Model Context Protocol (MCP)',
    url: 'https://modelcontextprotocol.io',
    category: 'AI',
    tags: ['MCP', 'Anthropic', 'Protocol'],
    faviconUrl: 'https://modelcontextprotocol.io/favicon.ico',
    isFavorite: true,
    createdAt: '2026-08-22T14:00:00Z',
  },
  {
    id: 'bm-5',
    title: 'Hugging Face Model Hub',
    url: 'https://huggingface.co/models',
    category: 'AI',
    tags: ['AI', 'OpenSource', 'Transformers'],
    faviconUrl: 'https://huggingface.co/favicon.ico',
    isFavorite: false,
    createdAt: '2026-08-23T11:00:00Z',
  },
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'DevDesk Desktop Architecture Blueprint',
    content: `# DevDesk Desktop Architecture
This application is built with clean decoupled layers:
- **UI Components**: Pure presentation layer using Tailwind Logical Properties.
- **Application Hooks & Stores**: Zustand with synchronous and async storage sync.
- **Domain Services**: Encapsulated repositories with zero direct DOM access.
- **Platform Adapters**: \`IStorageAdapter\`, \`IHttpAdapter\`, \`IClipboardAdapter\`, \`ICryptoAdapter\`.

Ready for 1-click injection in **Electron** or **Tauri**!`,
    tags: ['Architecture', 'Tauri', 'Electron'],
    isPinned: true,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-28T19:00:00Z',
  },
  {
    id: 'note-2',
    title: 'Web Crypto AES-GCM Implementation Notes',
    content: `## AES-GCM Security Checklist
- Key derivation: PBKDF2 with SHA-256 and 100,000 iterations.
- Salt: 16 cryptographically random bytes generated via \`crypto.getRandomValues\`.
- IV (Initialization Vector): 12 cryptographically random bytes for AES-GCM.
- Tag length: 128-bit authentication tag automatically appended.`,
    tags: ['Security', 'Cryptography'],
    isPinned: false,
    createdAt: '2026-08-24T14:30:00Z',
    updatedAt: '2026-08-24T14:30:00Z',
  },
];

export const INITIAL_TODOS: TodoItem[] = [
  {
    id: 'todo-1',
    title: 'Audit API Keys & Rotate Staging Secrets',
    completed: false,
    priority: 'high',
    dueDate: '2026-09-05',
    subtasks: [
      { id: 'st-1', title: 'Check expired Anthropic key', completed: true },
      { id: 'st-2', title: 'Verify Gemini 2.5 Flash quota', completed: false },
      { id: 'st-3', title: 'Export backup to encrypted storage', completed: false },
    ],
    tags: ['Security', 'Maintenance'],
    createdAt: '2026-08-27T08:00:00Z',
  },
  {
    id: 'todo-2',
    title: 'Build Claude Desktop MCP JSON config',
    completed: true,
    priority: 'medium',
    dueDate: '2026-08-30',
    subtasks: [
      { id: 'st-4', title: 'Export stdio filesystem server', completed: true },
      { id: 'st-5', title: 'Test SQLite MCP connection', completed: true },
    ],
    tags: ['MCP', 'AI'],
    createdAt: '2026-08-26T10:00:00Z',
  },
  {
    id: 'todo-3',
    title: 'Set up Arabic RTL tests & typography check',
    completed: false,
    priority: 'medium',
    subtasks: [
      { id: 'st-6', title: 'Verify logical padding ms/me', completed: true },
      { id: 'st-7', title: 'Check Command Palette alignment in RTL', completed: false },
    ],
    tags: ['i18n', 'UI'],
    createdAt: '2026-08-28T16:00:00Z',
  },
];

export const INITIAL_SNIPPETS: SnippetItem[] = [
  {
    id: 'snip-1',
    title: 'TypeScript Typed Storage Hook',
    description: 'Safe typed browser storage wrapper with runtime parsing and validation.',
    language: 'typescript',
    tags: ['TypeScript', 'React', 'Hooks'],
    isFavorite: true,
    code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn('Storage write error', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`,
    createdAt: '2026-08-22T10:00:00Z',
  },
  {
    id: 'snip-2',
    title: 'Python Async HTTP Client with Retries',
    description: 'Robust asynchronous HTTP request with exponential backoff.',
    language: 'python',
    tags: ['Python', 'AsyncIO', 'HTTP'],
    isFavorite: true,
    code: `import asyncio
import aiohttp

async def fetch_with_retry(url: str, max_retries: int = 3) -> dict:
    async with aiohttp.ClientSession() as session:
        for attempt in range(max_retries):
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    resp.raise_for_status()
                    return await resp.json()
            except (aiohttp.ClientError, asyncio.TimeoutError) as err:
                if attempt == max_retries - 1:
                    raise err
                await asyncio.sleep(2 ** attempt)`,
    createdAt: '2026-08-24T14:00:00Z',
  },
  {
    id: 'snip-3',
    title: 'SQL Recursive CTE for Nested Tree Navigation',
    description: 'Hierarchical query to retrieve child nodes with depth and path.',
    language: 'sql',
    tags: ['SQL', 'PostgreSQL', 'Database'],
    isFavorite: false,
    code: `WITH RECURSIVE CategoryTree AS (
  -- Anchor member: root categories
  SELECT id, name, parent_id, 0 AS depth, CAST(name AS VARCHAR(255)) AS path
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive member: child categories
  SELECT c.id, c.name, c.parent_id, ct.depth + 1, CAST(ct.path || ' > ' || c.name AS VARCHAR(255))
  FROM categories c
  INNER JOIN CategoryTree ct ON c.parent_id = ct.id
)
SELECT * FROM CategoryTree ORDER BY path;`,
    createdAt: '2026-08-25T16:00:00Z',
  },
  {
    id: 'snip-4',
    title: 'Rust Safe Thread-Safe Singleton / State',
    description: 'Lazy static initialization with thread-safe Arc<RwLock>.',
    language: 'rust',
    tags: ['Rust', 'Concurrency'],
    isFavorite: false,
    code: `use std::sync::{Arc, RwLock};
use std::sync::OnceLock;

#[derive(Debug, Default)]
pub struct AppState {
    pub active_connections: usize,
}

pub fn get_global_state() -> &'static Arc<RwLock<AppState>> {
    static STATE: OnceLock<Arc<RwLock<AppState>>> = OnceLock::new();
    STATE.get_or_init(|| Arc::new(RwLock::new(AppState::default())))
}`,
    createdAt: '2026-08-26T11:00:00Z',
  },
];

export const INITIAL_VAULT_ITEMS: VaultItem[] = [
  {
    id: 'vault-1',
    title: 'GitHub Work Account',
    username: 'developer-lead',
    password: 'DemoPass#2026!k9L8m7N6p5',
    email: 'lead.dev@company.internal',
    url: 'https://github.com',
    notes: '2FA recovery codes stored in physical safe.',
    tags: ['Work', 'Git', 'Primary'],
    isFavorite: true,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-25T12:00:00Z',
  },
  {
    id: 'vault-2',
    title: 'AWS Production IAM Console',
    username: 'cloud-admin-sec',
    password: 'Aws!Prod#9981$ZxCvBnmQwe',
    email: 'security-admin@corp.aws',
    url: 'https://aws.amazon.com/console',
    notes: 'MFA hardware key required.',
    tags: ['Cloud', 'AWS', 'Critical'],
    isFavorite: true,
    createdAt: '2026-08-22T08:00:00Z',
    updatedAt: '2026-08-22T08:00:00Z',
  },
  {
    id: 'vault-3',
    title: 'Cloudflare Zero Trust Portal',
    username: 'netops_user',
    password: 'Cf$ZeroTrust!8829910aA',
    email: 'netops@internal.lan',
    url: 'https://dash.cloudflare.com',
    notes: 'DNS & Tunnel Management.',
    tags: ['Networking', 'DNS'],
    isFavorite: false,
    createdAt: '2026-08-23T15:00:00Z',
    updatedAt: '2026-08-23T15:00:00Z',
  },
];

export const initialDemoData = {
  apiKeys: INITIAL_API_KEYS,
  prompts: INITIAL_PROMPTS,
  mcp: INITIAL_MCP_SERVERS,
  skills: INITIAL_SKILLS,
  bookmarks: INITIAL_BOOKMARKS,
  notes: INITIAL_NOTES,
  todos: INITIAL_TODOS,
  snippets: INITIAL_SNIPPETS,
  passwords: INITIAL_VAULT_ITEMS,
};

