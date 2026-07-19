import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { Card, Button, Stepper, Input, Badge, type Step } from '@/shared/ui';
import {
  REGISTRATION_STEPS,
  recommendForm,
  getBusinessForm,
  suggestOkved,
  type BusinessForm,
} from '@/lib/registration';
import { DEMO_BUSINESS, DEMO_OWNER } from '@/mock/business';
import { useActivationStore } from '@/store/useActivationStore';
import { FormChooser } from './FormChooser';

const STEPS: Step[] = REGISTRATION_STEPS.map((s) => ({ id: s.id, title: s.title, description: s.description }));

/** Мастер мок-регистрации: форма → данные → ОКВЭД → подпись → готово. */
export function RegistrationWizard({ onDone }: { onDone: () => void }) {
  const register = useActivationStore((s) => s.register);
  const storedForm = useActivationStore((s) => s.form);

  const recommendation = useMemo(() => recommendForm(DEMO_BUSINESS), []);
  const okved = useMemo(() => suggestOkved(DEMO_BUSINESS.category), []);

  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState<BusinessForm | null>(storedForm ?? recommendation.form);
  const [signing, setSigning] = useState(false);

  const canNext = stepIdx !== 0 || form !== null;

  const next = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIdx((i) => Math.max(i - 1, 0));

  const doSign = () => {
    if (!form) return;
    setSigning(true);
    // Имитация подписания ЭЦП / подтверждения по СМС.
    setTimeout(() => {
      register(form);
      setSigning(false);
      setStepIdx(4);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <Card>
        <Stepper steps={STEPS} current={stepIdx} completed={STEPS.slice(0, stepIdx).map((s) => s.id)} />
      </Card>

      {/* Шаг 1: форма бизнеса */}
      {stepIdx === 0 && (
        <FormChooser value={form} onChange={setForm} recommendation={recommendation} />
      )}

      {/* Шаг 2: данные предпринимателя */}
      {stepIdx === 1 && (
        <Card>
          <div className="mb-4 text-sm font-medium text-alfa-graphite">Данные предпринимателя</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="ФИО" defaultValue={DEMO_OWNER.name} readOnly />
            <Input label="Дата рождения" defaultValue={DEMO_OWNER.birthDate} readOnly />
            <Input label="ИНН" defaultValue={DEMO_OWNER.inn} readOnly />
            <Input label="Город регистрации" defaultValue={DEMO_BUSINESS.city} readOnly />
          </div>
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3.5 py-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-risk-low" />
            <p className="text-sm text-alfa-graphite">
              Данные подтянуты из профиля Альфа Онлайн. Возраст {DEMO_OWNER.age} — попадаете под программу
              для предпринимателей до 25.
            </p>
          </div>
        </Card>
      )}

      {/* Шаг 3: вид деятельности */}
      {stepIdx === 2 && (
        <Card>
          <div className="mb-4 text-sm font-medium text-alfa-graphite">Вид деятельности (ОКВЭД)</div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-bg/60 px-4 py-3">
            <Badge tone="red" size="md">{okved.code}</Badge>
            <span className="text-[15px] text-alfa-ink">{okved.label}</span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Основной код подобран по категории «{DEMO_BUSINESS.category}». Дополнительные коды можно
            добавить позже — на запуск это не влияет.
          </p>
        </Card>
      )}

      {/* Шаг 4: подписание */}
      {stepIdx === 3 && (
        <Card>
          <div className="mb-4 text-sm font-medium text-alfa-graphite">Подписание заявления</div>
          <div className="rounded-xl border border-line bg-bg/60 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Форма бизнеса</span>
              <span className="font-medium text-alfa-ink">{form ? getBusinessForm(form).name : '—'}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted">Заявитель</span>
              <span className="font-medium text-alfa-ink">{DEMO_OWNER.name}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted">Госпошлина</span>
              <span className="font-medium text-risk-low">0 ₽ — онлайн</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">
            Заявление формируется автоматически. Подпишите мок-ЭЦП — в демо реальная подача не выполняется.
          </p>
          <Button className="mt-4 w-full sm:w-auto" onClick={doSign} loading={signing} disabled={signing}>
            {signing ? 'Подписываем…' : 'Подписать и отправить'}
            {!signing && <ShieldCheck className="h-4 w-4" />}
          </Button>
        </Card>
      )}

      {/* Шаг 5: готово */}
      {stepIdx === 4 && (
        <Card className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-risk-low">
            <Check className="h-8 w-8" strokeWidth={2.4} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-alfa-ink">Бизнес зарегистрирован</h2>
          <p className="mx-auto mt-1.5 max-w-md text-[15px] text-muted">
            «{DEMO_BUSINESS.name}» оформлена как {form ? getBusinessForm(form).name : 'ИП'}. Расчётный счёт
            открыт. Осталось собрать стартовый пакет и включить нужные сервисы.
          </p>
          <Button className="mt-5 w-full sm:w-auto" onClick={onDone}>
            Собрать стартовый пакет
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      )}

      {/* Навигация (кроме экрана подписания и финала) */}
      {stepIdx < 3 && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={stepIdx === 0}>
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          <Button onClick={next} disabled={!canNext}>
            Далее
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      {stepIdx === 3 && (
        <div className="flex items-center">
          <Button variant="ghost" onClick={back} disabled={signing}>
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
        </div>
      )}
    </div>
  );
}
