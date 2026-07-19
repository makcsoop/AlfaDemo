import type { ComponentType } from 'react';
import {
  Home,
  Wallet,
  CreditCard,
  Landmark,
  PiggyBank,
  Users,
  Rocket,
  LayoutDashboard,
  Lightbulb,
  Store,
  Gavel,
  Smartphone,
  BarChart3,
  Radar,
  PackageCheck,
  Sparkles,
  type LucideProps,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<LucideProps>;
  /** Пометка для акцентных пунктов (например, флагманский демо-сценарий). */
  accent?: boolean;
}

export interface EcosystemItem {
  label: string;
  icon: ComponentType<LucideProps>;
  active?: boolean;
}

/**
 * Разделы экосистемы «Альфа Онлайн для бизнеса».
 * В демо активен только «Альфа-старт» — остальные показаны как контекст (disabled).
 */
export const ECOSYSTEM: EcosystemItem[] = [
  { label: 'Главная', icon: Home },
  { label: 'Счета и платежи', icon: Wallet },
  { label: 'Карты', icon: CreditCard },
  { label: 'Кредиты', icon: Landmark },
  { label: 'Депозиты', icon: PiggyBank },
  { label: 'Сотрудники', icon: Users },
  { label: 'Альфа-старт', icon: Rocket, active: true },
];

/** Внутренняя навигация раздела «Альфа-старт». */
export const ALFA_START_NAV: NavItem[] = [
  { label: 'Онбординг', to: '/onboarding', icon: Rocket },
  { label: 'Дашборд', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Оценка идеи', to: '/idea', icon: Lightbulb },
  { label: 'Локальная витрина', to: '/storefront', icon: Store },
  { label: 'Тендеры', to: '/tenders', icon: Gavel },
  { label: 'Администратор в кармане', to: '/admin', icon: Smartphone },
  { label: 'Аналитика МП', to: '/analytics', icon: BarChart3 },
  { label: 'Финансовый радар', to: '/radar', icon: Radar },
  { label: 'Регистрация и старт-пакет', to: '/registration', icon: PackageCheck },
];

/** Флагманский демо-сценарий — выносим отдельно и подсвечиваем. */
export const DEMO_STORY_NAV: NavItem = {
  label: 'Демо-сценарий',
  to: '/demo-story',
  icon: Sparkles,
  accent: true,
};
