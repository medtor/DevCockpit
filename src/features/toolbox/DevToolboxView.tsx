import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Wrench,
  QrCode,
  FileJson,
  Binary,
  Fingerprint,
  KeyRound,
  CalendarClock,
  Hash,
  SearchCode,
  Clock,
  Palette,
  Type,
  Copy,
  Check,
  RefreshCw,
  ArrowRightLeft,
  Sparkles,
  Search,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { CodeViewer } from '../../components/ui/CodeViewer';
import { Tabs } from '../../components/ui/Tabs';
import { getPlatformAdapters } from '../../core/adapters';
import { useToastStore } from '../../store/useToastStore';
import { useAppStore } from '../../store/useAppStore';
import { QrGeneratorTool } from './QrGeneratorTool';
import { JwtDecoderTool } from './JwtDecoderTool';
import { CronParserTool } from './CronParserTool';

export interface ToolboxToolItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  icon: React.ReactNode;
}

export const TOOLBOX_TOOLS: ToolboxToolItem[] = [
  {
    id: 'qr',
    name: 'QR Generator',
    description: 'Customizable QR codes with colors, styling, logos, and instant SVG/PNG/clipboard export.',
    tags: ['qr', 'code', 'barcode', 'generator', 'link', 'url', 'wifi', 'vcard', 'image', 'svg', 'png', 'export'],
    icon: <QrCode className="h-4 w-4" />,
  },
  {
    id: 'json',
    name: 'JSON & TypeScript',
    description: 'Format, validate, prettify, minify JSON data, and generate TypeScript interfaces.',
    tags: ['json', 'typescript', 'interface', 'types', 'prettify', 'minify', 'formatter', 'validator', 'schema'],
    icon: <FileJson className="h-4 w-4" />,
  },
  {
    id: 'jwt',
    name: 'JWT Decoder',
    description: 'Decode JWT header and payload locally; signature and claims are not validated.',
    tags: ['jwt', 'token', 'json web token', 'decode', 'header', 'payload', 'signature', 'offline'],
    icon: <KeyRound className="h-4 w-4" />,
  },
  {
    id: 'cron',
    name: 'Cron Parser',
    description: 'Explain five-field numeric Unix cron schedules and preview five runs in an IANA timezone.',
    tags: ['cron', 'schedule', 'scheduler', 'expression', 'timezone', 'offline', 'runs'],
    icon: <CalendarClock className="h-4 w-4" />,
  },
  {
    id: 'base64',
    name: 'Base64 & URL & Hex',
    description: 'Encode and decode Base64 strings, URL percent-encoding, and Hexadecimal byte dumps.',
    tags: ['base64', 'url', 'hex', 'encode', 'decode', 'binary', 'byte', 'ascii', 'uri', 'escape'],
    icon: <Binary className="h-4 w-4" />,
  },
  {
    id: 'uuid',
    name: 'UUID Generator',
    description: 'Cryptographically secure RFC 4122 v4 UUIDs in bulk with uppercase and hyphen-removal options.',
    tags: ['uuid', 'guid', 'v4', 'random', 'id', 'unique', 'identifier', 'generator', 'bulk'],
    icon: <Fingerprint className="h-4 w-4" />,
  },
  {
    id: 'hash',
    name: 'Crypto Hashes',
    description: 'Cryptographic SHA-256 and SHA-512 hashes client-side using Web Crypto API.',
    tags: ['hash', 'sha256', 'sha512', 'checksum', 'digest', 'cryptography', 'security', 'crypto'],
    icon: <Hash className="h-4 w-4" />,
  },
  {
    id: 'regex',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions in real-time with flags and capture group extraction.',
    tags: ['regex', 'regexp', 'regular expression', 'pattern', 'test', 'match', 'extract', 'groups', 'flags'],
    icon: <SearchCode className="h-4 w-4" />,
  },
  {
    id: 'timestamp',
    name: 'Timestamp & Date',
    description: 'Convert Unix epoch timestamps to ISO-8601, UTC, and human-readable local dates.',
    tags: ['timestamp', 'epoch', 'unix', 'time', 'date', 'iso', 'utc', 'clock', 'converter', 'seconds'],
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'color',
    name: 'Color Converter',
    description: 'Convert HEX color codes to RGB, RGBA, and HSL formats with color picker and one-click copy.',
    tags: ['color', 'hex', 'rgb', 'rgba', 'hsl', 'palette', 'css', 'converter', 'picker'],
    icon: <Palette className="h-4 w-4" />,
  },
  {
    id: 'text',
    name: 'Text Case & Duplicates',
    description: 'Transform text into camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and deduplicate lines.',
    tags: ['text', 'case', 'camelcase', 'pascalcase', 'snakecase', 'kebabcase', 'constantcase', 'deduplicate', 'words', 'lines'],
    icon: <Type className="h-4 w-4" />,
  },
];

