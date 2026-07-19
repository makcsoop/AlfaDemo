import { useEffect, useState, type ReactNode } from 'react';
import { Sparkles, ShieldCheck, FileSearch } from 'lucide-react';
import { PageHeader } from '@/features/_shared/PageHeader';
import { useProgressStore } from '@/store/useProgressStore';
import { TenderList } from './TenderList';
import { TenderDetail } from './TenderDetail';

export function TendersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const completeStep = useProgressStore((s) => s.complete);

  useEffect(() => {
    completeStep('/tenders');
  }, [completeStep]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Блок 3 · Модуль «Нейроофис»"
        title="Гарант для старта"
        description="AI-помощник «Тендер-старт» подбирает госзакупки под ваш профиль, а льготная банковская гарантия помогает войти в первый тендер новичку без кредитной истории."
        badge="Тендеры + гарантия"
      />

      {selectedId ? (
        <TenderDetail tenderId={selectedId} onBack={() => setSelectedId(null)} />
      ) : (
        <div className="space-y-5">
          {/* Два продукта в связке */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ProductPitch
              icon={<FileSearch className="h-5 w-5" />}
              title="Тендер-старт"
              text="Подбор закупок с матч-скором, проверка соответствия, сбор пакета документов и сроки."
            />
            <ProductPitch
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Льготная гарантия"
              text="Упрощённая банковская гарантия по субсидированной ставке для новичков до 25 без кредитной истории."
              accent
            />
          </div>

          <TenderList onOpen={setSelectedId} />
        </div>
      )}
    </div>
  );
}

function ProductPitch({
  icon,
  title,
  text,
  accent,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-alfa-red-50 text-alfa-red">
        {icon}
      </span>
      <div>
        <div className="flex items-center gap-1.5 text-[15px] font-semibold text-alfa-ink">
          {title}
          {accent && <Sparkles className="h-3.5 w-3.5 text-alfa-red" />}
        </div>
        <p className="mt-0.5 text-sm text-muted">{text}</p>
      </div>
    </div>
  );
}
