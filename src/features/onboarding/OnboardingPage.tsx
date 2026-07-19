import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb, Store, Gavel, Smartphone, BarChart3, PackageCheck } from 'lucide-react';
import { PageHeader } from '@/features/_shared/PageHeader';
import { JourneyBar } from '@/features/_shared/JourneyBar';
import { Button, Card } from '@/shared/ui';
import { DEMO_BUSINESS } from '@/mock/business';
import { useProgressStore } from '@/store/useProgressStore';

const HIGHLIGHTS = [
  { icon: Lightbulb, title: 'Оценка идеи', text: 'Сценарии выручки и безопасный кредит' },
  { icon: Store, title: 'Локальная витрина', text: 'Карточка бизнеса для клиентов района' },
  { icon: Gavel, title: 'Тендеры', text: 'Подходящие закупки под ваш профиль' },
  { icon: Smartphone, title: 'Администратор в кармане', text: 'Записи клиентов и оплата по QR' },
  { icon: BarChart3, title: 'Аналитика МП', text: 'Чистая прибыль по товарам' },
  { icon: PackageCheck, title: 'Старт-пакет', text: 'Регистрация и всё для запуска' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const completeStep = useProgressStore((s) => s.complete);

  const start = () => {
    completeStep('/onboarding');
    navigate('/dashboard');
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Добро пожаловать"
        title="Альфа-старт для предпринимателей"
        description={`Проведём «${DEMO_BUSINESS.name}» от идеи до первых продаж — шаг за шагом, с аналитикой и без лишней бюрократии.`}
        actions={
          <Button onClick={start}>
            Начать
            <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      <Card className="mb-6">
        {/* Тот же компонент пути, что и на дашборде: кружки с подписями снизу —
            строка цельная, ничего не растягивается и не обрезается. */}
        <JourneyBar clickable={false} />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HIGHLIGHTS.map((h) => (
          <Card key={h.title} interactive>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-alfa-red-50 text-alfa-red">
              <h.icon className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <h3 className="mt-3.5 text-[15px] font-semibold text-alfa-ink">{h.title}</h3>
            <p className="mt-1 text-sm text-muted">{h.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