export const DevToolboxView: React.FC = () => {
  const { showToast } = useToastStore();
  const { activeToolboxTab, setActiveToolboxTab } = useAppStore();
  const activeTool = activeToolboxTab || 'qr';
  const setActiveTool = (t: string) => setActiveToolboxTab(t);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter tools by name, description, or tags
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return TOOLBOX_TOOLS;
    return TOOLBOX_TOOLS.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Current active tool item
  const currentTool = useMemo(
    () => TOOLBOX_TOOLS.find((t) => t.id === activeTool) || TOOLBOX_TOOLS[0],
    [activeTool]
  );

  // If user searches and active tool is not in filtered list, switch to the first matching tool
  useEffect(() => {
    if (searchQuery.trim() && filteredTools.length > 0 && !filteredTools.some((t) => t.id === activeTool)) {
      setActiveTool(filteredTools[0].id);
    }
  }, [searchQuery, filteredTools, activeTool]);

  // Keyboard shortcut: '/' focuses search when not typing in an input/textarea
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        if (searchQuery) {
          setSearchQuery('');
        } else {
          searchInputRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  const handleCopy = async (text: string, label: string, key?: string) => {
    if (!text) return;
    try {
      await getPlatformAdapters().clipboard.writeText(text);
      if (key) {
        setCopiedKey(key);
        setTimeout(() => {
          setCopiedKey((curr) => (curr === key ? null : curr));
        }, 2000);
      }
      showToast('success', `${label} copied to clipboard`);
    } catch {
      showToast('error', 'Failed to copy to clipboard');
    }
  };

  // 1. JSON TOOL STATE
  const [jsonInput, setJsonInput] = useState('{\n  "name": "DevDesk",\n  "version": 1.0,\n  "offline": true\n}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonError(null);
      showToast('success', 'JSON formatted');
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setJsonError(null);
      showToast('success', 'JSON minified');
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const generatedTsInterface = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (typeof parsed !== 'object' || parsed === null) return '// Not an object';

      const generateInterface = (obj: any, name = 'RootObject'): string => {
        const lines = [`export interface ${name} {`];
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          let typeStr: string = typeof val;
          if (val === null) typeStr = 'any';
          else if (Array.isArray(val)) {
            typeStr = val.length > 0 ? `${typeof val[0]}[]` : 'any[]';
          } else if (typeStr === 'object') {
            typeStr = 'Record<string, any>';
          }
          lines.push(`  ${key}: ${typeStr};`);
        }
        lines.push('}');
        return lines.join('\n');
      };


      return generateInterface(parsed);
    } catch {
      return '// Enter valid JSON to generate TypeScript interface';
    }
  }, [jsonInput]);

  // 2. BASE64 & URL TOOL STATE
  const [b64Input, setB64Input] = useState('Hello DevDesk Desktop OS!');
  const [b64Mode, setB64Mode] = useState<'encode' | 'decode'>('encode');
  const [b64Type, setB64Type] = useState<'base64' | 'url' | 'hex'>('base64');

  const b64Output = useMemo(() => {
    try {
      if (!b64Input) return '';
      if (b64Type === 'base64') {
        return b64Mode === 'encode'
          ? btoa(unescape(encodeURIComponent(b64Input)))
          : decodeURIComponent(escape(atob(b64Input)));
      } else if (b64Type === 'url') {
        return b64Mode === 'encode' ? encodeURIComponent(b64Input) : decodeURIComponent(b64Input);
      } else if (b64Type === 'hex') {
        if (b64Mode === 'encode') {
          return Array.from(new TextEncoder().encode(b64Input))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(' ');
        } else {
          const cleaned = b64Input.replace(/[^0-9a-fA-F]/g, '');
          const bytes = new Uint8Array(cleaned.length / 2);
          for (let i = 0; i < cleaned.length; i += 2) {
            bytes[i / 2] = parseInt(cleaned.substr(i, 2), 16);
          }
          return new TextDecoder().decode(bytes);
        }
      }
      return '';
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }, [b64Input, b64Mode, b64Type]);

  // 3. UUID GENERATOR STATE
  const [uuidCount, setUuidCount] = useState(5);
  const [uuidUppercase, setUuidUppercase] = useState(false);
  const [uuidNoHyphens, setUuidNoHyphens] = useState(false);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);

  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let id: string = crypto.randomUUID();
      if (uuidNoHyphens) id = id.replace(/-/g, '');
      if (uuidUppercase) id = id.toUpperCase();
      list.push(id);
    }
    setGeneratedUuids(list);
  };


  // 4. HASH GENERATOR STATE
  const [hashInput, setHashInput] = useState('SecretDevDeskData');
  const [sha256Hash, setSha256Hash] = useState('');
  const [sha512Hash, setSha512Hash] = useState('');

  React.useEffect(() => {
    const computeHashes = async () => {
      if (!hashInput) {
        setSha256Hash('');
        setSha512Hash('');
        return;
      }
      const data = new TextEncoder().encode(hashInput);

      // SHA-256
      const buf256 = await crypto.subtle.digest('SHA-256', data);
      setSha256Hash(
        Array.from(new Uint8Array(buf256))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      );

      // SHA-512
      const buf512 = await crypto.subtle.digest('SHA-512', data);
      setSha512Hash(
        Array.from(new Uint8Array(buf512))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      );
    };
    computeHashes();
  }, [hashInput]);

  // 5. REGEX TESTER STATE
  const [regexPattern, setRegexPattern] = useState('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestText, setRegexTestText] = useState(
    'Contact team@devdesk.local or support@google.com for assistance.'
  );

  const regexResults = useMemo(() => {
    try {
      if (!regexPattern) return { matches: [], error: null };
      const re = new RegExp(regexPattern, regexFlags);
      const matches = Array.from(regexTestText.matchAll(re));
      return { matches, error: null };
    } catch (e: any) {
      return { matches: [], error: e.message };
    }
  }, [regexPattern, regexFlags, regexTestText]);

  // 6. TIMESTAMP CONVERTER STATE
  const [timestampInput, setTimestampInput] = useState(String(Math.floor(Date.now() / 1000)));

  const parsedTimestamp = useMemo(() => {
    try {
      const num = Number(timestampInput);
      const date = new Date(num > 1e11 ? num : num * 1000);
      return {
        iso: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toLocaleString(),
        unixSec: Math.floor(date.getTime() / 1000),
        unixMs: date.getTime(),
      };
    } catch {
      return null;
    }
  }, [timestampInput]);

  // 7. COLOR CONVERTER STATE
  const [hexColor, setHexColor] = useState('#6366f1');

  const colorConversions = useMemo(() => {
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length !== 6) return null;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      hex: `#${hex}`,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
      rgba: `rgba(${r}, ${g}, ${b}, 1)`,
    };
  }, [hexColor]);

  // 8. TEXT TRANSFORMATION STATE
  const [textTransformInput, setTextTransformInput] = useState('DevDesk Local First Desktop Dashboard');

  const textTransformations = useMemo(() => {
    const raw = textTransformInput;
    const words = raw.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [];

    const camelCase = words
      .map((w, i) =>
        i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join('');

    const pascalCase = words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');

    const snakeCase = words.map((w) => w.toLowerCase()).join('_');
    const kebabCase = words.map((w) => w.toLowerCase()).join('-');
    const constantCase = words.map((w) => w.toUpperCase()).join('_');

    const lines = raw.split('\n');
    const uniqueLines = Array.from(new Set(lines)).join('\n');

    return {
      camelCase,
      pascalCase,
      snakeCase,
      kebabCase,
      constantCase,
      charCount: raw.length,
      wordCount: (raw.match(/\S+/g) || []).length,
      lineCount: lines.length,
      uniqueLines,
    };
  }, [textTransformInput]);

  return (
    <div className="space-y-6 text-start">
      {/* Header with Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-indigo-500" />
            Developer Utility Toolbox
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Client-side instant formatters, encoders, cryptographic hashes, and converters.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72 md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools (e.g. json, hash, uuid)..."
            aria-label="Filter developer utilities"
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-xs"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              title="Clear search"
              aria-label="Clear search query"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd
              title="Press / to focus search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-2xs pointer-events-none"
            >
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Search results banner when filtering */}
      {searchQuery.trim() && filteredTools.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 text-xs">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span>
              Found <strong>{filteredTools.length}</strong> {filteredTools.length === 1 ? 'utility' : 'utilities'} matching &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            <X className="h-3 w-3" />
            Clear filter
          </button>
        </div>
      )}

      {/* Tool Navigation Tabs */}
      {filteredTools.length > 0 && (
        <Tabs
          activeTab={activeTool}
          onChange={(t) => setActiveTool(t as any)}
          tabs={filteredTools.map((t) => ({
            id: t.id,
            label: t.name,
            icon: t.icon,
          }))}
        />
      )}

      {/* Active tool description header */}
      {filteredTools.length > 0 && currentTool && (
        <div className="flex items-center justify-between px-1 text-xs text-zinc-500 dark:text-zinc-400 -mt-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentTool.name}</span>
            <span className="opacity-40">•</span>
            <span>{currentTool.description}</span>
          </div>
        </div>
      )}

      {/* Empty State when no tools match query */}
      {filteredTools.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
          <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-400">
            <Search className="h-6 w-6" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No developer utilities found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No tools match &ldquo;<span className="font-medium text-zinc-700 dark:text-zinc-300">{searchQuery}</span>&rdquo;. Try searching for JSON, UUID, Hashes, Base64, Regex, Timestamp, Color, or Text Case.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="flex items-center gap-1.5 mt-2"
          >
            <X className="h-3.5 w-3.5" />
            Clear Search Filter
          </Button>
        </Card>
      ) : (
        <>
          {/* 0. QR GENERATOR TOOL */}
          {activeTool === 'qr' && <QrGeneratorTool />}

          {/* JWT DECODER TOOL */}
          {activeTool === 'jwt' && <JwtDecoderTool />}

          {/* CRON PARSER TOOL */}
          {activeTool === 'cron' && <CronParserTool />}

          {/* 1. JSON & TYPESCRIPT TOOL */}
          {activeTool === 'json' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase">JSON Input</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(jsonInput, 'JSON Input', 'json-input')}
                  className={copiedKey === 'json-input' ? 'border-emerald-500 text-emerald-500' : ''}
                >
                  {copiedKey === 'json-input' ? (
                    <>
                      <Check className="h-3.5 w-3.5 -ms-0.5 me-1 text-emerald-500 animate-in zoom-in-50 duration-200" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 -ms-0.5 me-1" />
                      Copy JSON
                    </>
                  )}
                </Button>
                <Button size="sm" variant="secondary" onClick={minifyJson}>
                  Minify
                </Button>
                <Button size="sm" onClick={formatJson}>
                  Format JSON
                </Button>
              </div>
            </div>
            <Textarea
              rows={14}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="font-mono text-xs"
            />
            {jsonError && (
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                {jsonError}
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase">TypeScript Type Output</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(generatedTsInterface, 'TypeScript interface', 'ts-interface')}
                className={copiedKey === 'ts-interface' ? 'border-emerald-500 text-emerald-500 font-semibold' : ''}
              >
                {copiedKey === 'ts-interface' ? (
                  <>
                    <Check className="h-3.5 w-3.5 -ms-0.5 me-1 text-emerald-500 animate-in zoom-in-50 duration-200" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 -ms-0.5 me-1" />
                    Copy Interface
                  </>
                )}
              </Button>
            </div>
            <CodeViewer code={generatedTsInterface} language="typescript" maxHeight="380px" />
          </Card>
        </div>
      )}

      {/* 2. BASE64 & URL TOOL */}
      {activeTool === 'base64' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setB64Mode('encode')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  b64Mode === 'encode' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                }`}
              >
                Encode
              </button>
              <button
                type="button"
                onClick={() => setB64Mode('decode')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  b64Mode === 'decode' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                }`}
              >
                Decode
              </button>
            </div>

            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 text-xs">
              {(['base64', 'url', 'hex'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setB64Type(t)}
                  className={`px-3 py-1.5 rounded-md font-medium uppercase transition-colors ${
                    b64Type === t ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase">Input Text</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(b64Input, 'Input text', 'b64-input')}
                  className="h-7 text-xs"
                >
                  {copiedKey === 'b64-input' ? (
                    <>
                      <Check className="h-3.5 w-3.5 -ms-0.5 me-1 text-emerald-500 animate-in zoom-in-50 duration-200" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 -ms-0.5 me-1 text-zinc-400" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                rows={10}
                value={b64Input}
                onChange={(e) => setB64Input(e.target.value)}
                className="font-mono text-xs"
              />
            </Card>

            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase">Output Result</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(b64Output, 'Converted output', 'b64-output')}
                  className={copiedKey === 'b64-output' ? 'border-emerald-500 text-emerald-500 font-semibold' : ''}
                >
                  {copiedKey === 'b64-output' ? (
                    <>
                      <Check className="h-3.5 w-3.5 -ms-0.5 me-1 text-emerald-500 animate-in zoom-in-50 duration-200" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 -ms-0.5 me-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="relative group">
                <Textarea
                  rows={10}
                  readOnly
                  value={b64Output}
                  onClick={() => handleCopy(b64Output, 'Converted output', 'b64-output')}
                  className="font-mono text-xs bg-zinc-50 dark:bg-zinc-950/80 cursor-pointer"
                  title="Click to copy result"
                />
                {copiedKey === 'b64-output' && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500/90 text-white rounded text-[11px] font-medium flex items-center gap-1 shadow animate-in fade-in zoom-in-95 duration-150">
                    <Check className="h-3 w-3" /> Copied!
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 3. UUID GENERATOR */}
      {activeTool === 'uuid' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Count:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={uuidCount}
                  onChange={(e) => setUuidCount(Number(e.target.value))}
                  className="w-16 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-center font-mono text-xs"
                />
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidUppercase}
                  onChange={(e) => setUuidUppercase(e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>Uppercase</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidNoHyphens}
                  onChange={(e) => setUuidNoHyphens(e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>Remove hyphens</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              {generatedUuids.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(generatedUuids.join('\n'), 'All UUIDs', 'uuid-all')}
                  className={copiedKey === 'uuid-all' ? 'border-emerald-500 text-emerald-500' : ''}
                >
                  {copiedKey === 'uuid-all' ? (
                    <>
                      <Check className="h-3.5 w-3.5 -ms-0.5 me-1 text-emerald-500 animate-in zoom-in-50 duration-200" />
                      Copied All!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 -ms-0.5 me-1" />
                      Copy All
                    </>
                  )}
                </Button>
              )}
              <Button onClick={generateUuids}>
                <RefreshCw className="h-3.5 w-3.5 -ms-0.5 me-1.5" />
                Generate UUIDs
              </Button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            {generatedUuids.length > 0 ? (
              <div className="space-y-1.5">
                {generatedUuids.map((id, idx) => {
                  const isCopied = copiedKey === `uuid-${idx}`;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleCopy(id, 'UUID', `uuid-${idx}`)}
                      className={`flex items-center justify-between p-2.5 rounded-lg font-mono text-xs border transition-colors cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                      title="Click to copy"
                    >
                      <span className={isCopied ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-900 dark:text-zinc-100'}>
                        {id}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(id, 'UUID', `uuid-${idx}`);
                        }}
                        className={`p-1 rounded transition-colors ${
                          isCopied
                            ? 'text-emerald-500'
                            : 'text-zinc-400 hover:text-zinc-100'
                        }`}
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400">
                Click &quot;Generate UUIDs&quot; to produce cryptographic UUID v4 IDs.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 4. CRYPTO HASHES */}
      {activeTool === 'hash' && (
        <Card className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
              Input String / Payload
            </label>
            <Input value={hashInput} onChange={(e) => setHashInput(e.target.value)} />
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-400">SHA-256 (256-bit)</span>
                <button
                  type="button"
                  onClick={() => handleCopy(sha256Hash, 'SHA-256', 'hash-sha256')}
                  className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                    copiedKey === 'hash-sha256'
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-indigo-500 dark:text-indigo-400 hover:underline'
                  }`}
                >
                  {copiedKey === 'hash-sha256' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500 animate-in zoom-in-50 duration-200" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <div
                onClick={() => handleCopy(sha256Hash, 'SHA-256', 'hash-sha256')}
                className={`p-2.5 rounded-lg font-mono text-xs break-all select-all border cursor-pointer transition-colors ${
                  copiedKey === 'hash-sha256'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 dark:text-emerald-300'
                    : 'bg-zinc-100 dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
                title="Click to copy SHA-256"
              >
                {sha256Hash || '...'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-400">SHA-512 (512-bit)</span>
                <button
                  type="button"
                  onClick={() => handleCopy(sha512Hash, 'SHA-512', 'hash-sha512')}
                  className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                    copiedKey === 'hash-sha512'
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-indigo-500 dark:text-indigo-400 hover:underline'
                  }`}
                >
                  {copiedKey === 'hash-sha512' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500 animate-in zoom-in-50 duration-200" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <div
                onClick={() => handleCopy(sha512Hash, 'SHA-512', 'hash-sha512')}
                className={`p-2.5 rounded-lg font-mono text-xs break-all select-all border cursor-pointer transition-colors ${
                  copiedKey === 'hash-sha512'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-sky-500 dark:text-sky-300'
                    : 'bg-zinc-100 dark:bg-zinc-950 text-sky-600 dark:text-sky-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
                title="Click to copy SHA-512"
              >
                {sha512Hash || '...'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 5. REGEX TESTER */}
      {activeTool === 'regex' && (
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <Input
                  label="Regular Expression Pattern"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <Input
                  label="Flags"
                  value={regexFlags}
                  onChange={(e) => setRegexFlags(e.target.value)}
                  placeholder="gims"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                Test Target String
              </label>
              <Textarea
                rows={4}
                value={regexTestText}
                onChange={(e) => setRegexTestText(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </Card>

          {/* Regex Matches Table */}
          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase">
                Captured Matches ({regexResults.matches.length})
              </span>
              {regexResults.matches.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(
                      regexResults.matches.map((m) => m[0]).join('\n'),
                      'All regex matches',
                      'regex-all'
                    )
                  }
                  className="h-7 text-xs"
                >
                  {copiedKey === 'regex-all' ? (
                    <>
                      <Check className="h-3.5 w-3.5 -ms-0.5 me-1 text-emerald-500 animate-in zoom-in-50 duration-200" />
                      <span className="text-emerald-500">Copied All</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 -ms-0.5 me-1" />
                      Copy All
                    </>
                  )}
                </Button>
              )}
            </div>

            {regexResults.error ? (
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                {regexResults.error}
              </div>
            ) : regexResults.matches.length > 0 ? (
              <div className="space-y-2">
                {regexResults.matches.map((m, idx) => {
                  const matchKey = `regex-match-${idx}`;
                  const isMatchCopied = copiedKey === matchKey;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border font-mono text-xs space-y-1 transition-colors ${
                        isMatchCopied
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : 'bg-zinc-950 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="text-indigo-400 font-bold">Match #{idx + 1}:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-500">Index {m.index}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(m[0], `Match #${idx + 1}`, matchKey)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-100 transition-colors"
                            title="Copy full match"
                          >
                            {isMatchCopied ? (
                              <Check className="h-3 w-3 text-emerald-500 animate-in zoom-in-50 duration-200" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div
                        onClick={() => handleCopy(m[0], `Match #${idx + 1}`, matchKey)}
                        className="p-1.5 rounded bg-zinc-900 text-zinc-100 cursor-pointer hover:bg-zinc-850 transition-colors"
                      >
                        {m[0]}
                      </div>
                      {m.length > 1 && (
                        <div className="pt-1 text-[11px] text-zinc-400 space-y-1">
                          <span className="font-semibold text-zinc-400">Captured Groups:</span>
                          {Array.from(m)
                            .slice(1)
                            .map((grp, gIdx) => {
                              const grpKey = `regex-m-${idx}-g-${gIdx}`;
                              const isGrpCopied = copiedKey === grpKey;
                              const grpStr = String(grp ?? '');
                              return (
                                <div
                                  key={gIdx}
                                  onClick={() => handleCopy(grpStr, `Group ${gIdx + 1}`, grpKey)}
                                  className={`flex items-center justify-between p-1 rounded cursor-pointer transition-colors ${
                                    isGrpCopied ? 'bg-emerald-500/15' : 'hover:bg-zinc-900'
                                  }`}
                                >
                                  <div className="flex gap-2">
                                    <span className="text-amber-400">Group {gIdx + 1}:</span>
                                    <span className={isGrpCopied ? 'text-emerald-300 font-semibold' : 'text-zinc-200'}>
                                      {grpStr}
                                    </span>
                                  </div>
                                  <span className="text-zinc-500">
                                    {isGrpCopied ? (
                                      <Check className="h-3 w-3 text-emerald-500 animate-in zoom-in-50 duration-200" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500">No match found</div>
            )}
          </Card>
        </div>
      )}

      {/* 6. TIMESTAMP & DATE */}
      {activeTool === 'timestamp' && (
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <Input
                label="Unix Timestamp (seconds or milliseconds)"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
              />
            </div>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => setTimestampInput(String(Math.floor(Date.now() / 1000)))}
            >
              Set Current Time
            </Button>
          </div>

          {parsedTimestamp && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div
                onClick={() => handleCopy(parsedTimestamp.iso, 'ISO 8601 Date', 'ts-iso')}
                className={`p-3 rounded-lg border space-y-1 cursor-pointer transition-all ${
                  copiedKey === 'ts-iso'
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">ISO 8601</span>
                  {copiedKey === 'ts-iso' ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                      <Check className="h-3 w-3 animate-in zoom-in-50 duration-200" /> Copied!
                    </span>
                  ) : (
                    <Copy className="h-3 w-3 text-zinc-400" />
                  )}
                </div>
                <div className="font-mono font-semibold text-indigo-400 select-all">
                  {parsedTimestamp.iso}
                </div>
              </div>

              <div
                onClick={() => handleCopy(parsedTimestamp.local, 'Local Browser Format', 'ts-local')}
                className={`p-3 rounded-lg border space-y-1 cursor-pointer transition-all ${
                  copiedKey === 'ts-local'
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Local Browser Format</span>
                  {copiedKey === 'ts-local' ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                      <Check className="h-3 w-3 animate-in zoom-in-50 duration-200" /> Copied!
                    </span>
                  ) : (
                    <Copy className="h-3 w-3 text-zinc-400" />
                  )}
                </div>
                <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-200 select-all">
                  {parsedTimestamp.local}
                </div>
              </div>

              <div
                onClick={() => handleCopy(parsedTimestamp.utc, 'UTC String', 'ts-utc')}
                className={`p-3 rounded-lg border space-y-1 cursor-pointer transition-all ${
                  copiedKey === 'ts-utc'
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">UTC String</span>
                  {copiedKey === 'ts-utc' ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                      <Check className="h-3 w-3 animate-in zoom-in-50 duration-200" /> Copied!
                    </span>
                  ) : (
                    <Copy className="h-3 w-3 text-zinc-400" />
                  )}
                </div>
                <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-200 select-all">
                  {parsedTimestamp.utc}
                </div>
              </div>

              <div
                onClick={() => handleCopy(String(parsedTimestamp.unixSec), 'Unix Epoch Seconds', 'ts-unix')}
                className={`p-3 rounded-lg border space-y-1 cursor-pointer transition-all ${
                  copiedKey === 'ts-unix'
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Seconds / Milliseconds</span>
                  {copiedKey === 'ts-unix' ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                      <Check className="h-3 w-3 animate-in zoom-in-50 duration-200" /> Copied!
                    </span>
                  ) : (
                    <Copy className="h-3 w-3 text-zinc-400" />
                  )}
                </div>
                <div className="font-mono font-semibold text-amber-400 select-all">
                  {parsedTimestamp.unixSec}s ({parsedTimestamp.unixMs}ms)
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 7. COLOR CONVERTER */}
      {activeTool === 'color' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              className="h-12 w-12 rounded-xl cursor-pointer bg-transparent border-0"
            />
            <div className="flex-1">
              <Input
                label="HEX Color Code"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
              />
            </div>
          </div>

          {colorConversions && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div
                onClick={() => handleCopy(colorConversions.hex, 'HEX Color', 'color-hex')}
                className={`p-3 rounded-lg border space-y-1 cursor-pointer transition-all ${
                  copiedKey === 'color-hex'
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">HEX</span>
                  {copiedKey === 'color-hex' ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                      <Check className="h-3 w-3 animate-in zoom-in-50 duration-200" /> Copied!
                    </span>
                  ) : (
                    <Copy className="h-3 w-3 text-zinc-400" />
                  )}
                </div>
                <div className="font-mono font-semibold text-indigo-400 select-all">
                  {colorConversions.hex}
                </div>
              </div>

              <div
                onClick={() => handleCopy(colorConversions.rgb, 'RGB Color', 'color-rgb')}
                className={`p-3 rounded-lg border space-y-1 cursor-pointer transition-all ${
                  copiedKey === 'color-rgb'
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">RGB</span>
                  {copiedKey === 'color-rgb' ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                      <Check className="h-3 w-3 animate-in zoom-in-50 duration-200" /> Copied!
                    </span>
                  ) : (
                    <Copy className="h-3 w-3 text-zinc-400" />
                  )}
                </div>
                <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-200 select-all">
                  {colorConversions.rgb}
                </div>
              </div>

              <div
                onClick={() => handleCopy(colorConversions.hsl, 'HSL Color', 'color-hsl')}
                className={`p-3 rounded-lg border space-y-1 cursor-pointer transition-all ${
                  copiedKey === 'color-hsl'
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">HSL</span>
                  {copiedKey === 'color-hsl' ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                      <Check className="h-3 w-3 animate-in zoom-in-50 duration-200" /> Copied!
                    </span>
                  ) : (
                    <Copy className="h-3 w-3 text-zinc-400" />
                  )}
                </div>
                <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-200 select-all">
                  {colorConversions.hsl}
                </div>
              </div>

              <div
                onClick={() => handleCopy(colorConversions.rgba, 'RGBA Color', 'color-rgba')}
                className={`p-3 rounded-lg border space-y-1 cursor-pointer transition-all ${
                  copiedKey === 'color-rgba'
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">RGBA</span>
                  {copiedKey === 'color-rgba' ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                      <Check className="h-3 w-3 animate-in zoom-in-50 duration-200" /> Copied!
                    </span>
                  ) : (
                    <Copy className="h-3 w-3 text-zinc-400" />
                  )}
                </div>
                <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-200 select-all">
                  {colorConversions.rgba}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 8. TEXT TRANSFORMATION */}
      {activeTool === 'text' && (
        <div className="space-y-4">
          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-400 uppercase">Input Text</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(textTransformInput, 'Input Text', 'text-input')}
                className="h-7 text-xs"
              >
                {copiedKey === 'text-input' ? (
                  <>
                    <Check className="h-3.5 w-3.5 -ms-0.5 me-1 text-emerald-500 animate-in zoom-in-50 duration-200" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 -ms-0.5 me-1 text-zinc-400" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Textarea
              rows={4}
              value={textTransformInput}
              onChange={(e) => setTextTransformInput(e.target.value)}
              className="font-mono text-xs"
            />
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div
              onClick={() => handleCopy(textTransformations.camelCase, 'camelCase', 'text-camel')}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                copiedKey === 'text-camel'
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <span className="text-zinc-400">camelCase:</span>
                <div className={`font-mono font-semibold truncate max-w-[240px] sm:max-w-[280px] ${copiedKey === 'text-camel' ? 'text-emerald-500 dark:text-emerald-300' : 'text-indigo-500 dark:text-indigo-400'}`}>
                  {textTransformations.camelCase}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(textTransformations.camelCase, 'camelCase', 'text-camel');
                }}
                className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {copiedKey === 'text-camel' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div
              onClick={() => handleCopy(textTransformations.pascalCase, 'PascalCase', 'text-pascal')}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                copiedKey === 'text-pascal'
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <span className="text-zinc-400">PascalCase:</span>
                <div className={`font-mono font-semibold truncate max-w-[240px] sm:max-w-[280px] ${copiedKey === 'text-pascal' ? 'text-emerald-500 dark:text-emerald-300' : 'text-indigo-500 dark:text-indigo-400'}`}>
                  {textTransformations.pascalCase}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(textTransformations.pascalCase, 'PascalCase', 'text-pascal');
                }}
                className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {copiedKey === 'text-pascal' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div
              onClick={() => handleCopy(textTransformations.snakeCase, 'snake_case', 'text-snake')}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                copiedKey === 'text-snake'
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <span className="text-zinc-400">snake_case:</span>
                <div className={`font-mono font-semibold truncate max-w-[240px] sm:max-w-[280px] ${copiedKey === 'text-snake' ? 'text-emerald-500 dark:text-emerald-300' : 'text-sky-500 dark:text-sky-400'}`}>
                  {textTransformations.snakeCase}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(textTransformations.snakeCase, 'snake_case', 'text-snake');
                }}
                className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {copiedKey === 'text-snake' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div
              onClick={() => handleCopy(textTransformations.kebabCase, 'kebab-case', 'text-kebab')}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                copiedKey === 'text-kebab'
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <span className="text-zinc-400">kebab-case:</span>
                <div className={`font-mono font-semibold truncate max-w-[240px] sm:max-w-[280px] ${copiedKey === 'text-kebab' ? 'text-emerald-500 dark:text-emerald-300' : 'text-sky-500 dark:text-sky-400'}`}>
                  {textTransformations.kebabCase}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(textTransformations.kebabCase, 'kebab-case', 'text-kebab');
                }}
                className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {copiedKey === 'text-kebab' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div
              onClick={() => handleCopy(textTransformations.constantCase, 'CONSTANT_CASE', 'text-constant')}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                copiedKey === 'text-constant'
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <span className="text-zinc-400">CONSTANT_CASE:</span>
                <div className={`font-mono font-semibold truncate max-w-[240px] sm:max-w-[280px] ${copiedKey === 'text-constant' ? 'text-emerald-500 dark:text-emerald-300' : 'text-amber-500 dark:text-amber-400'}`}>
                  {textTransformations.constantCase}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(textTransformations.constantCase, 'CONSTANT_CASE', 'text-constant');
                }}
                className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {copiedKey === 'text-constant' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div
              onClick={() => handleCopy(textTransformations.uniqueLines, 'Deduplicated Unique Lines', 'text-unique')}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                copiedKey === 'text-unique'
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <span className="text-zinc-400">Deduplicated Lines:</span>
                <div className="font-mono text-zinc-700 dark:text-zinc-200">
                  {textTransformations.charCount} chars • {textTransformations.wordCount} words • {textTransformations.lineCount} lines
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(textTransformations.uniqueLines, 'Deduplicated Unique Lines', 'text-unique');
                }}
                className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
                title="Copy deduplicated lines"
              >
                {copiedKey === 'text-unique' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
