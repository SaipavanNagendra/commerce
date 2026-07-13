import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useLogout } from '../hooks/useAuth';

export function AdminNav() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const logoutMutation = useLogout();

  // Only show for SUPER_ADMIN or SCHOOL_ADMIN
  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'SCHOOL_ADMIN') {
    return null;
  }

  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Subjects', path: '/admin/subjects', icon: '📚' },
    { label: 'Chapters', path: '/admin/chapters', icon: '📖' },
    { label: 'Lessons', path: '/admin/lessons', icon: '🎬' },
    { label: 'Notes', path: '/admin/notes', icon: '📝' },
    { label: 'Questions', path: '/admin/questions', icon: '❓' },
    { label: 'Tests', path: '/admin/tests', icon: '✏️' },
    { label: 'Olympiads', path: '/admin/olympiads', icon: '🏆' },
    { label: 'Schools', path: '/admin/schools', icon: '🏫' },
  ];

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    window.location.replace('/login');
  }

  return (
    <div className="mb-6 border-b border-slate-200 pb-4">
      {/* Way back out of the admin panel — was previously missing entirely */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-700"
        >
          <span aria-hidden="true">←</span>
          <span>Back to site</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/settings')}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700"
          >
            Account settings
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {adminMenuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-teal-50 text-slate-700 hover:text-teal-700"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}