import { useState, useMemo } from 'react';
import { useNotes, useCreateNote, useDeleteNote } from '../hooks/useEntities';
import { useChapters } from '../hooks/useEntities';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { AdminNav } from '../components/AdminNav';
import type { NoteType } from '../types/entities.types';

export function NotesManagement() {
  const { data: notes, isLoading, error } = useNotes();
  const { data: chapters } = useChapters();
  const createMutation = useCreateNote();
  const deleteMutation = useDeleteNote();

  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterChapter, setFilterChapter] = useState<string>('');
  const [filterType, setFilterType] = useState<NoteType | ''>('');

  const [formData, setFormData] = useState({
    chapterId: '',
    title: '',
    type: 'PDF' as NoteType,
    filePath: '',
    fileSize: 0,
  });

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    return notes.filter((n) => {
      if (filterChapter && n.chapterId !== filterChapter) return false;
      if (filterType && n.type !== filterType) return false;
      return true;
    });
  }, [notes, filterChapter, filterType]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.chapterId.trim()) {
      setFormError('Chapter is required');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Note title is required');
      return;
    }
    if (!formData.filePath.trim()) {
      setFormError('File path/URL is required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        chapterId: formData.chapterId,
        title: formData.title,
        type: formData.type,
        filePath: formData.filePath,
        fileSize: formData.fileSize,
      });

      setFormData({ chapterId: '', title: '', type: 'PDF', filePath: '', fileSize: 0 });
      setIsCreating(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create note');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this note?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        setFormError(err.response?.data?.message || 'Failed to delete note');
      }
    }
  };

  const getNoteTypeIcon = (type: NoteType) => {
    switch (type) {
      case 'PDF':
        return '📄';
      case 'MIND_MAP':
        return '🧠';
      case 'FORMULA_SHEET':
        return '📋';
      case 'QUICK_REVISION':
        return '⚡';
      default:
        return '📎';
    }
  };

  const getNoteTypeLabel = (type: NoteType) => {
    switch (type) {
      case 'PDF':
        return 'PDF';
      case 'MIND_MAP':
        return 'Mind Map';
      case 'FORMULA_SHEET':
        return 'Formula Sheet';
      case 'QUICK_REVISION':
        return 'Quick Revision';
      default:
        return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-600">Loading notes...</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Notes Management</h1>
          <p className="mt-1 text-slate-600">Manage PDFs, mind maps, formula sheets, and revision materials</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-auto">
            + Add Note
          </Button>
        )}
      </div>

      {/* Errors */}
      {error && <ErrorAlert message={(error as any).message || 'Failed to load notes'} />}
      {formError && <ErrorAlert message={formError} />}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
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

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as NoteType | '')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
        >
          <option value="">All Types</option>
          <option value="PDF">PDF</option>
          <option value="MIND_MAP">Mind Map</option>
          <option value="FORMULA_SHEET">Formula Sheet</option>
          <option value="QUICK_REVISION">Quick Revision</option>
        </select>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Add New Note</h2>
          <form className="space-y-4" onSubmit={handleCreate}>
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
                Note Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                placeholder="e.g., Chapter 1 Key Formulas"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Note Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as NoteType })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                >
                  <option value="PDF">PDF</option>
                  <option value="MIND_MAP">Mind Map</option>
                  <option value="FORMULA_SHEET">Formula Sheet</option>
                  <option value="QUICK_REVISION">Quick Revision</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  File Size (bytes)
                </label>
                <input
                  type="number"
                  value={formData.fileSize}
                  onChange={(e) => setFormData({ ...formData, fileSize: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                File URL / Path *
              </label>
              <input
                type="url"
                value={formData.filePath}
                onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                placeholder="https://res.cloudinary.com/... or S3 URL"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Upload files to Cloudinary or S3, then paste the URL here
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={createMutation.isPending}>
                Add Note
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ chapterId: '', title: '', type: 'PDF', filePath: '', fileSize: 0 });
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes && filteredNotes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div key={note.id} className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{getNoteTypeIcon(note.type)}</div>
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{note.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{note.chapter?.title}</p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Type:</span>
                  <span className="font-medium text-slate-900">{getNoteTypeLabel(note.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Size:</span>
                  <span className="font-medium text-slate-900">{formatFileSize(note.fileSize)}</span>
                </div>
              </div>

              <a
                href={note.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block rounded-lg bg-teal-50 px-3 py-2 text-center text-sm font-medium text-teal-700 hover:bg-teal-100"
              >
                View File
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-slate-500">No notes found. Add one to get started.</p>
        </div>
      )}
      </div>
    </div>
  );
}
