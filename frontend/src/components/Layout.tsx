import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Mic, FileText } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from '../i18n/useTranslation';

export function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const navLinks = [
    { to: '/', label: t('navVoice'), icon: Mic },
    { to: '/quotes', label: t('navQuotes'), icon: FileText },
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900 transition hover:text-slate-700"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Mic className="size-4" />
              </span>
              {t('appName')}
            </Link>
            {isAuthenticated() && (
              <nav className="flex gap-0.5" aria-label="Main">
                {navLinks.map(({ to, label, icon: Icon }) => {
                  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated() ? (
              <>
                <span className="max-w-[140px] truncate rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 sm:max-w-[200px]">
                  {user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label={t('logOut')}
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">{t('logOut')}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                >
                  {t('getStarted')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
