import { useState, useMemo } from 'react';
import { useTests, useCreateTest, useUpdateTest, useDeleteTest } from '../hooks/useEntities';
import { useSubjects } from '../hooks/useEntities';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { AdminNav } from '../components/AdminNav';
import type { TestType } from '../types/entities.types';
import type { ClassLevel } from '../types/auth.types';

export function TestsManagement() {
  const { data: tests, isLoading, error } = useTests();
  const { data: subjects } = useSubjects();
  const createMutation = useCreateTest();
  const updateMutation = useUpdateTest('');
  const deleteMutation = useDeleteTest();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterType, setFilterType] = useState<TestType | ''>('');

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    classLevel: 'CLASS_11' as ClassLevel,
    type: 'CHAPTER' as TestType,
    totalQuestions: 0,
    durationMinutes: 0,
    negativeMarking: 0,
  });

  const filteredTests = useMemo(() => {
    if (!tests) return [];
    return tests.filter((t) => {
      if (filterSubject && t.subjectId !== filterSubject) return false;
      if (filterType && t.type !== filterType) return false;
      return true;
    });
  }, [tests, filterSubject, filterType]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Test title is required');
      return;
    }
    if (!formData.subjectId) {
      setFormError('Subject is required');
      return;
    }
    if (formData.totalQuestions < 1) {
      setFormError('Total questions must be at least 1');
      return;
    }
    if (formData.durationMinutes < 1) {
      setFormError('Duration must be at least 1 minute');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: formData.title,
        subjectId: formData.subjectId,
        classLevel: formData.classLevel,
        type: formData.type,
        totalQuestions: formData.totalQuestions,
        durationMinutes: formData.durationMinutes,
        negativeMarking: formData.negativeMarking,
      });

      setFormData({
        title: '',
        subjectId: '',
        classLevel: 'CLASS_11',
        type: 'CHAPTER',
        totalQuestions: 0,
        durationMinutes: 0,
        negativeMarking: 0,
      });
      setIsCreating(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create test');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setFormError(null);

    try {
      await updateMutation.mutateAsync({
        title: formData.title,
        totalQuestions: formData.totalQuestions,
        durationMinutes: formData.durationMinutes,
        negativeMarking: formData.negativeMarking,
      });

      setEditingId(null);
      setFormData({
        title: '',
        subjectId: '',
        classLevel: 'CLASS_11',
        type: 'CHAPTER',
        totalQuestions: 0,
        durationMinutes: 0,
        negativeMarking: 0,
      });
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update test');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this test?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        setFormError(err.response?.data?.message || 'Failed to delete test');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-600">Loading tests...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Tests Management</h1>
            <p className="mt-1 text-slate-600">Create and manage chapter, unit, and mock tests</p>
          </div>
          {!isCreating && !editingId && (
            <Button onClick={() => setIsCreating(true)} className="w-auto">
              + Create Test
            </Button>
          )}
        </div>

        {/* Errors */}
        {error && <ErrorAlert message={(error as any).message || 'Failed to load tests'} />}
        {formError && <ErrorAlert message={formError} />}

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
          >
            <option value="">All Subjects</option>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TestType | '')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
          >
            <option value="">All Types</option>
            <option value="CHAPTER">Chapter</option>
            <option value="UNIT">Unit</option>
            <option value="HALF_YEARLY">Half Yearly</option>
            <option value="PRE_BOARD">Pre-Board</option>
            <option value="OLYMPIAD_MOCK">Olympiad Mock</option>
          </select>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingId ? 'Edit Test' : 'Create New Test'}
            </h2>
            <form className="space-y-4" onSubmit={editingId ? handleUpdate : handleCreate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                    placeholder="e.g., Chapter 1 - Unit Test"
                    required
                  />
                </div>

                {!editingId && (
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
                )}
              </div>

              {!editingId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Test Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as TestType })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                    >
                      <option value="CHAPTER">Chapter</option>
                      <option value="UNIT">Unit</option>
                      <option value="HALF_YEARLY">Half Yearly</option>
                      <option value="PRE_BOARD">Pre-Board</option>
                      <option value="OLYMPIAD_MOCK">Olympiad Mock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Total Questions *
                    </label>
                    <input
                      type="number"
                      value={formData.totalQuestions}
                      onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                      min="1"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Negative Marking (per wrong answer)
                  </label>
                  <input
                    type="number"
                    value={formData.negativeMarking}
                    onChange={(e) => setFormData({ ...formData, negativeMarking: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                    min="0"
                    step="0.25"
                    placeholder="e.g., 0.25"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" isLoading={editingId ? updateMutation.isPending : createMutation.isPending}>
                  {editingId ? 'Update Test' : 'Create Test'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    setFormData({
                      title: '',
                      subjectId: '',
                      classLevel: 'CLASS_11',
                      type: 'CHAPTER',
                      totalQuestions: 0,
                      durationMinutes: 0,
                      negativeMarking: 0,
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tests Table */}
        {filteredTests && filteredTests.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Questions</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Negative Mark</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{test.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{test.subject?.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                        {test.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{test.totalQuestions}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{test.durationMinutes} min</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{test.negativeMarking}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(test.id);
                          setFormData({
                            title: test.title,
                            subjectId: test.subjectId,
                            classLevel: test.classLevel,
                            type: test.type,
                            totalQuestions: test.totalQuestions,
                            durationMinutes: test.durationMinutes,
                            negativeMarking: test.negativeMarking,
                          });
                        }}
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(test.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
            <p className="text-slate-500">No tests found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
