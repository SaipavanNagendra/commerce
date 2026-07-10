import { Link, useParams } from 'react-router-dom';
import { SiteHeader } from '../components/layout/SiteHeader';
import { useTest, useTestResult } from '../hooks/useEntities';

export function TestResultPage() {
  const { testId, attemptId } = useParams<{ testId: string; attemptId: string }>();
  const { data: test } = useTest(testId ?? '');
  const { data: result, isLoading } = useTestResult(testId ?? '', attemptId ?? '');

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {isLoading || !result ? (
            <>
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <h1 className="mt-6 text-xl font-bold text-slate-900">Evaluating your test…</h1>
              <p className="mt-2 text-sm text-slate-500">
                Our scoring engine is grading your answers and calculating your rank. This
                usually takes a few seconds.
              </p>
            </>
          ) : (
            <>
              <span className="inline-block rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700">
                Test Evaluated
              </span>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">{test?.title ?? 'Your Result'}</h1>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Percentile" value={`${result.percentile}%`} />
                <StatCard label="National Rank" value={result.nationalRank ?? '—'} />
                <StatCard label="State Rank" value={result.stateRank ?? '—'} />
                <StatCard label="School Rank" value={result.schoolRank ?? '—'} />
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <h3 className="text-sm font-bold text-green-800">Strong Topics</h3>
                  <ul className="mt-2 space-y-1 text-sm text-green-700">
                    {result.strongTopics.length === 0 && <li>—</li>}
                    {result.strongTopics.map((t) => (
                      <li key={t}>✓ {t}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <h3 className="text-sm font-bold text-amber-800">Weak Topics</h3>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700">
                    {result.weakTopics.length === 0 && <li>—</li>}
                    {result.weakTopics.map((t) => (
                      <li key={t}>⚠ {t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/tests"
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  More Tests
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Back to Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
