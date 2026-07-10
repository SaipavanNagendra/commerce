import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSubjects, useChapters, useLessons, useNotes } from '../hooks/useEntities';
import { SiteHeader } from '../components/layout/SiteHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import { useAuthContext } from '../context/AuthContext';

export function SubjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthContext();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const subject = subjects?.find((s) => s.slug === slug);

  const { data: chapters, isLoading: chaptersLoading } = useChapters(
    subject ? { subjectId: subject.id } : undefined,
  );
  const { data: allLessons } = useLessons();
  const { data: allNotes } = useNotes();

  const sortedChapters = useMemo(
    () => (chapters ?? []).slice().sort((a, b) => a.order - b.order),
    [chapters],
  );

  const totalLessons = allLessons?.filter((l) =>
    sortedChapters.some((c) => c.id === l.chapterId),
  ).length ?? 0;

  if (subjectsLoading || chaptersLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <div className="mx-auto max-w-[1600px] px-6 py-16 text-center text-sm text-slate-500">
          Loading course content…
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-xl font-bold text-slate-900">Subject not found</h1>
          <p className="mt-2 text-sm text-slate-600">This subject may have been renamed or unpublished.</p>
          <Link to="/subjects" className="mt-6 inline-block text-sm font-semibold text-blue-600">
            ← Back to all subjects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex gap-8">
          {isAuthenticated && <StudentSidebar />}

          <div className="min-w-0 flex-1 space-y-8">
            {/* Breadcrumb */}
            <p className="text-sm text-slate-500">
              <Link to="/subjects" className="hover:text-slate-800">Home</Link>
              <span className="mx-1.5">›</span>
              <Link to="/subjects" className="hover:text-slate-800">Subjects</Link>
              <span className="mx-1.5">›</span>
              <span className="font-medium text-slate-800">{subject.name}</span>
            </p>

            {/* Hero */}
            <div className="flex flex-col gap-6 rounded-xl bg-blue-600 p-8 text-white shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl">
                    🏛️
                  </div>
                  <h1 className="text-2xl font-bold sm:text-3xl">{subject.name}</h1>
                </div>
                <p className="mt-3 max-w-xl text-sm text-blue-100">{subject.description}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">
                    {sortedChapters.length} Chapters
                  </span>
                  <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">
                    {totalLessons} Lessons
                  </span>
                  <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">
                    15 Mock Tests
                  </span>
                </div>
              </div>

              <div className="w-full max-w-xs rounded-xl bg-white/10 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Total Progress</span>
                  <span className="font-bold">45%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-[45%] rounded-full bg-white" />
                </div>
                <p className="mt-3 text-xs text-blue-100">Continue where you left off</p>
                {sortedChapters[0] && (
                  <Link
                    to={`/subjects/${subject.slug}#chapter-${sortedChapters[0].id}`}
                    className="mt-4 block rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Resume Learning
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Course content */}
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Course Content</h2>
                  <span className="text-xs text-slate-500">Sort by: Sequence</span>
                </div>

                {sortedChapters.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                    Chapters for this subject haven't been published yet.
                  </div>
                )}

                <div className="space-y-4">
                  {sortedChapters.map((chapter, idx) => (
                    <ChapterCard
                      key={chapter.id}
                      index={idx + 1}
                      chapter={chapter}
                      lessonsCount={allLessons?.filter((l) => l.chapterId === chapter.id).length ?? 0}
                      notesCount={allNotes?.filter((n) => n.chapterId === chapter.id).length ?? 0}
                      firstLessonId={
                        allLessons?.find((l) => l.chapterId === chapter.id)?.id
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span>🔄</span> Quick Revise
                  </h3>
                  <div className="mt-4 space-y-3">
                    <QuickReviseItem icon="🧠" title="Subject Mind Map" subtitle="Visual overview of all units" />
                    <QuickReviseItem icon="📐" title="Formula Sheet" subtitle="Ratio Analysis & Cash Flow" />
                    <QuickReviseItem icon="📄" title="Previous Year Solved" subtitle="2023, 2022 Board Papers" />
                  </div>
                </div>

                <div className="rounded-xl bg-blue-600 p-5 text-white shadow-sm">
                  <p className="text-sm font-bold">Unit Test: Partnership</p>
                  <p className="mt-1 text-xs text-blue-100">
                    Scheduled for this Sunday at 10:00 AM. 50 Questions | 60 Mins.
                  </p>
                  <button className="mt-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                    ⏰ Remind Me
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickReviseItem({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="block text-xs text-slate-500">{subtitle}</span>
      </span>
    </button>
  );
}

function ChapterCard({
  index,
  chapter,
  lessonsCount,
  notesCount,
  firstLessonId,
}: {
  index: number;
  chapter: { id: string; title: string };
  lessonsCount: number;
  notesCount: number;
  firstLessonId?: string;
}) {
  const content = (
    <div
      id={`chapter-${chapter.id}`}
      className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
        {String(index).padStart(2, '0')}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-slate-900">{chapter.title}</h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>📖 {lessonsCount} Lessons</span>
          <span>📄 {notesCount} PDF Notes</span>
        </div>
      </div>
      <span className="shrink-0 text-slate-300">›</span>
    </div>
  );

  return firstLessonId ? <Link to={`/lessons/${firstLessonId}`}>{content}</Link> : content;
}
