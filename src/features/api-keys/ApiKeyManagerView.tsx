import React, { useState } from 'react';
import {
  KeyRound,
  Plus,
  Play,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Terminal,
  ShieldAlert,
  Send,
  Download,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { ApiKeyItem, Environment } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { CodeViewer } from '../../components/ui/CodeViewer';
import { EmptyState } from '../../components/ui/EmptyState';
import { getPlatformAdapters, HttpRequestConfig, HttpResponse } from '../../core/adapters';
import { useToastStore } from '../../store/useToastStore';

const PRESET_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o', testEndpoint: '/models' },
  { id: 'gemini', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', defaultModel: 'gemini-2.5-flash', testEndpoint: '/models' },
  { id: 'anthropic', name: 'Anthropic Claude', baseUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-3-7-sonnet-20250219', testEndpoint: '/models' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'openai/gpt-4o', testEndpoint: '/models' },
  { id: 'groq', name: 'Groq Cloud', baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile', testEndpoint: '/models' },
  { id: 'mistral', name: 'Mistral AI', baseUrl: 'https://api.mistral.ai/v1', defaultModel: 'mistral-large-latest', testEndpoint: '/models' },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat', testEndpoint: '/models' },
  { id: 'xai', name: 'xAI (Grok)', baseUrl: 'https://api.x.ai/v1', defaultModel: 'grok-2-latest', testEndpoint: '/models' },
  { id: 'custom', name: 'Custom REST API', baseUrl: '', defaultModel: '', testEndpoint: '' },
];

export const ApiKeyManagerView: React.FC = () => {
  const { apiKeys, addApiKey, updateApiKey, deleteApiKey } = useDataStore();
  const { showToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [filterEnv, setFilterEnv] = useState<string>('all');
  const [revealedKeyIds, setRevealedKeyIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);

  // Form fields
  const [providerId, setProviderId] = useState('openai');
  const [providerName, setProviderName] = useState('OpenAI');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [defaultModel, setDefaultModel] = useState('gpt-4o');
  const [environment, setEnvironment] = useState<Environment>('dev');
  const [tagsInput, setTagsInput] = useState('AI, LLM');
  const [notes, setNotes] = useState('');

  // Tester State
  const [testerSelectedKey, setTesterSelectedKey] = useState<ApiKeyItem | null>(null);
  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [testMethod, setTestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [testUrl, setTestUrl] = useState('');
  const [testHeaders, setTestHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [testBody, setTestBody] = useState('{\n  "model": "gpt-4o",\n  "messages": [{"role": "user", "content": "Hello!"}]\n}');
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<HttpResponse | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedKeyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenAdd = () => {
    setEditingKeyId(null);
    setProviderId('openai');
    setProviderName('OpenAI');
    setApiKey('');
    setBaseUrl('https://api.openai.com/v1');
    setDefaultModel('gpt-4o');
    setEnvironment('dev');
    setTagsInput('AI, Production');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ApiKeyItem) => {
    setEditingKeyId(item.id);
    setProviderId(item.providerId);
    setProviderName(item.providerName);
    setApiKey(item.apiKey);
    setBaseUrl(item.baseUrl);
    setDefaultModel(item.defaultModel);
    setEnvironment(item.environment);
    setTagsInput(item.tags.join(', '));
    setNotes(item.notes);
    setIsModalOpen(true);
  };

  const handleProviderSelect = (pId: string) => {
    setProviderId(pId);
    const preset = PRESET_PROVIDERS.find((p) => p.id === pId);
    if (preset) {
      setProviderName(preset.name);
      setBaseUrl(preset.baseUrl);
      setDefaultModel(preset.defaultModel);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      showToast('error', 'API Key is required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingKeyId) {
      updateApiKey(editingKeyId, {
        providerId,
        providerName,
        apiKey,
        baseUrl,
        defaultModel,
        environment,
        tags,
        notes,
      });
      showToast('success', 'API key updated');
    } else {
      addApiKey({
        providerId,
        providerName,
        apiKey,
        baseUrl,
        defaultModel,
        environment,
        tags,
        notes,
        status: 'active',
      });
      showToast('success', 'API key added securely');
    }
    setIsModalOpen(false);
  };

  const handleCopy = async (text: string, label: string) => {
    await getPlatformAdapters().clipboard.writeText(text);
    showToast('success', `${label} copied to clipboard`);
  };

  const handleOpenTester = (keyItem: ApiKeyItem) => {
    setTesterSelectedKey(keyItem);
    const preset = PRESET_PROVIDERS.find((p) => p.id === keyItem.providerId);
    const initialUrl = keyItem.baseUrl
      ? `${keyItem.baseUrl}${preset?.testEndpoint || ''}`
      : 'https://httpbin.org/get';

    setTestUrl(initialUrl);
    setTestMethod('GET');

    // Setup default auth header based on provider
    let authHeader = `Bearer ${keyItem.apiKey}`;
    if (keyItem.providerId === 'gemini') {
      authHeader = keyItem.apiKey;
    } else if (keyItem.providerId === 'anthropic') {
      authHeader = keyItem.apiKey;
    }

    const initialHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (keyItem.providerId === 'anthropic') {
      initialHeaders['x-api-key'] = keyItem.apiKey;
      initialHeaders['anthropic-version'] = '2023-06-01';
    } else if (keyItem.providerId === 'gemini') {
      initialHeaders['x-goog-api-key'] = keyItem.apiKey;
    } else {
      initialHeaders['Authorization'] = authHeader;
    }

    setTestHeaders(JSON.stringify(initialHeaders, null, 2));
    setTestResponse(null);
    setIsTesterOpen(true);
  };

  const handleExecuteTest = async () => {
    if (!testUrl) {
      showToast('error', 'URL is required');
      return;
    }

    setIsTesting(true);
    let parsedHeaders: Record<string, string> = {};
    try {
      if (testHeaders.trim()) {
        parsedHeaders = JSON.parse(testHeaders);
      }
    } catch {
      showToast('warning', 'Headers JSON invalid. Sending without custom headers.');
    }

    let parsedBody: any = undefined;
    if (!['GET', 'HEAD'].includes(testMethod) && testBody.trim()) {
      try {
        parsedBody = JSON.parse(testBody);
      } catch {
        parsedBody = testBody;
      }
    }

    const config: HttpRequestConfig = {
      url: testUrl,
      method: testMethod,
      headers: parsedHeaders,
      body: parsedBody,
      timeoutMs: 15000,
    };

    const res = await getPlatformAdapters().http.request(config);
    setTestResponse(res);
    setIsTesting(false);

    if (testerSelectedKey) {
      updateApiKey(testerSelectedKey.id, {
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: res.status >= 200 && res.status < 300 ? 'success' : res.isCorsRestricted ? 'cors_restricted' : 'error',
      });
    }

    if (res.isCorsRestricted) {
      showToast('warning', 'CORS Restricted in Browser Mode', 'You can export the cURL command below.');
    } else if (res.status >= 200 && res.status < 300) {
      showToast('success', `HTTP ${res.status} OK (${res.timeMs}ms)`);
    } else {
      showToast('error', `HTTP ${res.status || 'Failed'}: ${res.statusText}`);
    }
  };

  const filteredKeys = apiKeys.filter((k) => {
    const matchesSearch =
      k.providerName.toLowerCase().includes(search.toLowerCase()) ||
      k.defaultModel.toLowerCase().includes(search.toLowerCase()) ||
      k.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesEnv = filterEnv === 'all' || k.environment === filterEnv;
    return matchesSearch && matchesEnv;
  });

  return (
    <div className="space-y-6 text-start">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-indigo-500" />
            API Key Manager & HTTP Tester
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Securely store provider keys and run live HTTP latency/payload tests.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 -ms-0.5 me-1.5" />
          Add API Key
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search provider, model, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-400">Environment:</span>
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5">
            {['all', 'dev', 'staging', 'prod'].map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setFilterEnv(env)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md uppercase transition-colors ${
                  filterEnv === env
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards List */}
      {filteredKeys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKeys.map((item) => {
            const isRevealed = revealedKeyIds.has(item.id);
            const maskedKey = isRevealed
              ? item.apiKey
              : `${item.apiKey.slice(0, 7)}••••••••••••••••${item.apiKey.slice(-4)}`;

            return (
              <Card key={item.id} className="p-4 flex flex-col justify-between space-y-4">
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {item.providerName}
                      </span>
                      <Badge
                        variant={
                          item.environment === 'prod'
                            ? 'error'
                            : item.environment === 'staging'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {item.environment}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateApiKey(item.id, {
                            status: item.status === 'active' ? 'disabled' : 'active',
                          })
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                          item.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}
                      >
                        {item.status}
                      </button>
                    </div>
                  </div>

                  {/* Key Display */}
                  <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 font-mono text-xs">
                    <span className="truncate text-zinc-800 dark:text-zinc-300 me-2">{maskedKey}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleReveal(item.id)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        title={isRevealed ? 'Hide API Key' : 'Reveal API Key'}
                      >
                        {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.apiKey, item.providerName)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        title="Copy Key"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.defaultModel && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-zinc-400">Model:</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {item.defaultModel}
                        </span>
                      </div>
                    )}
                    {item.baseUrl && (
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-[11px] text-zinc-400">URL:</span>
                        <span className="truncate font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                          {item.baseUrl}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="mt-3 flex items-center gap-1 flex-wrap">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="neutral" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                    {item.lastTestedAt ? (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>
                          Tested{' '}
                          {new Date(item.lastTestedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </>
                    ) : (
                      <span>Not tested yet</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenTester(item)}
                      className="text-xs h-7"
                    >
                      <Play className="h-3 w-3 -ms-0.5 me-1 text-indigo-400" />
                      Test Key
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Edit Key"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteApiKey(item.id)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Delete Key"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<KeyRound className="h-6 w-6" />}
          title="No API Keys Found"
          description="Store your OpenAI, Anthropic, Gemini, or custom REST API credentials with encryption."
          actionLabel="Add First Key"
          onAction={handleOpenAdd}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingKeyId ? 'Edit API Key' : 'Add New API Key'}
        description="Keys are stored in your encrypted local-first database."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Preset Provider</label>
            <Select
              value={providerId}
              onChange={(e) => handleProviderSelect(e.target.value)}
              options={PRESET_PROVIDERS.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Provider Name"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Environment</label>
              <Select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as Environment)}
                options={[
                  { value: 'dev', label: 'Development (dev)' },
                  { value: 'staging', label: 'Staging' },
                  { value: 'prod', label: 'Production (prod)' },
                ]}
              />
            </div>
          </div>

          <Input
            label="API Key Secret"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Base URL"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
            <Input
              label="Default Model"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <Textarea
            label="Notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Quota limits, project context, rotation notes..."
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save API Key</Button>
          </div>
        </form>
      </Modal>

      {/* HTTP API Tester Modal */}
      <Modal
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        title={`API HTTP Tester — ${testerSelectedKey?.providerName || 'Request'}`}
        description="Test endpoint response times, headers, and payloads directly."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* URL & Method Input Bar */}
          <div className="flex gap-2">
            <div className="w-28 shrink-0">
              <Select
                value={testMethod}
                onChange={(e) => setTestMethod(e.target.value as any)}
                options={[
                  { value: 'GET', label: 'GET' },
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                  { value: 'DELETE', label: 'DELETE' },
                ]}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="https://api.openai.com/v1/models"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleExecuteTest} isLoading={isTesting}>
              <Send className="h-3.5 w-3.5 -ms-0.5 me-1.5" />
              Send
            </Button>
          </div>

          {/* Request Headers & Body Tabs */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400">Request Headers (JSON)</label>
            <Textarea
              rows={3}
              value={testHeaders}
              onChange={(e) => setTestHeaders(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          {!['GET', 'HEAD'].includes(testMethod) && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400">Request Body (JSON)</label>
              <Textarea
                rows={4}
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          )}

          {/* Response Section */}
          {testResponse && (
            <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Response:</span>
                  <Badge
                    variant={
                      testResponse.isCorsRestricted
                        ? 'warning'
                        : testResponse.status >= 200 && testResponse.status < 300
                        ? 'success'
                        : 'error'
                    }
                  >
                    {testResponse.isCorsRestricted
                      ? 'CORS Restricted (Browser Mode)'
                      : `HTTP ${testResponse.status} ${testResponse.statusText}`}
                  </Badge>
                  <span className="text-xs text-zinc-400 font-mono">{testResponse.timeMs}ms</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      getPlatformAdapters().http.generateCurl({
                        url: testUrl,
                        method: testMethod,
                        headers: JSON.parse(testHeaders || '{}'),
                        body: ['GET', 'HEAD'].includes(testMethod) ? undefined : testBody,
                      }),
                      'cURL Command'
                    )
                  }
                >
                  <Terminal className="h-3 w-3 -ms-0.5 me-1" />
                  Copy cURL
                </Button>
              </div>

              {testResponse.isCorsRestricted && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <span className="font-semibold">CORS Restriction in Browser Mode:</span>
                    <p className="mt-0.5 text-[11px] text-amber-200/80">
                      Standard web browsers enforce Same-Origin Policy. When ported to <strong>Electron</strong> or <strong>Tauri</strong>, DevDesk's native HTTP adapter bypasses CORS completely. Copy the cURL command above to test in terminal.
                    </p>
                  </div>
                </div>
              )}

              {testResponse.error && !testResponse.isCorsRestricted && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {testResponse.error}
                </div>
              )}

              {testResponse.rawText && (
                <div>
                  <div className="text-[11px] font-medium text-zinc-400 mb-1">Response Body:</div>
                  <CodeViewer
                    code={
                      typeof testResponse.data === 'object'
                        ? JSON.stringify(testResponse.data, null, 2)
                        : testResponse.rawText
                    }
                    language="json"
                    maxHeight="250px"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
