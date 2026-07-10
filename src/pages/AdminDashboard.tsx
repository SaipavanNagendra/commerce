import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../hooks/useEntities';
import { useChapters } from '../hooks/useEntities';
import { useLessons } from '../hooks/useEntities';
import { useQuestions } from '../hooks/useEntities';
import { useTests } from '../hooks/useEntities';
import { useOlympiads } from '../hooks/useEntities';
import { useSchools } from '../hooks/useEntities';
import { AdminNav } from '../components/AdminNav';

export function AdminDashboard() {
  const navigate = useNavigate();

  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: chapters, isLoading: chaptersLoading } = useChapters();
  const { data: lessons, isLoading: lessonsLoading } = useLessons();
  const { data: questions, isLoading: questionsLoading } = useQuestions();
  const { data: tests, isLoading: testsLoading } = useTests();
  const { data: olympiads, isLoading: olympiadsLoading } = useOlympiads();
  const { data: schools, isLoading: schoolsLoading } = useSchools();

  const isLoading =
    subjectsLoading ||
    chaptersLoading ||
    lessonsLoading ||
    questionsLoading ||
    testsLoading ||
    olympiadsLoading ||
    schoolsLoading;

  const stats = [
    {
      icon: '📚',
      label: 'Subjects',
      count: subjects?.length || 0,
      onClick: () => navigate('/admin/subjects'),
      color: 'bg-blue-50 text-blue-700',
    },
    {
      icon: '📖',
      label: 'Chapters',
      count: chapters?.length || 0,
      onClick: () => navigate('/admin/chapters'),
      color: 'bg-purple-50 text-purple-700',
    },
    {
      icon: '🎬',
      label: 'Lessons',
      count: lessons?.length || 0,
      onClick: () => navigate('/admin/lessons'),
      color: 'bg-pink-50 text-pink-700',
    },
    {
      icon: '❓',
      label: 'Questions',
      count: questions?.length || 0,
      onClick: () => navigate('/admin/questions'),
      color: 'bg-green-50 text-green-700',
    },
    {
      icon: '✏️',
      label: 'Tests',
      count: tests?.length || 0,
      onClick: () => navigate('/admin/tests'),
      color: 'bg-orange-50 text-orange-700',
    },
    {
      icon: '🏆',
      label: 'Olympiads',
      count: olympiads?.length || 0,
      onClick: () => navigate('/admin/olympiads'),
      color: 'bg-red-50 text-red-700',
    },
    {
      icon: '🏫',
      label: 'Schools',
      count: schools?.length || 0,
      onClick: () => navigate('/admin/schools'),
      color: 'bg-teal-50 text-teal-700',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <p className="text-slate-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <AdminNav />

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-slate-600">Manage all CommerceEdge content and resources</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={stat.onClick}
              className={`rounded-lg p-6 transition hover:shadow-lg active:scale-95 ${stat.color} border border-current border-opacity-10`}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-sm font-medium opacity-75">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.count}</p>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              icon="➕"
              title="Create Subject"
              description="Add a new subject"
              onClick={() => navigate('/admin/subjects')}
            />
            <QuickActionCard
              icon="📝"
              title="Add Chapter"
              description="Create new chapter"
              onClick={() => navigate('/admin/chapters')}
            />
            <QuickActionCard
              icon="📹"
              title="Upload Lesson"
              description="Add video content"
              onClick={() => navigate('/admin/lessons')}
            />
            <QuickActionCard
              icon="🎯"
              title="Create Test"
              description="Build new test"
              onClick={() => navigate('/admin/tests')}
            />
          </div>
        </div>

        {/* Management Sections */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Content Management</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <ManagementCard
              title="Academic Content"
              description="Manage subjects, chapters, lessons, and notes for all classes"
              items={[
                { label: 'Subjects', count: subjects?.length || 0 },
                { label: 'Chapters', count: chapters?.length || 0 },
                { label: 'Lessons', count: lessons?.length || 0 },
              ]}
              onNavigate={() => navigate('/admin/subjects')}
              color="from-blue-500 to-cyan-500"
            />
            <ManagementCard
              title="Assessments"
              description="Create and manage tests, questions, and olympiad competitions"
              items={[
                { label: 'Questions', count: questions?.length || 0 },
                { label: 'Tests', count: tests?.length || 0 },
                { label: 'Olympiads', count: olympiads?.length || 0 },
              ]}
              onNavigate={() => navigate('/admin/questions')}
              color="from-orange-500 to-red-500"
            />
          </div>
        </div>

        {/* Other Management */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Institution Management</h2>
          <button
            onClick={() => navigate('/admin/schools')}
            className="w-full rounded-lg border-2 border-slate-200 bg-white p-6 text-left hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Schools</h3>
                <p className="text-slate-600 mt-1">Manage registered schools and institutions</p>
              </div>
              <div className="text-5xl opacity-20">🏫</div>
            </div>
            <div className="mt-4 inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
              {schools?.length || 0} schools registered
            </div>
          </button>
        </div>

        {/* Best Practices */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 mt-8">
          <h3 className="font-bold text-blue-900 mb-3">💡 Best Practices</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Create subjects before adding chapters</li>
            <li>✓ Organize chapters sequentially for better student experience</li>
            <li>✓ Upload high-quality videos for lessons (auto-optimized)</li>
            <li>✓ Create diverse questions (MCQ, Numerical, Case Study)</li>
            <li>✓ Build tests from questions in your question bank</li>
            <li>✓ Set olympiad dates well in advance for student planning</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:shadow-lg transition active:scale-95"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </button>
  );
}

function ManagementCard({
  title,
  description,
  items,
  onNavigate,
  color,
}: {
  title: string;
  description: string;
  items: { label: string; count: number }[];
  onNavigate: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onNavigate}
      className={`rounded-lg bg-gradient-to-br ${color} p-6 text-white hover:shadow-lg transition active:scale-95`}
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm opacity-90 mb-4">{description}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between text-sm">
            <span>{item.label}:</span>
            <span className="font-bold">{item.count}</span>
          </div>
        ))}
      </div>
    </button>
  );
}
