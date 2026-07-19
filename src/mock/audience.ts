import {
  Briefcase,
  Baby,
  GraduationCap,
  Coffee,
  Dumbbell,
  Home,
  Laptop,
  type LucideIcon,
} from 'lucide-react';

/**
 * Мок «Альфа Пульс рынка» для Блока 2 «Локальная витрина».
 *
 * Обезличенные портреты аудитории района, каталог интересов, клиентские персоны
 * для превью «глазами клиента», карточки соседних бизнесов и лента показов.
 * Всё офлайн и детерминированно — источник правды для витрины и метрик охвата.
 */

// ── Интересы (каталог таргетинга) ────────────────────────────────────

export interface Interest {
  id: string;
  label: string;
}

export const INTERESTS: Interest[] = [
  { id: 'coffee', label: 'Кофе' },
  { id: 'breakfast', label: 'Завтраки' },
  { id: 'laptop', label: 'Работа с ноутбуком' },
  { id: 'healthy', label: 'ЗОЖ' },
  { id: 'desserts', label: 'Десерты' },
  { id: 'delivery', label: 'Доставка' },
  { id: 'takeaway', label: 'Кофе навынос' },
  { id: 'meetings', label: 'Встречи' },
];

export const interestLabel = (id: string) => INTERESTS.find((i) => i.id === id)?.label ?? id;

// ── Сегменты аудитории района (портреты + размеры) ───────────────────

export interface AudienceSegment {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Короткий портрет. */
  portrait: string;
  /** Размер сегмента в радиусе 2 км (базовый охват). */
  size: number;
  /** Средние траты в категории «кофе/завтраки», ₽/мес. */
  avgSpend: number;
  /** Интересы сегмента. */
  interests: string[];
  /** Релевантность нише «кофейня» (0..1) — влияет на CTR. */
  affinity: number;
}

/** Портреты аудитории спального района у бизнес-центра (данные «Альфа Пульс»). */
export const AUDIENCE_SEGMENTS: AudienceSegment[] = [
  {
    id: 'office',
    label: 'Офисные сотрудники',
    icon: Briefcase,
    portrait: 'Работают в БЦ рядом, берут кофе утром и на обеде',
    size: 3200,
    avgSpend: 3600,
    interests: ['coffee', 'takeaway', 'breakfast', 'meetings'],
    affinity: 0.9,
  },
  {
    id: 'coffee-lovers',
    label: 'Любители кофе',
    icon: Coffee,
    portrait: 'Ценят спешелти, готовы платить за качество зерна',
    size: 1800,
    avgSpend: 4800,
    interests: ['coffee', 'desserts', 'takeaway'],
    affinity: 1,
  },
  {
    id: 'freelancers',
    label: 'Фрилансеры и удалёнщики',
    icon: Laptop,
    portrait: 'Работают из кофеен днём, сидят по 2–3 часа',
    size: 900,
    avgSpend: 4200,
    interests: ['coffee', 'laptop', 'breakfast'],
    affinity: 0.85,
  },
  {
    id: 'parents',
    label: 'Молодые родители',
    icon: Baby,
    portrait: 'Гуляют с детьми, любят завтраки и десерты навынос',
    size: 2100,
    avgSpend: 2600,
    interests: ['breakfast', 'desserts', 'delivery'],
    affinity: 0.55,
  },
  {
    id: 'students',
    label: 'Студенты',
    icon: GraduationCap,
    portrait: 'Чувствительны к цене, берут кофе между парами',
    size: 1500,
    avgSpend: 1600,
    interests: ['coffee', 'takeaway'],
    affinity: 0.6,
  },
  {
    id: 'fitness',
    label: 'ЗОЖ-аудитория',
    icon: Dumbbell,
    portrait: 'Ходят в студию рядом, берут смузи и урбеч-завтраки',
    size: 1200,
    avgSpend: 3400,
    interests: ['healthy', 'breakfast', 'coffee'],
    affinity: 0.5,
  },
  {
    id: 'locals',
    label: 'Жители района',
    icon: Home,
    portrait: 'Живут в соседних домах, заходят по пути',
    size: 8600,
    avgSpend: 2200,
    interests: ['coffee', 'breakfast', 'delivery', 'desserts'],
    affinity: 0.65,
  },
];

export const getSegment = (id: string) => AUDIENCE_SEGMENTS.find((s) => s.id === id);

// ── «Альфа Пульс рынка»: сводка по тратам района ─────────────────────

export const ALFA_PULSE = {
  category: 'Кофейни и завтраки',
  district: 'Спальный район, Казань',
  avgSpend: 3200,
  spendMin: 1500,
  spendMax: 6000,
  trend: '+12% к тратам на кофе за год',
  note: 'Обезличенные траты клиентов Альфа-Банка в радиусе района',
} as const;

// ── Клиентские персоны для превью «глазами клиента» ──────────────────

