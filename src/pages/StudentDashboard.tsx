import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useSubjects, useChapters, useLessons, useOlympiads } from '../hooks/useEntities';
import { useStudentDashboard } from '../hooks/useDashboard';
import { SiteHeader } from '../components/layout/SiteHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import { formatDuration } from '../lib/format';

export function StudentDashboard() {
  const { user } = useAuthContext();
  const { data: stats } = useStudentDashboard();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: olympiads } = useOlympiads();

  const primarySubject = subjects?.[0];
  const { data: chapters } = useChapters(
    primarySubject ? { subjectId: primarySubject.id } : undefined,
  );
  const firstChapter = chapters?.[0];
  const { data: lessons } = useLessons(firstChapter ? { chapterId: firstChapter.id } : undefined);
  const firstLesson = lessons?.[0];

  const featuredOlympiad = olympiads?.find((o) => o.status === 'REGISTRATION_OPEN') ?? olympiads?.[0];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex gap-8">
          <StudentSidebar />

          <div className="min-w-0 flex-1 space-y-8">
            {/* Greeting */}
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Good morning, {user.profile.firstName}!
              </h1>
              <p className="text-sm text-slate-500">Your path to academic mastery starts here.</p>
            </div>

            {/* Academic Performance Snapshot */}
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                Academic Performance Snapshot
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  icon="📝"
                  label="Tests Taken"
                  value={stats ? String(stats.testsTaken) : '—'}
                />
                <StatCard
                  icon="📈"
                  label="Latest Score"
                  value={
                    stats?.latestTest?.score != null ? `${stats.latestTest.score}` : 'No tests yet'
                  }
                  sub={stats?.latestTest?.test.title}
                />
                <div className="rounded-xl bg-blue-600 p-5 text-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
                      {stats?.activeSubscription ? 'Active' : 'Free Plan'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold">
                    {stats?.activeSubscription ? stats.activeSubscription.plan : 'Upgrade Available'}
                  </p>
                  <p className="mt-1 text-xs text-blue-100">
                    {stats?.activeSubscription
                      ? `Valid until ${new Date(stats.activeSubscription.expiresAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
                      : 'Unlock the full 2026 syllabus'}
                  </p>
                  {!stats?.activeSubscription && (
                    <Link
                      to="/subscriptions"
                      className="mt-3 inline-block text-xs font-semibold text-white underline underline-offset-2"
                    >
                      View Plans →
                    </Link>
                  )}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                {/* Continue Learning */}
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                    <span>⏱</span> Continue Learning
                  </h2>

                  {subjectsLoading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                      Loading your courses…
                    </div>
                  )}

                  {!subjectsLoading && primarySubject && firstChapter && firstLesson && (
                    <Link
                      to={`/lessons/${firstLesson.id}`}
                      className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md sm:flex-row"
                    >
                      <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 sm:h-auto sm:w-56">
                        <span className="text-4xl">🎬</span>
                      </div>
                      <div className="flex-1 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          {primarySubject.name} · {firstChapter.title}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-slate-900">{firstLesson.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDuration(firstLesson.duration)} left
                        </p>
                        <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-1/3 rounded-full bg-blue-600" />
                        </div>
                        <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
                          Resume Learning →
                        </span>
                      </div>
                    </Link>
                  )}

                  {!subjectsLoading && !primarySubject && (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
                      <p className="text-sm text-slate-500">
                        No subjects available yet. Check back once your courses are published.
                      </p>
                    </div>
                  )}
                </section>

                {/* Subjects grid */}
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Your Subjects</h2>
                    <Link to="/subjects" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(subjects ?? []).slice(0, 4).map((subject) => (
                      <Link
                        key={subject.id}
                        to={`/subjects/${subject.slug}`}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                          🏛️
                        </div>
                        <h3 className="mt-3 font-bold text-slate-900">{subject.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{subject.description}</p>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Latest Activity */}
                {stats?.latestTest && (
                  <section>
                    <h2 className="mb-4 text-lg font-bold text-slate-900">Latest Activity</h2>
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg">
                          📝
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {stats.latestTest.test.title}{' '}
                            <span className="ml-1 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                              {stats.latestTest.status}
                            </span>
                          </p>
                          {stats.latestTest.submittedAt && (
                            <p className="text-xs text-slate-500">
                              Completed on{' '}
                              {new Date(stats.latestTest.submittedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      {stats.latestTest.score != null && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Final Score</p>
                          <p className="text-lg font-bold text-slate-900">{stats.latestTest.score}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar column */}
              <aside className="space-y-6">
                {featuredOlympiad && (
                  <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-50">
                      ✨ {featuredOlympiad.status.replace('_', ' ')}
                    </p>
                    <p className="mt-2 text-base font-bold">{featuredOlympiad.title}</p>
                    <p className="mt-2 text-xs text-amber-50">
                      Compete nationally and win recognition. Registration fee ₹{featuredOlympiad.registrationFee}.
                    </p>
                    <Link
                      to={`/olympiads/${featuredOlympiad.id}`}
                      className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50"
                    >
                      Register Now →
                    </Link>
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">💡 Study Tip of the Day</h3>
                  <p className="mt-2 text-xs italic text-slate-600">
                    "Active recall is twice as effective as passive reading. Try summarizing a
                    chapter in your own words before your next quiz."
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-base">
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {sub && <p className="mt-0.5 truncate text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
