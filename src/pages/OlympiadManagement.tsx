import { useState, useMemo } from 'react';
import { useOlympiads, useCreateOlympiad, useDeleteOlympiad } from '../hooks/useEntities';
import { useSubjects } from '../hooks/useEntities';
import { useTests } from '../hooks/useEntities';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { AdminNav } from '../components/AdminNav';
import type { ClassLevel } from '../types/auth.types';

export function OlympiadManagement() {
  const { data: olympiads, isLoading, error } = useOlympiads();
  const { data: subjects } = useSubjects();
  const { data: tests } = useTests();
  const createMutation = useCreateOlympiad();
  const deleteMutation = useDeleteOlympiad();

  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<ClassLevel | ''>('');

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    classLevel: 'CLASS_11' as ClassLevel,
    registrationFee: 0,
    examDate: '',
    testId: '',
  });

  const filteredOlympiads = useMemo(() => {
    if (!olympiads) return [];
    return filterClass ? olympiads.filter((o) => o.classLevel === filterClass) : olympiads;
  }, [olympiads, filterClass]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Olympiad title is required');
      return;
    }
    if (!formData.subjectId) {
      setFormError('Subject is required');
      return;
    }
    if (!formData.testId) {
      setFormError('Test is required');
      return;
    }
    if (formData.registrationFee < 0) {
      setFormError('Registration fee cannot be negative');
      return;
    }
    if (!formData.examDate) {
      setFormError('Exam date is required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: formData.title,
        subjectId: formData.subjectId,
        classLevel: formData.classLevel,
        registrationFee: formData.registrationFee,
        examDate: formData.examDate,
        testId: formData.testId,
      });

      setFormData({
        title: '',
        subjectId: '',
        classLevel: 'CLASS_11',
        registrationFee: 0,
        examDate: '',
        testId: '',
      });
      setIsCreating(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create olympiad');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this olympiad?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        setFormError(err.response?.data?.message || 'Failed to delete olympiad');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-600">Loading olympiads...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <AdminNav />
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Olympiad Management</h1>
          <p className="mt-1 text-slate-600">Create and manage olympiad competitions</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-auto">
            + Create Olympiad
          </Button>
        )}
      </div>

      {/* Errors */}
      {error && <ErrorAlert message={(error as any).message || 'Failed to load olympiads'} />}
      {formError && <ErrorAlert message={formError} />}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value as ClassLevel | '')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
        >
          <option value="">All Classes</option>
          <option value="CLASS_11">Class 11</option>
          <option value="CLASS_12">Class 12</option>
        </select>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Olympiad</h2>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Olympiad Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                placeholder="e.g., National Commerce Olympiad 2026"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subject *
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Class Level *
                </label>
                <select
                  value={formData.classLevel}
                  onChange={(e) => setFormData({ ...formData, classLevel: e.target.value as ClassLevel })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                >
                  <option value="CLASS_11">Class 11</option>
                  <option value="CLASS_12">Class 12</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Registration Fee (₹)
                </label>
                <input
                  type="number"
                  value={formData.registrationFee}
                  onChange={(e) => setFormData({ ...formData, registrationFee: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Exam Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Test *
              </label>
              <select
                value={formData.testId}
                onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                required
              >
                <option value="">Select Test</option>
                {tests?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={createMutation.isPending}>
                Create Olympiad
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreating(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Olympiads Grid */}
      {filteredOlympiads && filteredOlympiads.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredOlympiads.map((olympiad) => (
            <div key={olympiad.id} className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition">
              <h3 className="text-lg font-bold text-slate-900">{olympiad.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{olympiad.subject?.name}</p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Class:</span>
                  <span className="font-medium text-slate-900">{olympiad.classLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Registration Fee:</span>
                  <span className="font-medium text-slate-900">₹{olympiad.registrationFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Exam Date:</span>
                  <span className="font-medium text-slate-900">
                    {new Date(olympiad.examDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100">
                  View Test
                </button>
                <button
                  onClick={() => handleDelete(olympiad.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-slate-500">No olympiads found. Create one to get started.</p>
        </div>
      )}
      </div>
    </div>
  );
}
