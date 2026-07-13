import { useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useLogout } from '../../hooks/useAuth';
import { useNotifications, useMarkNotificationRead } from '../../hooks/useNotifications';
import { initials, resolveAvatarUrl } from '../../lib/format';

function Logo() {
  return (
    <Link to="/subjects" className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-blue-600">
        <path
          d="M4 19V9m6 10V4m6 15v-7m6 7V11"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xl font-bold text-blue-700">CommerceEdge</span>
    </Link>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
  }`;

export function SiteHeader() {
  const { user, isAuthenticated } = useAuthContext();
  const avatarUrl = resolveAvatarUrl(user?.profile.avatarPath);
  const logoutMutation = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover-triggered, not click/tap. A short delay on leave stops it from
  // vanishing the instant the mouse crosses the small gap between the
  // avatar and the popup below it.
  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setMenuOpen(false), 150);
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    setMenuOpen(false);
    // Blank the page before navigating so bfcache (if any) saves
    // a blank snapshot, not one showing the user's credentials.
    document.body.style.visibility = 'hidden';
    // replace() removes the current page from browser history —
    // pressing Back can no longer reach the dashboard.
    window.location.replace('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-7 sm:flex">
            <NavLink to="/subjects" className={navLinkClass}>
              Subjects
            </NavLink>
            <NavLink to="/tests" className={navLinkClass}>
              Tests
            </NavLink>
            <NavLink to="/olympiads" className={navLinkClass}>
              Olympiads
            </NavLink>
          </nav>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>

            <NotificationBell />

            <div
              className="relative"
              ref={menuRef}
              onMouseEnter={openMenu}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
                title="Account"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${user.profile.firstName}'s avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(user.profile.firstName, user.profile.lastName)
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${user.profile.firstName}'s avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials(user.profile.firstName, user.profile.lastName)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.profile.firstName} {user.profile.lastName}
                      </p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Account settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data } = useNotifications({ take: 8 });
  const markRead = useMarkNotificationRead();

  const unreadCount = (data?.notifications ?? []).filter((n) => !n.isRead).length;

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <Link
        to="/notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
        title="Notifications"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <p className="text-sm font-bold text-slate-900">Notifications</p>
            <Link to="/notifications" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {(data?.notifications ?? []).length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</p>
            )}
            {(data?.notifications ?? []).map((n) => (
              <button
                key={n.id}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
                className={`block w-full border-b border-slate-50 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50/40' : ''
                  }`}
              >
                <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.body}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
