import { Scissors, Wrench, GraduationCap, Car, Coffee, type LucideIcon } from 'lucide-react';

/**
 * Мок-данные Блока 4 «Администратор в кармане» (мини-CRM + оплаты + деньги).
 *
 * Пресеты под ниши услуг, клиенты, записи на неделю, история платежей и
 * налоговые режимы. Всё офлайн и детерминированно. Персона по умолчанию —
 * «Кофейня Анны» (HoReCa): бронирования, кейтеринг, торты на заказ, мастер-классы.
 */

export type TaxRegimeId = 'self' | 'ip_usn' | 'ooo_usn';

export interface ServiceItem {
  name: string;
  price: number;
  durationMin: number;
}

export interface NichePreset {
  id: string;
  label: string;
  icon: LucideIcon;
  clientWord: string;
  services: ServiceItem[];
  defaultRegime: TaxRegimeId;
}

/** Преднастройки под ниши услуг. */
export const NICHE_PRESETS: NichePreset[] = [
  {
    id: 'horeca',
    label: 'Кофейня / HoReCa',
    icon: Coffee,
    clientWord: 'гость',
    defaultRegime: 'ip_usn',
    services: [
      { name: 'Кофе-брейк (кейтеринг)', price: 8000, durationMin: 120 },
      { name: 'Торт на заказ', price: 3500, durationMin: 60 },
      { name: 'Бронь зала на мероприятие', price: 6000, durationMin: 180 },
      { name: 'Мастер-класс по латте-арт', price: 2500, durationMin: 90 },
    ],
  },
  {
    id: 'beauty',
    label: 'Бьюти-мастер',
    icon: Scissors,
    clientWord: 'клиент',
    defaultRegime: 'self',
    services: [
      { name: 'Стрижка и укладка', price: 2200, durationMin: 60 },
      { name: 'Окрашивание', price: 4500, durationMin: 120 },
      { name: 'Маникюр', price: 1800, durationMin: 90 },
      { name: 'Макияж', price: 3000, durationMin: 60 },
    ],
  },
  {
    id: 'masters',
    label: 'Частный мастер',
    icon: Wrench,
    clientWord: 'заказчик',
    defaultRegime: 'self',
    services: [
      { name: 'Выезд и диагностика', price: 1500, durationMin: 60 },
      { name: 'Мелкий ремонт', price: 3000, durationMin: 120 },
      { name: 'Сборка мебели', price: 2500, durationMin: 90 },
    ],
  },
  {
    id: 'tutors',
    label: 'Репетитор',
    icon: GraduationCap,
    clientWord: 'ученик',
    defaultRegime: 'self',
    services: [
      { name: 'Занятие 60 мин', price: 1500, durationMin: 60 },
      { name: 'Занятие 90 мин', price: 2200, durationMin: 90 },
      { name: 'Пробный урок', price: 800, durationMin: 45 },
    ],
  },
  {
    id: 'autoservice',
    label: 'Автосервис',
    icon: Car,
    clientWord: 'клиент',
    defaultRegime: 'ip_usn',
    services: [
      { name: 'Замена масла', price: 2500, durationMin: 60 },
      { name: 'Шиномонтаж', price: 2000, durationMin: 45 },
      { name: 'Диагностика ходовой', price: 1800, durationMin: 90 },
    ],
  },
];

export const getPreset = (id: string) => NICHE_PRESETS.find((p) => p.id === id) ?? NICHE_PRESETS[0];

// ── Клиенты (мини-CRM) ───────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  phone: string;
  visits: number;
  totalSpent: number;
  tag: string;
  lastVisitDaysAgo: number;
}

export const CLIENTS: Client[] = [
  { id: 'c1', name: 'Марина Котова', phone: '+7 917 ••• 42 18', visits: 12, totalSpent: 42_000, tag: 'Постоянный', lastVisitDaysAgo: 3 },
  { id: 'c2', name: 'Ильдар Хайруллин', phone: '+7 927 ••• 09 71', visits: 5, totalSpent: 31_500, tag: 'Корпоратив', lastVisitDaysAgo: 8 },
  { id: 'c3', name: 'Елена Сафина', phone: '+7 919 ••• 55 03', visits: 2, totalSpent: 7_000, tag: 'Новый', lastVisitDaysAgo: 14 },
  { id: 'c4', name: 'Тимур Гараев', phone: '+7 987 ••• 21 46', visits: 8, totalSpent: 24_000, tag: 'Постоянный', lastVisitDaysAgo: 1 },
  { id: 'c5', name: 'Ольга Минина', phone: '+7 905 ••• 88 30', visits: 3, totalSpent: 12_500, tag: 'Мероприятия', lastVisitDaysAgo: 5 },
  { id: 'c6', name: 'Рустам Валиев', phone: '+7 960 ••• 17 92', visits: 1, totalSpent: 3_500, tag: 'Новый', lastVisitDaysAgo: 20 },
];

export const getClient = (id: string) => CLIENTS.find((c) => c.id === id);

// ── Записи на неделю ─────────────────────────────────────────────────

export type BookingStatus = 'new' | 'confirmed' | 'prepaid' | 'done' | 'cancelled';

