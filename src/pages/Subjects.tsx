import { useState } from 'react';
import { useSubjects, useCreateSubject, useDeleteSubject } from '../hooks/useEntities';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { AdminNav } from '../components/AdminNav';
import type { CreateSubjectPayload } from '../types/entities.types';

export function Subjects() {
  const { data: subjects, isLoading, error } = useSubjects();
  const createMutation = useCreateSubject();
  const deleteMutation = useDeleteSubject();

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateSubjectPayload>({
    name: '',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Subject name is required');
      return;
    }

    try {
      const payload: CreateSubjectPayload = {
        ...formData,
        icon: selectedFile || undefined,
      };

      await createMutation.mutateAsync(payload);
      setFormData({ name: '', description: '' });
      setSelectedFile(null);
      setIsCreating(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject? This will also delete all chapters, lessons, and notes.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        setFormError(err.response?.data?.message || 'Failed to delete subject');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-600">Loading subjects...</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Subjects</h1>
          <p className="mt-1 text-slate-600">Manage Commerce Edge subjects</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-auto">
            + Add Subject
          </Button>
        )}
      </div>

      {/* Error Messages */}
      {error && <ErrorAlert message={(error as any).message || 'Failed to load subjects'} />}
      {formError && <ErrorAlert message={formError} />}

      {/* Create Form */}
      {isCreating && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Subject</h2>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40"
                placeholder="e.g., Accountancy"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40"
                placeholder="Subject description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Icon
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={createMutation.isPending}>
                Create Subject
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ name: '', description: '' });
                  setSelectedFile(null);
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Subjects Grid */}
      {subjects && subjects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              {subject.icon && (
                <img
                  src={subject.icon}
                  alt={subject.name}
                  className="h-12 w-12 rounded-lg object-cover mb-4"
                />
              )}
              <h3 className="text-lg font-bold text-slate-900">{subject.name}</h3>
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">{subject.description}</p>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100">
                  View
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    subject.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {subject.isActive ? '✓ Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-slate-500">No subjects yet. Create one to get started.</p>
        </div>
      )}
      </div>
    </div>
  );
}
