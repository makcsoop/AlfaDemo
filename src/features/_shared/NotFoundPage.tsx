import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState, Button } from '@/shared/ui';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={Compass}
      title="Страница не найдена"
      description="Похоже, такого раздела в Альфа-старте нет. Вернёмся на дашборд."
      action={<Button onClick={() => navigate('/dashboard')}>На дашборд</Button>}
    />
  );
}
