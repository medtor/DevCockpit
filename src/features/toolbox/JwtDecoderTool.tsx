import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Textarea';
import { decodeJwt } from '../../core/security/jwt-decoder';

const WARNING = 'Decoded only; signature, issuer, audience, expiry are NOT validated; never trust claims based on this page.';

export const JwtDecoderTool: React.FC = () => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<ReturnType<typeof decodeJwt> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = () => {
    try {
      setDecoded(decodeJwt(token.trim()));
      setError(null);
    } catch (caught) {
      setDecoded(null);
      setError(caught instanceof Error ? caught.message : 'Unable to decode JWT');
    }
  };

  return (
    <div className="space-y-4">
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border-2 border-amber-500 bg-amber-50 p-4 text-sm font-semibold text-amber-950 dark:bg-amber-950/50 dark:text-amber-100"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{WARNING}</p>
      </div>

      <Card className="space-y-3 p-4">
        <label htmlFor="jwt-token" className="text-xs font-bold uppercase text-zinc-500">
          JWT token
        </label>
        <Textarea
          id="jwt-token"
          rows={5}
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Paste a compact JWT (header.payload.signature)"
          className="font-mono text-xs"
          aria-label="JWT token"
        />
        <div>
          <Button onClick={handleDecode}>Decode JWT</Button>
        </div>
        {error && (
          <p role="alert" className="rounded border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-600 dark:text-rose-300">
            {error}
          </p>
        )}
      </Card>

      {decoded && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="space-y-2 p-4">
            <h3 className="text-xs font-bold uppercase text-zinc-500">Decoded header</h3>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded bg-zinc-100 p-3 font-mono text-xs text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </Card>
          <Card className="space-y-2 p-4">
            <h3 className="text-xs font-bold uppercase text-zinc-500">Decoded payload</h3>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded bg-zinc-100 p-3 font-mono text-xs text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </Card>
          <Card className="space-y-2 p-4 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase text-zinc-500">Raw signature</h3>
            <pre className="overflow-auto break-all rounded bg-zinc-100 p-3 font-mono text-xs text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
              {decoded.signature ?? 'Absent (empty signature part)'}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
};
