import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

/**
 * Каркас приложения: сайдбар слева (≥lg), шапка сверху, контент через <Outlet />.
 * На планшете/узких окнах сайдбар скрыт — навигацию даёт горизонтальная лента MobileNav.
 */
export function AppLayout() {
  return (
    <div className="flex h-full min-h-screen bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <MobileNav />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
