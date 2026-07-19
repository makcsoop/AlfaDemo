/**
 * Мок-каталог тендеров/госзаказов для Блока 3 «Гарант для старта» (часть А).
 *
 * 8 закупок разной релевантности + профиль бизнеса и правила соответствия
 * (оборот, ОКВЭД, опыт, регион). Всё офлайн и детерминированно — источник
 * правды для matchTenders() (src/lib/matchTenders.ts) и экрана тендеров.
 */

export type TenderLaw = '44-ФЗ' | '223-ФЗ';

export interface Tender {
  id: string;
  title: string;
  customer: string;
  region: string;
  law: TenderLaw;
  /** НМЦК — начальная цена контракта, ₽. */
  sum: number;
  /** Требуемые коды ОКВЭД (достаточно одного пересечения). */
  okved: string[];
  category: string;
  /** Правила соответствия. */
  minAnnualTurnover: number;
  minExperienceMonths: number;
  /** Обеспечение заявки. */
  requiresDeposit: boolean;
  depositPercent: number;
  /** Сроки. */
  publishedDaysAgo: number;
  submissionInDays: number;
  durationDays: number;
  /** Необходимые документы (чек-лист пакета). */
  documents: string[];
  description: string;
}

/**
 * Профиль предпринимателя для подбора. Собран «из профиля бизнеса и данных Альфа»:
 * молодой новичок без кредитной истории (ключевая аудитория «Гаранта для старта»).
 */
export interface TenderProfile {
  businessName: string;
  region: string;
  okved: string[];
  annualTurnover: number;
  experienceMonths: number;
  category: string;
  founderAge: number;
  hasCreditHistory: boolean;
}

/** Профиль «Кофейни Анны»: новый бизнес в Казани, основатель 24, без КИ. */
export const TENDER_PROFILE: TenderProfile = {
  businessName: 'Кофейня Анны',
  region: 'Казань',
  okved: ['56.10', '56.30'],
  annualTurnover: 1_800_000,
  experienceMonths: 4,
  category: 'Кофейня / общепит',
  founderAge: 24,
  hasCreditHistory: false,
};

/** Признак «новичок до 25 без кредитной истории» — гейт льготной гарантии. */
export function isYoungNoHistory(profile: TenderProfile): boolean {
  return profile.founderAge <= 25 && !profile.hasCreditHistory;
}

const BASE_DOCS = ['Заявка на участие', 'Лист записи ЕГРИП', 'Декларация соответствия 44-ФЗ', 'Ценовое предложение'];

