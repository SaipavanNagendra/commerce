import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTest, useAutosaveTest, useSubmitTest } from '../hooks/useEntities';
import { formatClock } from '../lib/format';
import type { AttemptQuestion, StartTestResponse } from '../types/entities.types';

type ReviewState = 'unattempted' | 'attempted' | 'review';

export function TestAttempt() {
  const { testId, attemptId } = useParams<{ testId: string; attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: test } = useTest(testId ?? '');

  // The question set + endsAt only exist for the lifetime of this attempt —
  // /tests/:id/start returned them once, with correctOption already
  // stripped server-side. We keep them in local state seeded from
  // navigation state (fast path) and fall back to nothing if the page
  // was refreshed directly (attempt state then lives only in Redis on
  // the backend, which this simple client doesn't re-hydrate from).
  const seed = location.state as StartTestResponse | undefined;
  const [questions] = useState<AttemptQuestion[]>(seed?.questions ?? []);
  const [endsAt] = useState<number>(seed?.endsAt ?? Date.now() + 30 * 60 * 1000);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [remainingSecs, setRemainingSecs] = useState(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const autosave = useAutosaveTest(testId ?? '', attemptId ?? '');
  const submitTest = useSubmitTest(testId ?? '', attemptId ?? '');

  const currentQuestion = questions[currentIdx];

  // ----- Countdown -----
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSecs((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (!testId || !attemptId) return;
      setSubmitError(null);
      try {
        await submitTest.mutateAsync({ answers });
        navigate(`/tests/${testId}/attempts/${attemptId}/result`, { replace: true });
      } catch (err) {
        if (!auto) setSubmitError('Could not submit your test. Please try again.');
      }
    },
    [testId, attemptId, answers, submitTest, navigate],
  );

  // Auto-submit the instant time runs out.
  useEffect(() => {
    if (remainingSecs === 0) {
      handleSubmit(true);
    }
  }, [remainingSecs, handleSubmit]);

  // ----- Autosave every 30s -----
  const answersRef = useRef(answers);
  answersRef.current = answers;
  useEffect(() => {
    if (!testId || !attemptId) return;
    const interval = setInterval(() => {
      setAutosaveStatus('saving');
      autosave.mutate(
        { answers: answersRef.current },
        { onSuccess: () => setAutosaveStatus('saved'), onError: () => setAutosaveStatus('idle') },
      );
    }, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, attemptId]);

  const navStatus = useMemo(() => {
    const map: Record<string, ReviewState> = {};
    questions.forEach((q) => {
      if (reviewFlags[q.id]) map[q.id] = 'review';
      else if (answers[q.id]) map[q.id] = 'attempted';
      else map[q.id] = 'unattempted';
    });
    return map;
  }, [questions, answers, reviewFlags]);

  const attemptedCount = Object.values(navStatus).filter((s) => s === 'attempted').length;

  function selectOption(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  function goTo(idx: number) {
    setCurrentIdx(Math.max(0, Math.min(questions.length - 1, idx)));
  }

  function toggleReview() {
    if (!currentQuestion) return;
    setReviewFlags((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }));
  }

  const negativeMarking = test?.negativeMarking ?? 1;

  if (!seed || questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Attempt session not found</h1>
        <p className="max-w-sm text-sm text-slate-500">
          This page needs to be reached by starting a test — direct refreshes lose the in-memory
          question set. Head back to the test list and start again.
        </p>
        <button
          onClick={() => navigate('/tests')}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to Tests
        </button>
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const options = (currentQuestion?.options ?? []).map((opt) =>
    typeof opt === 'string' ? opt : opt.text,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-blue-700">Commerce Edge</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-medium text-slate-700">{test?.title ?? 'Test'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                remainingSecs < 60 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
              }`}
            >
              ⏱ {formatClock(remainingSecs)} REMAINING
            </span>
            <span className="hidden text-xs text-slate-400 sm:flex sm:items-center sm:gap-1">
              ☁ Autosave: {autosaveStatus === 'saving' ? 'Saving…' : 'Saved'}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Question panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Question {currentIdx + 1} of {questions.length}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 shrink-0 text-xs font-medium text-slate-500">
                Marks: +1 | −{negativeMarking}
              </span>
            </div>

            {submitError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <p className="text-base font-medium leading-relaxed text-slate-900">
              {currentQuestion?.questionText}
            </p>

            <div className="mt-6 space-y-3">
              {options.map((opt, i) => {
                const selected = answers[currentQuestion.id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => selectOption(currentQuestion.id, opt)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                      selected
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                        selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      {optionLabels[i]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button
                onClick={() => goTo(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
              >
                ← Previous
              </button>
              <div className="flex gap-3">
                <button
                  onClick={toggleReview}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                >
                  {reviewFlags[currentQuestion?.id] ? 'Unmark Review' : 'Mark for Review'}
                </button>
                <button
                  onClick={() => goTo(currentIdx + 1)}
                  disabled={currentIdx === questions.length - 1}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Question navigator sidebar */}
          <aside className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Question Navigator</h3>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const status = navStatus[q.id];
                  const isCurrent = idx === currentIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => goTo(idx)}
                      className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                        isCurrent
                          ? 'border-2 border-blue-600 bg-white text-blue-700'
                          : status === 'attempted'
                          ? 'bg-blue-600 text-white'
                          : status === 'review'
                          ? 'bg-amber-400 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Attempted
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" /> Unattempted
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Marked for Review
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Progress</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {attemptedCount}/{questions.length}
              </p>
              <p className="text-xs text-slate-500">Questions attempted</p>
            </div>

            {!confirmSubmit ? (
              <button
                onClick={() => setConfirmSubmit(true)}
                className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
              >
                Submit Test
              </button>
            ) : (
              <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">
                  Submit with {questions.length - attemptedCount} unattempted question(s)?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmSubmit(false)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitTest.isPending}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {submitTest.isPending ? 'Submitting…' : 'Confirm Submit'}
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