export interface ClientPersona {
  id: string;
  name: string;
  age: number;
  segmentId: string;
  tagline: string;
  interests: string[];
  monthlySpend: number;
  /** Причина, по которой карточка релевантна (для плашки «подобрано»). */
  reason: string;
  initials: string;
}

export const CLIENT_PERSONAS: ClientPersona[] = [
  {
    id: 'maxim',
    name: 'Максим',
    age: 28,
    segmentId: 'freelancers',
    tagline: 'IT, работает из кофеен',
    interests: ['coffee', 'laptop', 'takeaway'],
    monthlySpend: 4800,
    reason: 'Вы часто берёте кофе рядом и работаете из кафе',
    initials: 'М',
  },
  {
    id: 'olga',
    name: 'Ольга',
    age: 34,
    segmentId: 'parents',
    tagline: 'В декрете, гуляет с ребёнком',
    interests: ['breakfast', 'desserts', 'delivery'],
    monthlySpend: 2600,
    reason: 'Вам нравятся завтраки и десерты навынос неподалёку',
    initials: 'О',
  },
  {
    id: 'timur',
    name: 'Тимур',
    age: 22,
    segmentId: 'students',
    tagline: 'Студент, живёт рядом',
    interests: ['coffee', 'takeaway'],
    monthlySpend: 1600,
    reason: 'Вы берёте кофе навынос по пути на учёбу',
    initials: 'Т',
  },
]

// ── Карточки соседних бизнесов (лента «Рядом с вами») ────────────────

/** Категории ленты «Рядом с вами» (чипы под поиском). */
export type FeedCategory = 'coffee' | 'food' | 'beauty' | 'flowers' | 'services';

export const FEED_CATEGORIES: { id: FeedCategory; label: string }[] = [
  { id: 'coffee', label: 'Кофе' },
  { id: 'food', label: 'Еда' },
  { id: 'beauty', label: 'Красота' },
  { id: 'flowers', label: 'Цветы' },
  { id: 'services', label: 'Услуги' },
];

export interface NearbyBusiness {
  id: string;
  name: string;
  nicheLabel: string;
  category: FeedCategory;
  tone: string;
  emoji: string;
  distanceM: number;
  rating: number;
  reviews: number;
  tag: string;
  offer: string;
}

/** Соседние бизнесы района — контекст витрины «Рядом с вами». */
export const NEARBY_BUSINESSES: NearbyBusiness[] = [
  {
    id: 'bakery',
    name: 'Пекарня №1',
    nicheLabel: 'Пекарня',
    category: 'food',
    tone: 'amber',
    emoji: '🥐',
    distanceM: 180,
    rating: 4.7,
    reviews: 214,
    tag: 'Свежая выпечка',
    offer: 'Круассан в подарок к кофе',
  },
  {
    id: 'espresso',
    name: 'Эспрессо-бар «Обжарка»',
    nicheLabel: 'Кофейня',
    category: 'coffee',
    tone: 'rose',
    emoji: '☕',
    distanceM: 260,
    rating: 4.5,
    reviews: 158,
    tag: 'Спешелти',
    offer: '−15% на фильтр по будням',
  },
  {
    id: 'salon',
    name: 'Салон «Локон»',
    nicheLabel: 'Барбершоп',
    category: 'beauty',
    tone: 'violet',
    emoji: '💈',
    distanceM: 320,
    rating: 4.8,
    reviews: 96,
    tag: 'Запись онлайн',
    offer: 'Стрижка + борода со скидкой',
  },
  {
    id: 'flowers',
    name: 'Цветы у дома',
    nicheLabel: 'Цветы',
    category: 'flowers',
    tone: 'emerald',
    emoji: '💐',
    distanceM: 410,
    rating: 4.6,
    reviews: 73,
    tag: 'Букет за 15 мин',
    offer: 'Доставка по району бесплатно',
  },
  {
    id: 'cleaning',
    name: 'Химчистка Fresh',
    nicheLabel: 'Услуги',
    category: 'services',
    tone: 'sky',
    emoji: '🧺',
    distanceM: 480,
    rating: 4.4,
    reviews: 51,
    tag: 'За 24 часа',
    offer: '−20% на первый заказ',
  },
];

// ── Лента показов (обезличенный лог) ─────────────────────────────────

export interface ImpressionEvent {
  id: string;
  segmentId: string;
  kind: 'view' | 'click';
  /** Секунд назад на момент старта. */
  secondsAgo: number;
}

export const IMPRESSION_LOG_SEED: ImpressionEvent[] = [
  { id: 'e1', segmentId: 'office', kind: 'click', secondsAgo: 12 },
  { id: 'e2', segmentId: 'coffee-lovers', kind: 'view', secondsAgo: 34 },
  { id: 'e3', segmentId: 'locals', kind: 'view', secondsAgo: 58 },
  { id: 'e4', segmentId: 'freelancers', kind: 'click', secondsAgo: 96 },
  { id: 'e5', segmentId: 'office', kind: 'view', secondsAgo: 140 },
];