export const TENDERS: Tender[] = [
  {
    id: 'coffee-admin',
    title: 'Кофе-брейки для мероприятий администрации района',
    customer: 'Администрация Советского района, Казань',
    region: 'Казань',
    law: '44-ФЗ',
    sum: 240_000,
    okved: ['56.10', '56.30'],
    category: 'Кофейня / общепит',
    minAnnualTurnover: 0,
    minExperienceMonths: 0,
    requiresDeposit: true,
    depositPercent: 5,
    publishedDaysAgo: 2,
    submissionInDays: 9,
    durationDays: 90,
    documents: [...BASE_DOCS, 'Обеспечение заявки (гарантия)', 'Меню и расчёт порций'],
    description:
      'Организация кофе-брейков на районных мероприятиях: кофе, чай, вода, выпечка. ' +
      'Небольшой объём, подходит начинающему поставщику из района.',
  },
  {
    id: 'festival-drinks',
    title: 'Горячие напитки на городском фестивале',
    customer: 'МКУ «Дирекция городских событий», Казань',
    region: 'Казань',
    law: '44-ФЗ',
    sum: 300_000,
    okved: ['56.10'],
    category: 'Кофейня / общепит',
    minAnnualTurnover: 0,
    minExperienceMonths: 0,
    requiresDeposit: true,
    depositPercent: 5,
    publishedDaysAgo: 5,
    submissionInDays: 4,
    durationDays: 30,
    documents: [...BASE_DOCS, 'Обеспечение заявки (гарантия)', 'Санитарные книжки персонала'],
    description:
      'Точка горячих напитков на двухдневном фестивале. Срочная подача — до окончания приёма заявок 4 дня.',
  },
  {
    id: 'coworking-coffee',
    title: 'Поставка кофе для сети коворкингов',
    customer: 'ООО «Рабочая среда» (223-ФЗ)',
    region: 'Казань',
    law: '223-ФЗ',
    sum: 180_000,
    okved: ['56.10'],
    category: 'Кофейня / общепит',
    minAnnualTurnover: 0,
    minExperienceMonths: 0,
    requiresDeposit: false,
    depositPercent: 0,
    publishedDaysAgo: 1,
    submissionInDays: 12,
    durationDays: 180,
    documents: [...BASE_DOCS, 'Прайс на зерно и расходники'],
    description:
      'Регулярная поставка зерна и напитков в коворкинги. Обеспечение заявки не требуется — хороший первый контракт без гарантии.',
  },
  {
    id: 'school-bakery',
    title: 'Поставка выпечки в школьные столовые',
    customer: 'Управление образования, Республика Татарстан',
    region: 'Татарстан',
    law: '44-ФЗ',
    sum: 420_000,
    okved: ['10.71', '56.10'],
    category: 'Пекарня / общепит',
    minAnnualTurnover: 500_000,
    minExperienceMonths: 6,
    requiresDeposit: true,
    depositPercent: 5,
    publishedDaysAgo: 3,
    submissionInDays: 11,
    durationDays: 120,
    documents: [...BASE_DOCS, 'Обеспечение заявки (гарантия)', 'Сертификаты на продукцию', 'Опыт исполненных контрактов'],
    description:
      'Ежедневная выпечка для школ района. Требуется опыт от 6 месяцев и оборот от 500 тыс. — подходит частично.',
  },
  {
    id: 'polyclinic-coffee',
    title: 'Кофейные автоматы в поликлиниках',
    customer: 'ГАУЗ «Городская поликлиника №7», Татарстан',
    region: 'Татарстан',
    law: '44-ФЗ',
    sum: 750_000,
    okved: ['56.10', '47.99'],
    category: 'Вендинг / общепит',
    minAnnualTurnover: 1_500_000,
    minExperienceMonths: 8,
    requiresDeposit: true,
    depositPercent: 5,
    publishedDaysAgo: 7,
    submissionInDays: 16,
    durationDays: 365,
    documents: [...BASE_DOCS, 'Обеспечение заявки (гарантия)', 'Паспорта оборудования', 'Опыт исполненных контрактов'],
    description:
      'Установка и обслуживание кофейных автоматов. Нужен опыт от 8 месяцев — для новичка пока рановато.',
  },
  {
    id: 'bc-catering',
    title: 'Организация питания в бизнес-центре',
    customer: 'УК «Деловой квартал» (223-ФЗ)',
    region: 'Казань',
    law: '223-ФЗ',
    sum: 1_200_000,
    okved: ['56.29', '56.10'],
    category: 'Кейтеринг / общепит',
    minAnnualTurnover: 5_000_000,
    minExperienceMonths: 12,
    requiresDeposit: true,
    depositPercent: 3,
    publishedDaysAgo: 4,
    submissionInDays: 18,
    durationDays: 365,
    documents: [...BASE_DOCS, 'Обеспечение заявки (гарантия)', 'Штатное расписание', 'Опыт исполненных контрактов'],
    description:
      'Корпоративное питание сотрудников БЦ. Крупный контракт: нужен оборот от 5 млн и год опыта.',
  },
  {
    id: 'moscow-conf',
    title: 'Кофейный кейтеринг для конференций',
    customer: 'АНО «Конгресс-центр», Москва',
    region: 'Москва',
    law: '223-ФЗ',
    sum: 900_000,
    okved: ['56.10'],
    category: 'Кейтеринг / общепит',
    minAnnualTurnover: 3_000_000,
    minExperienceMonths: 12,
    requiresDeposit: true,
    depositPercent: 5,
    publishedDaysAgo: 6,
    submissionInDays: 20,
    durationDays: 200,
    documents: [...BASE_DOCS, 'Обеспечение заявки (гарантия)', 'Опыт исполненных контрактов'],
    description:
      'Кейтеринг на конференциях в Москве. Другой регион, крупный оборот и опыт — низкая релевантность.',
  },
  {
    id: 'stationery',
    title: 'Поставка канцелярских товаров',
    customer: 'МБОУ «Гимназия №19», Казань',
    region: 'Казань',
    law: '44-ФЗ',
    sum: 260_000,
    okved: ['46.49'],
    category: 'Оптовая торговля',
    minAnnualTurnover: 0,
    minExperienceMonths: 0,
    requiresDeposit: false,
    depositPercent: 0,
    publishedDaysAgo: 8,
    submissionInDays: 10,
    durationDays: 60,
    documents: [...BASE_DOCS],
    description:
      'Поставка канцтоваров для гимназии. Не тот профиль (ОКВЭД) — показываем как нерелевантный пример.',
  },
];

export const getTender = (id: string) => TENDERS.find((t) => t.id === id);
