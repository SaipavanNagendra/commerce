import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/subjects', label: 'My Courses', icon: CoursesIcon },
  { to: '/practice', label: 'Practice', icon: PracticeIcon },
  { to: '/reports', label: 'Reports', icon: ReportsIcon },
  { to: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuthContext();

  return (
    <div className="space-y-6">
      {user && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {user.profile.firstName[0]}
            {user.profile.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              Welcome back<br />
              {user.profile.firstName}
            </p>
            <p className="text-xs text-slate-500">
              {user.profile.classLevel === 'CLASS_12' ? 'Class 12' : 'Class 11'} Commerce
            </p>
          </div>
        </div>
      )}

      <nav className="space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-bold text-slate-900">PRO ACCESS</p>
        <p className="mt-1 text-xs text-slate-600">
          Unlock full 2024 syllabus content.
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
}

export function StudentSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto bg-slate-50 p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

function iconProps() {
  return {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function DashboardIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function CoursesIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l2.5 2.5" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}