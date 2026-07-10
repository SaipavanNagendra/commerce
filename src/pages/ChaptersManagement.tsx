import { useState, useMemo } from 'react';
import { useChapters, useCreateChapter, useDeleteChapter } from '../hooks/useEntities';
import { useSubjects } from '../hooks/useEntities';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { AdminNav } from '../components/AdminNav';
import type { ClassLevel } from '../types/auth.types';

export function ChaptersManagement() {
  const { data: chapters, isLoading, error } = useChapters();
  const { data: subjects } = useSubjects();
  const createMutation = useCreateChapter();
  const deleteMutation = useDeleteChapter();

  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<ClassLevel | ''>('');

  const [formData, setFormData] = useState({
    subjectId: '',
    classLevel: 'CLASS_11' as ClassLevel,
    title: '',
    order: 1,
  });

  const filteredChapters = useMemo(() => {
    if (!chapters) return [];
    return chapters.filter((ch) => {
      if (filterSubject && ch.subjectId !== filterSubject) return false;
      if (filterClass && ch.classLevel !== filterClass) return false;
      return true;
    });
  }, [chapters, filterSubject, filterClass]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.subjectId.trim()) {
      setFormError('Subject is required');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Chapter title is required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        subjectId: formData.subjectId,
        classLevel: formData.classLevel,
        title: formData.title,
        order: formData.order,
      });
      setFormData({ subjectId: '', classLevel: 'CLASS_11', title: '', order: 1 });
      setIsCreating(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create chapter');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this chapter? All lessons and notes will be deleted.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        setFormError(err.response?.data?.message || 'Failed to delete chapter');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-600">Loading chapters...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNav />
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chapters Management</h1>
          <p className="mt-1 text-slate-600">Organize chapters within subjects</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-auto">
            + Add Chapter
          </Button>
        )}
      </div>

      {/* Errors */}
      {error && <ErrorAlert message={(error as any).message || 'Failed to load chapters'} />}
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
          <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Chapter</h2>
          <form className="space-y-4" onSubmit={handleCreate}>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Chapter Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                placeholder="e.g., Introduction to Accounting"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Order (Display Sequence) *
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                min="1"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={createMutation.isPending}>
                Create Chapter
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

      {/* Chapters Table */}
      {filteredChapters && filteredChapters.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Subject</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Class</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Order</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Slug</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChapters.map((chapter) => (
                <tr key={chapter.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{chapter.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{chapter.subject?.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{chapter.classLevel}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{chapter.order}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{chapter.slug}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(chapter.id)}
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
          <p className="text-slate-500">No chapters found. Create one to get started.</p>
        </div>
      )}
      </div>
    </div>
  );
}
