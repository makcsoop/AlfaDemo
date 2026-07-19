import { useEffect, useState } from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import { Card, Disclaimer } from '@/shared/ui';
import { calcGuarantee } from '@/lib/guarantee';
import { GUARANTEE_DISCLAIMER } from '@/mock/guarantee';
import { isYoungNoHistory, TENDER_PROFILE, type Tender } from '@/mock/tenders';
import { useProgressStore } from '@/store/useProgressStore';
import { useTendersStore } from '@/store/useTendersStore';
import { GuaranteeCalculator } from './GuaranteeCalculator';
import { GuaranteeWizard } from './GuaranteeWizard';

/** Часть Б: блок банковской гарантии на карточке тендера с обеспечением. */
export function GuaranteeBlock({ tender }: { tender: Tender }) {
  const [contractSum, setContractSum] = useState(tender.sum);
  const [eligible, setEligible] = useState(isYoungNoHistory(TENDER_PROFILE));

  const securityPercent = tender.depositPercent / 100;
  const calc = calcGuarantee(contractSum, eligible, securityPercent, 90);

  // Отмечаем шаг пройденным, когда гарантия по этому тендеру одобрена.
  const guarantee = useTendersStore((s) => s.guarantee);
  const completeStep = useProgressStore((s) => s.complete);
  useEffect(() => {
    if (guarantee?.tenderId === tender.id && guarantee.issued) completeStep('/tenders');
  }, [guarantee, tender.id, completeStep]);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
          <ShieldCheck className="h-4 w-4" />
        </span>
        Нужна банковская гарантия
      </div>

      {/* Простое пояснение */}
      <div className="rounded-xl bg-bg p-3.5">
        <div className="flex items-center gap-1.5 text-sm font-medium text-alfa-ink">
          <HelpCircle className="h-4 w-4 text-alfa-red" />
          Что это простыми словами
        </div>
        <p className="mt-1.5 text-sm text-alfa-graphite">
          Заказчик требует обеспечение заявки — подтверждение, что вы серьёзный участник. Вместо того чтобы
          замораживать свои {formatSecurity(tender)} на спецсчёте, банк даёт гарантию: ручается за вас перед
          заказчиком. Вы платите только небольшую комиссию, а деньги остаются в обороте.
        </p>
      </div>

      {/* Калькулятор */}
      <div className="mt-5">
        <div className="mb-3 text-sm font-semibold text-alfa-ink">Экспресс-калькулятор гарантии</div>
        <GuaranteeCalculator
          calc={calc}
          contractSum={contractSum}
          onSumChange={setContractSum}
          eligible={eligible}
          onEligibleChange={setEligible}
        />
      </div>

      {/* Мастер выпуска */}
      <div className="mt-5">
        <GuaranteeWizard tender={tender} calc={calc} />
      </div>

      {/* Правовой дисклеймер */}
      <Disclaimer className="mt-4">{GUARANTEE_DISCLAIMER}</Disclaimer>
    </Card>
  );
}

function formatSecurity(tender: Tender): string {
  return `${tender.depositPercent}% суммы контракта`;
}
