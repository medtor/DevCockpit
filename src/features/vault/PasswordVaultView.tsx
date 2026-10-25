import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Plus,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';
import { VaultItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Switch } from '../../components/ui/Switch';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { getPlatformAdapters } from '../../core/adapters';
import { useToastStore } from '../../store/useToastStore';
import { estimatePassphraseEntropy, generatePassphrase, generateRandomPassword } from '../../core/security/password-generator.js';

const EFF_WORDLIST = [
  'correct', 'horse', 'battery', 'staple', 'quantum', 'cipher', 'stellar', 'plasma',
  'vector', 'matrix', 'orbital', 'nebula', 'protocol', 'aurora', 'syntax', 'horizon',
  'cascade', 'beacon', 'ember', 'granite', 'zenith', 'vortex', 'falcon', 'summit',
  'glacier', 'phantom', 'shadow', 'timber', 'breeze', 'dynamo', 'pulsar', 'prism',
];

export const PasswordVaultView: React.FC = () => {
  const { isVaultUnlocked, masterVaultKey } = useAppStore();
  const { vaultItems, addVaultItem, updateVaultItem, deleteVaultItem, lockSecureStorage, unlockStorage } = useDataStore();
  const { showToast } = useToastStore();

  // Master key unlock dialog state
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  // Generator State
  const [genMode, setGenMode] = useState<'random' | 'passphrase'>('random');
  const [genLength, setGenLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true);
  const [wordCount, setWordCount] = useState(4);
  const [wordSeparator, setWordSeparator] = useState('-');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [entropyStats, setEntropyStats] = useState({ entropy: 0, score: 0, label: 'Weak' });

  // Vault Management State
  const [search, setSearch] = useState('');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // Form Fields
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('Personal');
  const [isFavorite, setIsFavorite] = useState(false);

  const generateNewPassword = () => {
    const cryptoAdapter = getPlatformAdapters().crypto;
    const pwd = genMode === 'passphrase'
      ? generatePassphrase({
          wordList: EFF_WORDLIST,
          wordCount,
          appendNumber: useNumbers,
          capitalizeFirst: useUpper,
          separator: wordSeparator,
        })
      : generateRandomPassword({
          length: genLength,
          characters: [
            useUpper ? (avoidAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') : '',
            useLower ? (avoidAmbiguous ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz') : '',
            useNumbers ? (avoidAmbiguous ? '23456789' : '0123456789') : '',
            useSymbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '',
          ].join('') || 'abcdefghijklmnopqrstuvwxyz',
        });

    setGeneratedPassword(pwd);
    setEntropyStats(genMode === 'passphrase'
      ? estimatePassphraseEntropy(wordCount, EFF_WORDLIST.length, useNumbers)
      : cryptoAdapter.calculatePasswordEntropy(pwd));
  };

  useEffect(() => {
    generateNewPassword();
  }, [genMode, genLength, useUpper, useLower, useNumbers, useSymbols, avoidAmbiguous, wordCount, wordSeparator]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPasswordInput.trim()) {
      showToast('error', 'Master password is required');
      return;
    }
    try {
      await unlockStorage(masterPasswordInput);
      setIsUnlockModalOpen(false);
      setMasterPasswordInput('');
      showToast('success', 'Workspace unlocked');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to unlock workspace');
    }
  };

  const handleCopy = async (text: string, label: string) => {
    // 30 seconds auto-clearing clipboard for safety
    await getPlatformAdapters().clipboard.writeText(text, 30);
    showToast('success', `${label} copied!`, 'Clipboard will auto-clear in 30s for safety.');
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setUsername('');
    setPassword(generatedPassword || '');
    setEmail('');
    setUrl('');
    setNotes('');
    setTagsInput('Credentials');
    setIsFavorite(false);
    setIsItemModalOpen(true);
  };

  const handleOpenEdit = (item: VaultItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setUsername(item.username);
    setPassword(item.password);
    setEmail(item.email || '');
    setUrl(item.url || '');
    setNotes(item.notes || '');
    setTagsInput(item.tags.join(', '));
    setIsFavorite(item.isFavorite);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !password.trim()) {
      showToast('error', 'Title and Password are required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      updateVaultItem(editingId, {
        title,
        username,
        password,
        email,
        url,
        notes,
        tags,
        isFavorite,
      });
      showToast('success', 'Vault secret updated');
    } else {
      addVaultItem({
        title,
        username,
        password,
        email,
        url,
        notes,
        tags,
        isFavorite,
      });
      showToast('success', 'Secret stored in local vault');
    }
    setIsItemModalOpen(false);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredItems = vaultItems.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.username.toLowerCase().includes(q) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 text-start">
      {/* Header & Lock State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            Password Generator & Encrypted Vault
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Cryptographic password generator with entropy scoring & zero-knowledge local vault.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isVaultUnlocked ? (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const locked = await lockSecureStorage();
                if (locked) showToast('info', 'Workspace Locked');
              }}
            >
              <Lock className="h-3.5 w-3.5 -ms-0.5 me-1.5 text-amber-500" />
              Lock Vault
            </Button>
          ) : (
            <Button size="sm" onClick={() => setIsUnlockModalOpen(true)}>
              <Unlock className="h-3.5 w-3.5 -ms-0.5 me-1.5" />
              Unlock Master Vault
            </Button>
          )}
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 -ms-0.5 me-1.5" />
            New Secret
          </Button>
        </div>
      </div>

      {/* Generator Section */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              High-Entropy Generator
            </h3>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setGenMode('random')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                genMode === 'random' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400'
              }`}
            >
              Random String
            </button>
            <button
              type="button"
              onClick={() => setGenMode('passphrase')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                genMode === 'passphrase' ? 'bg-indigo-600 text-white font-medium' : 'text-zinc-400'
              }`}
            >
              Passphrase
            </button>
          </div>
        </div>

        {/* Generated Output Display */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <div className="flex-1 font-mono text-sm sm:text-base font-semibold tracking-wide text-indigo-600 dark:text-indigo-300 break-all select-all">
            {generatedPassword}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={generateNewPassword}
              title="Generate New"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={() => handleCopy(generatedPassword, 'Generated password')}
            >
              <Copy className="h-3.5 w-3.5 -ms-0.5 me-1.5" />
              Copy (30s)
            </Button>
          </div>
        </div>

        {/* Entropy Gauge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              Strength:{' '}
              <strong
                className={
                  entropyStats.score >= 3
                    ? 'text-emerald-400'
                    : entropyStats.score === 2
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }
              >
                {entropyStats.label}
              </strong>
            </span>
            <span className="font-mono text-zinc-400">{entropyStats.entropy} bits entropy</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                entropyStats.score >= 4
                  ? 'bg-emerald-500 w-full'
                  : entropyStats.score === 3
                  ? 'bg-emerald-400 w-3/4'
                  : entropyStats.score === 2
                  ? 'bg-amber-400 w-1/2'
                  : 'bg-rose-500 w-1/4'
              }`}
            />
          </div>
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
          {genMode === 'random' ? (
            <>
              <div className="space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Length:</span>
                  <span className="font-mono font-bold text-zinc-200">{genLength}</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={genLength}
                  onChange={(e) => setGenLength(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Switch checked={useUpper} onChange={setUseUpper} label="Uppercase (A-Z)" />
                <Switch checked={useLower} onChange={setUseLower} label="Lowercase (a-z)" />
              </div>

              <div className="space-y-2">
                <Switch checked={useNumbers} onChange={setUseNumbers} label="Numbers (0-9)" />
                <Switch checked={useSymbols} onChange={setUseSymbols} label="Symbols (!@#$)" />
              </div>

              <div>
                <Switch
                  checked={avoidAmbiguous}
                  onChange={setAvoidAmbiguous}
                  label="Avoid Ambiguous"
                  description="No O/0, l/1"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Words:</span>
                  <span className="font-mono font-bold text-zinc-200">{wordCount}</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={8}
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <Input
                  label="Separator"
                  value={wordSeparator}
                  onChange={(e) => setWordSeparator(e.target.value)}
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Switch checked={useUpper} onChange={setUseUpper} label="Capitalize first" />
                <Switch checked={useNumbers} onChange={setUseNumbers} label="Append number" />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Vault Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="w-full max-w-xs">
            <Input
              placeholder="Search stored secrets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs text-zinc-500">{vaultItems.length} secrets in vault</span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const isRevealed = revealedIds.has(item.id);
              const displayPassword = isRevealed ? item.password : '••••••••••••••••';

              return (
                <Card key={item.id} className="p-3.5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </span>
                        {item.isFavorite && (
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteVaultItem(item.id)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.username && (
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="text-zinc-400">User:</span>
                          <span className="text-zinc-300 select-all">{item.username}</span>
                        </div>
                      )}
                      {item.email && (
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="text-zinc-400">Email:</span>
                          <span className="text-zinc-300 truncate ms-2">{item.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Password Row */}
                    <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                      <span className="truncate me-2 text-zinc-200">{displayPassword}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleReveal(item.id)}
                          className="p-1 text-zinc-400 hover:text-zinc-200"
                          title={isRevealed ? 'Hide' : 'Reveal'}
                        >
                          {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.password, item.title)}
                          className="p-1 text-zinc-400 hover:text-zinc-200"
                          title="Copy Password"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {item.url && (
                    <a
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{item.url}</span>
                    </a>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Shield className="h-6 w-6" />}
            title="No Vault Secrets"
            description="Generate strong credentials and store them safely inside your browser."
            actionLabel="Add Secret"
            onAction={handleOpenAdd}
          />
        )}
      </div>

      {/* Unlock Master Key Modal */}
      <Modal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        title="Unlock Master Password Vault"
        description="Your password is processed strictly through Web Crypto PBKDF2 in memory."
      >
        <form onSubmit={handleUnlock} className="space-y-4">
          <Input
            label="Master Password"
            type="password"
            placeholder="Enter master password..."
            value={masterPasswordInput}
            onChange={(e) => setMasterPasswordInput(e.target.value)}
            required
            autoFocus
          />
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
            <ShieldCheck className="h-4 w-4 inline -ms-0.5 me-1 text-indigo-400" />
            Zero-Knowledge Architecture: Keys never leave your machine and are decrypted strictly inside client memory.
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsUnlockModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Unlock Vault</Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Secret Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingId ? 'Edit Secret' : 'Add New Secret'}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <Input
            label="Account / Title"
            placeholder="e.g. AWS Production IAM"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Username"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              label="Email"
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <button
                type="button"
                onClick={() => setPassword(generatedPassword)}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Use Generated Password
              </button>
            </div>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Input
            label="URL / Website"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <Input
            label="Tags (comma-separated)"
            placeholder="Work, Cloud, Database"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <Textarea
            label="Notes / Security info"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Switch
            checked={isFavorite}
            onChange={setIsFavorite}
            label="Pin to Favorites"
            description="Show on main dashboard shortcuts"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Secret</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
