import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLesson, useLessons, useNotes, useChapter } from '../hooks/useEntities';
import { SiteHeader } from '../components/layout/SiteHeader';
import { formatDuration, formatFileSize } from '../lib/format';

type Tab = 'notes' | 'qa' | 'mcq';

export function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('notes');
  const { data: lesson, isLoading } = useLesson(id ?? '');
  const { data: chapter } = useChapter(lesson?.chapterId ?? '');
  const { data: siblingLessons } = useLessons(lesson ? { chapterId: lesson.chapterId } : undefined);
  const { data: notes } = useNotes(lesson ? { chapterId: lesson.chapterId } : undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-6 py-16 text-center text-sm text-slate-500">
          Loading lesson…
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-xl font-bold text-slate-900">Lesson not found</h1>
          <Link to="/subjects" className="mt-6 inline-block text-sm font-semibold text-blue-600">
            ← Back to subjects
          </Link>
        </div>
      </div>
    );
  }

  const orderedSiblings = (siblingLessons ?? []).slice().sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Chapter / lesson list */}
          <aside className="w-full shrink-0 lg:w-72">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Chapter {chapter?.order ?? ''}
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{chapter?.title ?? 'Chapter'}</h2>

            <div className="mt-4 space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              {orderedSiblings.map((l) => {
                const isCurrent = l.id === lesson.id;
                return (
                  <Link
                    key={l.id}
                    to={`/lessons/${l.id}`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      isCurrent ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{isCurrent ? '▶' : l.videoStatus === 'READY' ? '▶' : '🔒'}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{l.title}</span>
                      <span className={`block text-xs ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                        {isCurrent ? 'Current Lesson · ' : ''}
                        {formatDuration(l.duration)}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-black shadow-sm">
              {lesson.videoStatus === 'READY' && lesson.videoUrl ? (
                <video
                  key={lesson.id}
                  src={lesson.videoUrl}
                  controls
                  className="aspect-video w-full bg-black"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-slate-900 text-sm text-slate-300">
                  {lesson.videoStatus === 'PROCESSING' ? 'Video is still processing…' : 'Video unavailable'}
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{lesson.title}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>⏱ {formatDuration(lesson.duration)}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold uppercase tracking-wide">
                    Difficulty: Beginner
                  </span>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                ✓ Mark as Complete
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b border-slate-200">
              <div className="flex gap-6">
                <TabButton active={tab === 'notes'} onClick={() => setTab('notes')}>
                  Lesson Notes
                </TabButton>
                <TabButton active={tab === 'qa'} onClick={() => setTab('qa')}>
                  Q&amp;A Discussion
                </TabButton>
                <TabButton active={tab === 'mcq'} onClick={() => setTab('mcq')}>
                  Related MCQs
                </TabButton>
              </div>
            </div>

            <div className="py-6">
              {tab === 'notes' && (
                <div className="space-y-5">
                  {notes && notes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {notes.map((note) => (
                        <a
                          key={note.id}
                          href={note.filePath}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200"
                        >
                          <span className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm">
                              📄
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-slate-900">{note.title}</span>
                              <span className="block text-xs text-slate-500">
                                {formatFileSize(note.fileSize)}
                              </span>
                            </span>
                          </span>
                          <span className="text-slate-400">⬇</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No downloadable notes for this chapter yet.</p>
                  )}
                  <p className="text-sm leading-relaxed text-slate-700">
                    In this lesson, we cover the core concepts of {chapter?.title?.toLowerCase() ?? 'this chapter'}.
                    Review the notes above alongside the video, and revisit the Quick Revise materials on the
                    subject page before your next mock test.
                  </p>
                </div>
              )}

              {tab === 'qa' && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                  Discussion for this lesson isn't open yet — check back soon.
                </div>
              )}

              {tab === 'mcq' && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                  Related practice MCQs will appear here once published.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 pb-3 text-sm font-medium transition ${
        active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}
