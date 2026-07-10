import { useState, useMemo } from 'react';
import { useLessons, useCreateLesson, useDeleteLesson } from '../hooks/useEntities';
import { useChapters } from '../hooks/useEntities';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { AdminNav } from '../components/AdminNav';

export function LessonsManagement() {
  const { data: lessons, isLoading, error } = useLessons();
  const { data: chapters } = useChapters();
  const createMutation = useCreateLesson();
  const deleteMutation = useDeleteLesson();

  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterChapter, setFilterChapter] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [formData, setFormData] = useState({
    chapterId: '',
    title: '',
    order: 1,
    duration: 0,
    videoFile: null as File | null,
  });

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    return filterChapter ? lessons.filter((l) => l.chapterId === filterChapter) : lessons;
  }, [lessons, filterChapter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setFormError('Please select a valid video file');
        return;
      }
      setFormData({ ...formData, videoFile: file });

      // Extract duration from video metadata
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        setFormData((prev) => ({ ...prev, duration: Math.round(video.duration) }));
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.chapterId.trim()) {
      setFormError('Chapter is required');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Lesson title is required');
      return;
    }
    if (!formData.videoFile) {
      setFormError('Video file is required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        chapterId: formData.chapterId,
        title: formData.title,
        order: formData.order,
        duration: formData.duration,
        video: formData.videoFile,
      });
      setFormData({ chapterId: '', title: '', order: 1, duration: 0, videoFile: null });
      setUploadProgress(0);
      setIsCreating(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create lesson');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this lesson?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        setFormError(err.response?.data?.message || 'Failed to delete lesson');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Ready</span>;
      case 'PROCESSING':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Processing</span>;
      case 'FAILED':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-600">Loading lessons...</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Lessons Management</h1>
          <p className="mt-1 text-slate-600">Manage video lessons with automatic optimization</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-auto">
            + Upload Lesson
          </Button>
        )}
      </div>

      {/* Errors */}
      {error && <ErrorAlert message={(error as any).message || 'Failed to load lessons'} />}
      {formError && <ErrorAlert message={formError} />}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterChapter}
          onChange={(e) => setFilterChapter(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
        >
          <option value="">All Chapters</option>
          {chapters?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Upload New Lesson</h2>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Chapter *
                </label>
                <select
                  value={formData.chapterId}
                  onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                  required
                >
                  <option value="">Select Chapter</option>
                  {chapters?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Order *
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
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lesson Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                placeholder="e.g., What is Accounting?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Video File * (Auto-optimized)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                {formData.videoFile && (
                  <>
                    📁 {formData.videoFile.name} • {(formData.videoFile.size / 1024 / 1024).toFixed(2)}MB
                    <br />
                    ⏱️ Duration: {Math.floor(formData.duration / 60)}m {formData.duration % 60}s
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={createMutation.isPending}>
                {createMutation.isPending ? `Uploading... ${uploadProgress}%` : 'Upload Lesson'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ chapterId: '', title: '', order: 1, duration: 0, videoFile: null });
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>

            <div className="pt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ After upload, the video will be automatically optimized in the background. Status will change from
                "Processing" to "Ready" once complete. Check back in a few minutes!
              </p>
            </div>
          </form>
        </div>
      )}

      {/* Lessons Table */}
      {filteredLessons && filteredLessons.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Chapter</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Order</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{lesson.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{lesson.chapter?.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(lesson.videoStatus)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{lesson.order}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(lesson.id)}
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
          <p className="text-slate-500">No lessons found. Upload one to get started.</p>
        </div>
      )}
      </div>
    </div>
  );
}
