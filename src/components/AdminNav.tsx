import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export function AdminNav() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

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

  return (
    <nav className="flex flex-wrap gap-2 pb-4 border-b border-slate-200 mb-6">
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
  );
}
