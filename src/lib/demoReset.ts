import { useProgressStore } from '@/store/useProgressStore';
import { useActivationStore } from '@/store/useActivationStore';
import { useStorefrontStore } from '@/store/useStorefrontStore';
import { usePocketAdminStore } from '@/store/usePocketAdminStore';
import { useTendersStore } from '@/store/useTendersStore';

/**
 * «Пройти демо заново»: сброс всего пути к пресету персоны «Кофейня Анны».
 *
 * Возвращает к исходному состоянию показа: прогресс пуст, бизнес не
 * зарегистрирован, блоки закрыты, карточка витрины/записи/платежи — сид-данные.
 * Сбрасываем через actions сторов (а не удалением ключей localStorage), чтобы
 * подписанные компоненты обновились мгновенно, без перезагрузки страницы.
 * Режим Live/Демо намеренно не трогаем — его выбирает докладчик.
 */
export function resetDemo(): void {
  useProgressStore.getState().reset();
  useActivationStore.getState().resetActivation();
  useStorefrontStore.getState().reset();
  usePocketAdminStore.getState().reset();
  useTendersStore.getState().resetAll();
}
