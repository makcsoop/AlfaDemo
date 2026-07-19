import { FileText, Check, Upload } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { useTendersStore } from '@/store/useTendersStore';

/** Мастер сбора пакета документов: загрузка-заглушка, статусы «готово/нужно». */
export function DocumentWizard({ tenderId, documents }: { tenderId: string; documents: string[] }) {
  const ready = useTendersStore((s) => s.readyDocs[tenderId] ?? []);
  const toggleDoc = useTendersStore((s) => s.toggleDoc);

  const readyCount = documents.filter((d) => ready.includes(d)).length;
  const progress = Math.round((readyCount / documents.length) * 100);
  const allReady = readyCount === documents.length;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-alfa-ink">Пакет документов</div>
        <span className="text-sm text-muted">
          {readyCount} / {documents.length}
        </span>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-bg">
        <div
          className={cn('h-full rounded-full transition-all', allReady ? 'bg-risk-low' : 'bg-alfa-red')}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {documents.map((doc) => {
          const isReady = ready.includes(doc);
          return (
            <div
              key={doc}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors',
                isReady ? 'border-emerald-100 bg-emerald-50/50' : 'border-line bg-surface',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  isReady ? 'bg-risk-low text-white' : 'bg-bg text-muted',
                )}
              >
                {isReady ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-alfa-ink">{doc}</div>
                <div className={cn('text-xs', isReady ? 'text-risk-low' : 'text-muted')}>
                  {isReady ? 'Готово' : 'Нужно загрузить'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleDoc(tenderId, doc)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isReady
                    ? 'text-muted hover:text-alfa-red'
                    : 'bg-alfa-red-50 text-alfa-red hover:bg-alfa-red-100',
                )}
              >
                {isReady ? (
                  'Убрать'
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Загрузить
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {allReady && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-risk-low">
          <Check className="h-4 w-4" />
          Пакет собран — можно подавать заявку.
        </div>
      )}
    </Card>
  );
}