export interface Booking {
  id: string;
  clientId: string;
  service: string;
  price: number;
  /** 0 = понедельник … 6 = воскресенье текущей недели. */
  dayOffset: number;
  time: string;
  durationMin: number;
  status: BookingStatus;
  prepaid: boolean;
}

export const BOOKINGS_SEED: Booking[] = [
  { id: 'b1', clientId: 'c4', service: 'Мастер-класс по латте-арт', price: 2500, dayOffset: 0, time: '11:00', durationMin: 90, status: 'prepaid', prepaid: true },
  { id: 'b2', clientId: 'c1', service: 'Торт на заказ', price: 3500, dayOffset: 0, time: '15:30', durationMin: 60, status: 'confirmed', prepaid: false },
  { id: 'b3', clientId: 'c2', service: 'Кофе-брейк (кейтеринг)', price: 8000, dayOffset: 1, time: '10:00', durationMin: 120, status: 'prepaid', prepaid: true },
  { id: 'b4', clientId: 'c5', service: 'Бронь зала на мероприятие', price: 6000, dayOffset: 2, time: '18:00', durationMin: 180, status: 'new', prepaid: false },
  { id: 'b5', clientId: 'c3', service: 'Торт на заказ', price: 3500, dayOffset: 3, time: '13:00', durationMin: 60, status: 'confirmed', prepaid: false },
  { id: 'b6', clientId: 'c6', service: 'Мастер-класс по латте-арт', price: 2500, dayOffset: 4, time: '17:00', durationMin: 90, status: 'new', prepaid: false },
  { id: 'b7', clientId: 'c1', service: 'Кофе-брейк (кейтеринг)', price: 8000, dayOffset: 5, time: '12:00', durationMin: 120, status: 'confirmed', prepaid: false },
];

// ── История платежей ─────────────────────────────────────────────────

export type PaymentMethod = 'qr' | 'link' | 'card';

export interface Payment {
  id: string;
  clientName: string;
  service: string;
  amount: number;
  method: PaymentMethod;
  daysAgo: number;
  status: 'paid';
}

export const PAYMENTS_SEED: Payment[] = [
  { id: 'p1', clientName: 'Тимур Гараев', service: 'Мастер-класс по латте-арт', amount: 2500, method: 'qr', daysAgo: 0, status: 'paid' },
  { id: 'p2', clientName: 'Ильдар Хайруллин', service: 'Кофе-брейк (кейтеринг)', amount: 8000, method: 'link', daysAgo: 1, status: 'paid' },
  { id: 'p3', clientName: 'Марина Котова', service: 'Торт на заказ', amount: 3500, method: 'qr', daysAgo: 3, status: 'paid' },
  { id: 'p4', clientName: 'Ольга Минина', service: 'Бронь зала на мероприятие', amount: 6000, method: 'card', daysAgo: 6, status: 'paid' },
  { id: 'p5', clientName: 'Елена Сафина', service: 'Торт на заказ', amount: 3500, method: 'qr', daysAgo: 9, status: 'paid' },
  { id: 'p6', clientName: 'Марина Котова', service: 'Кофе-брейк (кейтеринг)', amount: 8000, method: 'link', daysAgo: 15, status: 'paid' },
  { id: 'p7', clientName: 'Тимур Гараев', service: 'Торт на заказ', amount: 3500, method: 'qr', daysAgo: 22, status: 'paid' },
];

// ── Налоговые режимы и подсказки ─────────────────────────────────────

export interface TaxRegime {
  id: TaxRegimeId;
  label: string;
  short: string;
  /** Эффективная ставка для оценки, доля от дохода. */
  rate: number;
  rateLabel: string;
  limit: string;
  hints: string[];
}

export const TAX_REGIMES: Record<TaxRegimeId, TaxRegime> = {
  self: {
    id: 'self',
    label: 'Самозанятый (НПД)',
    short: 'Самозанятый',
    rate: 0.05,
    rateLabel: '4% с физлиц, 6% с юрлиц',
    limit: 'до 2,4 млн ₽ в год',
    hints: [
      'Без отчётности и касс — чек формируется в приложении «Мой налог».',
      'Нельзя нанимать сотрудников по трудовым договорам.',
      'Налог платится раз в месяц с фактического дохода.',
    ],
  },
  ip_usn: {
    id: 'ip_usn',
    label: 'ИП на УСН «Доходы» 6%',
    short: 'ИП · УСН 6%',
    rate: 0.06,
    rateLabel: '6% с доходов',
    limit: 'до 265,8 млн ₽ в год',
    hints: [
      'Можно нанимать сотрудников и принимать оплату по эквайрингу.',
      'Страховые взносы за себя уменьшают налог.',
      'Нужна онлайн-касса при приёме оплаты от физлиц.',
    ],
  },
  ooo_usn: {
    id: 'ooo_usn',
    label: 'ООО на УСН «Доходы−расходы» 15%',
    short: 'ООО · УСН 15%',
    rate: 0.15,
    rateLabel: '15% с прибыли',
    limit: 'до 265,8 млн ₽ в год',
    hints: [
      'Подходит при высокой доле расходов (аренда, закупка, ФОТ).',
      'Полноценный бухучёт и отчётность — обычно нужен бухгалтер.',
      'Минимальный налог — 1% с доходов, даже при убытке.',
    ],
  },
};
