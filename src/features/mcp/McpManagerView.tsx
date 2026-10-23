import React, { useState } from 'react';
import {
  Terminal,
  Plus,
  Copy,
  Download,
  Trash2,
  Edit2,
  FileCode,
  CheckCircle2,
  Server,
  Layers,
  Settings,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { McpServerConfig, McpType } from '../../types';
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

export const McpManagerView: React.FC = () => {
  const { mcp, addMcpServer, updateMcpServer, deleteMcpServer } = useDataStore();
  const { showToast } = useToastStore();

  const [activeFormat, setActiveFormat] = useState<'claude' | 'cursor'>('claude');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState<McpType>('stdio');
  const [command, setCommand] = useState('npx');
  const [argsInput, setArgsInput] = useState('-y @modelcontextprotocol/server-postgres');
  const [url, setUrl] = useState('');
  const [envJson, setEnvJson] = useState('{\n  "DATABASE_URL": "postgresql://user:pass@localhost:5432/db"\n}');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('Database, PostgreSQL');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('filesystem-server');
    setType('stdio');
    setCommand('npx');
    setArgsInput('-y @modelcontextprotocol/server-filesystem /Users/dev/workspace');
    setUrl('');
    setEnvJson('{}');
    setDescription('Local file read/write tools');
    setTagsInput('Filesystem, Local');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (server: McpServerConfig) => {
    setEditingId(server.id);
    setName(server.name);
    setType(server.type);
    setCommand(server.command || '');
    setArgsInput((server.args || []).join(' '));
    setUrl(server.url || '');
    setEnvJson(JSON.stringify(server.envVars || server.env || {}, null, 2));
    setDescription(server.description || '');
    setTagsInput('MCP');
    setIsModalOpen(true);
  };


  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Server name is required');
      return;
    }

    let parsedEnv: Record<string, string> = {};
    try {
      if (envJson.trim()) parsedEnv = JSON.parse(envJson);
    } catch {
      showToast('warning', 'Invalid env JSON. Storing empty object.');
    }

    const args = argsInput
      .split(' ')
      .map((a) => a.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      updateMcpServer(editingId, {
        name,
        type,
        command: type === 'stdio' ? command : undefined,
        args: type === 'stdio' ? args : undefined,
        url: type !== 'stdio' ? url : undefined,
        envVars: parsedEnv,
        description,
      });
      showToast('success', 'MCP server updated');
    } else {
      addMcpServer({
        name,
        type,
        command: type === 'stdio' ? command : undefined,
        args: type === 'stdio' ? args : undefined,
        url: type !== 'stdio' ? url : undefined,
        envVars: parsedEnv,
        description,
        status: 'active',
      });
      showToast('success', 'MCP server added');
    }
    setIsModalOpen(false);
  };

  const handleCopy = async (text: string, label: string) => {
    await getPlatformAdapters().clipboard.writeText(text);
    showToast('success', `${label} copied to clipboard`);
  };

  // Generate Claude Desktop Config JSON
  const claudeConfig = React.useMemo(() => {
    const mcpServers: Record<string, any> = {};
    mcp
      .filter((s) => s.status === 'active')
      .forEach((s) => {
        const env = s.envVars || s.env || {};
        if (s.type === 'stdio') {
          mcpServers[s.name] = {
            command: s.command,
            args: s.args,
            env: Object.keys(env).length > 0 ? env : undefined,
          };
        } else {
          mcpServers[s.name] = {
            url: s.url,
            env: Object.keys(env).length > 0 ? env : undefined,
          };
        }
      });
    return JSON.stringify({ mcpServers }, null, 2);
  }, [mcp]);

  // Generate Cursor Config JSON
  const cursorConfig = React.useMemo(() => {
    const mcpServers: Record<string, any> = {};
    mcp
      .filter((s) => s.status === 'active')
      .forEach((s) => {
        const env = s.envVars || s.env;
        mcpServers[s.name] = {
          type: s.type,
          command: s.command,
          args: s.args,
          url: s.url,
          env: env && Object.keys(env).length > 0 ? env : undefined,
        };
      });
    return JSON.stringify({ mcpServers }, null, 2);
  }, [mcp]);


  const activeConfigString = activeFormat === 'claude' ? claudeConfig : cursorConfig;

  const handleDownloadConfig = () => {
    const filename =
      activeFormat === 'claude' ? 'claude_desktop_config.json' : 'mcp.json';
    const blob = new Blob([activeConfigString], { type: 'application/json' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(u);
    showToast('success', `Saved ${filename}`);
  };

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-sky-500" />
            Model Context Protocol (MCP) Server Manager
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Configure stdio/HTTP tools and export Claude Desktop or Cursor JSON configurations.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 -ms-0.5 me-1.5" />
          Add MCP Server
        </Button>
      </div>

      {/* Grid: Server Cards + Unified Config Exporter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Server Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {mcp.length > 0 ? (
            <div className="space-y-3">
              {mcp.map((server) => (
                <Card key={server.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono truncate">
                        {server.name}
                      </span>
                      <Badge variant="indigo" size="sm">
                        {server.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateMcpServer(server.id, {
                            status: server.status === 'active' ? 'inactive' : 'active',
                          })
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                          server.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {server.status === 'active' ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(server)}
                        className="p-1 text-zinc-400 hover:text-zinc-200"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMcpServer(server.id)}
                        className="p-1 text-zinc-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {server.description && (
                    <p className="text-xs text-zinc-400">{server.description}</p>
                  )}

                  {/* Command / URL Display */}
                  <div className="p-2 rounded-lg bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800 overflow-x-auto">
                    {server.type === 'stdio' ? (
                      <span className="text-emerald-400">
                        {server.command} {(server.args || []).join(' ')}
                      </span>
                    ) : (
                      <span className="text-sky-400">{server.url}</span>
                    )}
                  </div>

                  {/* Environment Vars preview */}
                  {(server.envVars || server.env) &&
                    Object.keys(server.envVars || server.env || {}).length > 0 && (
                      <div className="text-[11px] text-zinc-400 space-y-0.5">
                        <span className="font-semibold text-zinc-400">Env Variables:</span>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          {Object.keys(server.envVars || server.env || {}).map((k) => (
                            <span
                              key={k}
                              className="px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-zinc-300 text-[10px]"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Terminal className="h-6 w-6" />}
              title="No MCP Servers Configured"
              description="Add Model Context Protocol tools to integrate filesystem, databases, and custom APIs."
              actionLabel="Add Server"
              onAction={handleOpenAdd}
            />
          )}
        </div>

        {/* Right Column: Unified Config Exporter (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-4 space-y-3 sticky top-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Ready-to-use Config
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveFormat('claude')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeFormat === 'claude'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-zinc-400'
                  }`}
                >
                  Claude Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormat('cursor')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeFormat === 'cursor'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-zinc-400'
                  }`}
                >
                  Cursor MCP
                </button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              {activeFormat === 'claude'
                ? 'Paste into ~/Library/Application Support/Claude/claude_desktop_config.json'
                : 'Paste into .cursor/mcp.json in your project workspace.'}
            </p>

            <CodeViewer code={activeConfigString} language="json" maxHeight="380px" />

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={handleDownloadConfig}>
                <Download className="h-3.5 w-3.5 -ms-0.5 me-1" />
                Download JSON
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  handleCopy(
                    activeConfigString,
                    activeFormat === 'claude' ? 'Claude Desktop Config' : 'Cursor Config'
                  )
                }
              >
                <Copy className="h-3.5 w-3.5 -ms-0.5 me-1" />
                Copy Config
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit MCP Server' : 'Add MCP Server'}
        description="Configure standard I/O or HTTP server parameters."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Server ID / Name"
              placeholder="postgres-db"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Transport Type</label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as McpType)}
                options={[
                  { value: 'stdio', label: 'Standard I/O (stdio)' },
                  { value: 'http', label: 'HTTP REST' },
                  { value: 'sse', label: 'Server-Sent Events (SSE)' },
                ]}
              />

            </div>
          </div>

          {type === 'stdio' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Input
                  label="Command"
                  placeholder="npx / uvx / python"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Arguments (space-separated)"
                  placeholder="-y @modelcontextprotocol/server-postgres"
                  value={argsInput}
                  onChange={(e) => setArgsInput(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <Input
              label="Endpoint URL"
              placeholder="http://localhost:8000/sse"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Environment Variables (JSON)</label>
            <Textarea
              rows={3}
              value={envJson}
              onChange={(e) => setEnvJson(e.target.value)}
              className="font-mono text-xs"
              placeholder='{"API_KEY": "..."}'
            />
          </div>

          <Input
            label="Description"
            placeholder="e.g. Database querying and schema inspection tools"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Tags (comma-separated)"
            placeholder="Database, SQL, Tools"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save MCP Server</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
