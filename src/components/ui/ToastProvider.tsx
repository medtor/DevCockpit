import React from 'react';
import { useToastStore, ToastItem } from '../../store/useToastStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastProvider: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 end-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast: ToastItem) => {
        const icons = {
          success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
          warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
          error: <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />,
          info: <Info className="h-4 w-4 text-sky-500 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-500/30',
          warning: 'border-amber-500/30',
          error: 'border-rose-500/30',
          info: 'border-sky-500/30',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-white dark:bg-zinc-900 p-3.5 shadow-lg shadow-black/10 transition-all ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-start">
              <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{toast.title}</h5>
              {toast.message && (
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors -mt-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
