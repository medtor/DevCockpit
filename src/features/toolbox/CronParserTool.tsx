import React, { useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { parseCronExpression, CRON_PREVIEW_HORIZON_YEARS } from '../../core/cron/cron-parser.js';

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export const CronParserTool: React.FC = () => {
  const [expression, setExpression] = useState('*/15 * * * *');
  const [timeZone, setTimeZone] = useState(browserTimezone);
  const result = useMemo(() => parseCronExpression(expression, { timeZone }), [expression, timeZone]);
  const localFormatter = useMemo(() => {
    if (!result.valid) return null;
    try {
      return new Intl.DateTimeFormat(undefined, {
        timeZone, dateStyle: 'medium', timeStyle: 'medium', timeZoneName: 'short',
      });
    } catch {
      return null;
    }
  }, [timeZone, result.valid]);

  return (
    <Card className="p-5 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Cron Parser</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Analyse et prévisualise localement une expression Unix à cinq champs. Aucune donnée n’est envoyée.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Expression Cron"
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          placeholder="*/15 * * * *"
          className="font-mono"
          aria-label="Expression Cron"
        />
        <Input
          label="Fuseau horaire IANA"
          value={timeZone}
          onChange={(event) => setTimeZone(event.target.value)}
          placeholder="Europe/Paris"
          aria-label="Fuseau horaire IANA"
        />
      </div>
      {result.valid ? (
        <section className="space-y-4">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-sm font-semibold">Explication</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{result.explanation}</p>
          </div>
          {result.warnings.length > 0 && (
            <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
              {result.warnings.join(' ')}
            </p>
          )}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Prochaines occurrences (maximum 5) — {result.timeZone}</h3>
            {result.nextRuns.length > 0 ? (
              <ol className="space-y-2">
                {result.nextRuns.map((run) => (
                  <li key={run} className="rounded-md bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
                    <time dateTime={run} className="font-mono">{run}</time>
                    {localFormatter && <span className="ms-2 text-zinc-500">({localFormatter.format(new Date(run))})</span>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-zinc-500">Aucune occurrence dans l’horizon de prévisualisation.</p>
            )}
          </div>
        </section>
      ) : (
        <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
          <h3 className="font-semibold">Expression ou fuseau invalide</h3>
          <ul className="mt-1 list-inside list-disc">{result.errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}
      <aside className="space-y-1 border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <p>Dialecte pris en charge : cinq champs numériques minute, heure, jour du mois, mois, jour de semaine; *, listes, plages et pas. Pas de secondes, noms, alias spéciaux ni année. Si jour du mois et jour de semaine sont restreints, ils sont combinés avec OU; sinon le champ * laisse l’autre déterminer le jour. 0 et 7 désignent dimanche. L’aperçu cherche jusqu’à cinq occurrences sur 25 ans; une expression valide peut ne produire aucune occurrence dans cet horizon.</p>
        <p>Transitions DST dans cette prévisualisation : les heures locales inexistantes sont sautées; une heure ambiguë peut apparaître deux fois. Les planificateurs réels peuvent appliquer des règles différentes.</p>
      </aside>
    </Card>
  );
};
