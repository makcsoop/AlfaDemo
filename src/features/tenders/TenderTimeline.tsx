import { Bell } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { Tender } from '@/mock/tenders';

type StageState = 'done' | 'active' | 'upcoming';

/** Таймлайн этапов тендера и сроков подачи (мок-напоминания). */
export function TenderTimeline({ tender }: { tender: Tender }) {
  const stages: { title: string; when: string; state: StageState }[] = [
    { title: 'Публикация закупки', when: `${tender.publishedDaysAgo} дн. назад`, state: 'done' },
    { title: 'Приём заявок', when: `осталось ${tender.submissionInDays} дн.`, state: 'active' },
    { title: 'Подведение итогов', when: `≈ через ${tender.submissionInDays + 5} дн.`, state: 'upcoming' },
    { title: 'Исполнение контракта', when: `${tender.durationDays} дн. на исполнение`, state: 'upcoming' },
  ];

  return (
    <Card>
      <div className="mb-4 text-sm font-semibold text-alfa-ink">Сроки и этапы</div>

      <ol className="relative space-y-4 pl-6">
        <span className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-line" aria-hidden />
        {stages.map((s) => (
          <li key={s.title} className="relative">
            <span
              className={cn(
                'absolute -left-6 top-0.5 h-4 w-4 rounded-full border-2 border-surface',
                s.state === 'done' && 'bg-risk-low',
                s.state === 'active' && 'bg-alfa-red',
                s.state === 'upcoming' && 'bg-line',
              )}
            >
              {s.state === 'active' && (
                <span className="absolute inset-0 animate-ping rounded-full bg-alfa-red/60" />
              )}
            </span>
            <div className="flex items-baseline justify-between gap-3">
              <span className={cn('text-sm font-medium', s.state === 'upcoming' ? 'text-muted' : 'text-alfa-ink')}>
                {s.title}
              </span>
              <span className={cn('shrink-0 text-xs', s.state === 'active' ? 'font-medium text-alfa-red' : 'text-muted')}>
                {s.when}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-bg px-3.5 py-2.5 text-sm text-alfa-graphite">
        <Bell className="h-4 w-4 shrink-0 text-alfa-red" />
        Напомним за 2 дня до окончания приёма заявок.
      </div>
    </Card>
  );
}
