import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SiteHeader } from '../components/layout/SiteHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import { useAuthContext } from '../context/AuthContext';
import { useSubjects, useTests, useStartTest } from '../hooks/useEntities';
import { getApiErrorMessage, isApiErrorStatus } from '../lib/axios';

const typeLabels: Record<string, string> = {
  CHAPTER: 'Chapter Test',
  UNIT: 'Unit Test',
  HALF_YEARLY: 'Half Yearly',
  PRE_BOARD: 'Pre-Board',
  OLYMPIAD_MOCK: 'Olympiad Mock',
};

export function TestsList() {
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { data: subjects } = useSubjects();
  const [subjectId, setSubjectId] = useState<string>('');
  const { data: tests, isLoading } = useTests(subjectId ? { subjectId } : undefined);
  const startTest = useStartTest();
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStart(testId: string) {
    setError(null);
    setStartingId(testId);
    try {
      const res = await startTest.mutateAsync(testId);
      navigate(`/tests/${testId}/attempt/${res.attemptId}`, { state: res });
    } catch (err) {
      if (isApiErrorStatus(err, 409)) {
        setError('You already have an attempt in progress for this test.');
      } else {
        setError(getApiErrorMessage(err, 'Could not start the test. Please try again.'));
      }
    } finally {
      setStartingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex gap-8">
          {isAuthenticated && <StudentSidebar />}

          <div className="min-w-0 flex-1 space-y-6">
            <div>
              <p className="text-sm text-slate-500">
                <Link to="/subjects" className="hover:text-slate-800">Home</Link>
                <span className="mx-1.5">›</span>
                <span className="font-medium text-slate-800">Tests</span>
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">Tests &amp; Quizzes</h1>
              <p className="mt-1 text-sm text-slate-600">
                Chapter tests, unit tests, and pre-board mocks — timed, auto-graded, ranked.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSubjectId('')}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  subjectId === '' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Subjects
              </button>
              {(subjects ?? []).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubjectId(s.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    subjectId === s.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {isLoading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                Loading tests…
              </div>
            )}

            {!isLoading && (tests ?? []).length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No tests published for this filter yet.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(tests ?? []).map((test) => (
                <div
                  key={test.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div>
                    <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {typeLabels[test.type] ?? test.type}
                    </span>
                    <h3 className="mt-3 font-bold text-slate-900">{test.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>📝 {test.totalQuestions} Questions</span>
                      <span>⏱ {test.durationMinutes} mins</span>
                      <span>Marks: +1 | −{test.negativeMarking}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStart(test.id)}
                    disabled={startingId === test.id}
                    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {startingId === test.id ? 'Starting…' : 'Start Test'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
