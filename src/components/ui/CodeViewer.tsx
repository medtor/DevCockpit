import React, { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import { Copy, Check } from 'lucide-react';
import { getPlatformAdapters } from '../../core/adapters';
import { useToastStore } from '../../store/useToastStore';

export interface CodeViewerProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
  copyable?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'javascript',
  showLineNumbers = false,
  maxHeight = '400px',
  className = '',
  copyable = true,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToastStore();

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await getPlatformAdapters().clipboard.writeText(code);
      setCopied(true);
      showToast('success', 'Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('error', 'Failed to copy');
    }
  };

  const getHighlightedCode = () => {
    const langKey = language.toLowerCase();
    const grammar = Prism.languages[langKey] || Prism.languages.javascript || Prism.languages.plain;
    return Prism.highlight(code || '', grammar, langKey);
  };

  const lines = (code || '').split('\n');

  return (
    <div className={`relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 overflow-hidden font-mono text-xs ${className}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950/80 border-b border-zinc-800/80 text-[11px] text-zinc-400">
        <span className="font-medium uppercase tracking-wider text-zinc-400">{language}</span>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-zinc-200 transition-colors py-0.5 px-1.5 rounded bg-zinc-800/60 hover:bg-zinc-800"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Code Area */}
      <div
        className="p-3 overflow-auto text-start leading-relaxed scrollbar-thin"
        style={{ maxHeight }}
      >
        {showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30">
                  <td className="pe-4 text-end text-zinc-600 select-none w-8 text-[11px] align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre">
                    <span
                      dangerouslySetInnerHTML={{
                        __html:
                          Prism.highlight(
                            line,
                            Prism.languages[language.toLowerCase()] || Prism.languages.javascript,
                            language.toLowerCase()
                          ) || '&nbsp;',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="!m-0 !p-0 !bg-transparent whitespace-pre">
            <code
              className={`language-${language}`}
              dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
            />
          </pre>
        )}
      </div>
    </div>
  );
};
