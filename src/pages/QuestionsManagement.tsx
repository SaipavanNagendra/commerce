import { useState, useMemo } from 'react';
import { useQuestions, useCreateQuestion, useDeleteQuestion } from '../hooks/useEntities';
import { useSubjects } from '../hooks/useEntities';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { AdminNav } from '../components/AdminNav';
import type { QuestionType, Difficulty } from '../types/entities.types';

export function QuestionsManagement() {
  const { data: questions, isLoading, error } = useQuestions();
  const { data: subjects } = useSubjects();
  const createMutation = useCreateQuestion();
  const deleteMutation = useDeleteQuestion();

  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | ''>('');
  const [filterType, setFilterType] = useState<QuestionType | ''>('');

  const [formData, setFormData] = useState({
    subjectId: '',
    chapterSlug: '',
    type: 'MCQ' as QuestionType,
    difficulty: 'MEDIUM' as Difficulty,
    questionText: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctOption: 'A',
    tags: '' as string,
  });

  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    return questions.filter((q) => {
      if (filterSubject && q.subjectId !== filterSubject) return false;
      if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
      if (filterType && q.type !== filterType) return false;
      return true;
    });
  }, [questions, filterSubject, filterDifficulty, filterType]);

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index].text = text;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectOptionChange = (index: number) => {
    const optionId = String.fromCharCode(65 + index); // A, B, C, D
    setFormData({ ...formData, correctOption: optionId });
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', isCorrect: false }],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index),
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.subjectId.trim()) {
      setFormError('Subject is required');
      return;
    }
    if (!formData.chapterSlug.trim()) {
      setFormError('Chapter slug is required');
      return;
    }
    if (!formData.questionText.trim()) {
      setFormError('Question text is required');
      return;
    }
    if (formData.options.some((o) => !o.text.trim())) {
      setFormError('All options must have text');
      return;
    }

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      await createMutation.mutateAsync({
        subjectId: formData.subjectId,
        chapterSlug: formData.chapterSlug,
        type: formData.type,
        difficulty: formData.difficulty,
        questionText: formData.questionText,
        options: formData.options.map((o) => ({ text: o.text, isCorrect: false })),
        correctOption: formData.correctOption,
        tags: tagsArray,
      });

      setFormData({
        subjectId: '',
        chapterSlug: '',
        type: 'MCQ',
        difficulty: 'MEDIUM',
        questionText: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        correctOption: 'A',
        tags: '',
      });
      setIsCreating(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create question');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this question?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        setFormError(err.response?.data?.message || 'Failed to delete question');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-600">Loading questions...</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Questions Bank</h1>
          <p className="mt-1 text-slate-600">Create and manage practice questions</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-auto">
            + Create Question
          </Button>
        )}
      </div>

      {/* Errors */}
      {error && <ErrorAlert message={(error as any).message || 'Failed to load questions'} />}
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
          onChange={(e) => setFilterType(e.target.value as QuestionType | '')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
        >
          <option value="">All Types</option>
          <option value="MCQ">MCQ</option>
          <option value="NUMERICAL">Numerical</option>
          <option value="CASE_STUDY">Case Study</option>
        </select>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value as Difficulty | '')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
        >
          <option value="">All Levels</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Question</h2>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid grid-cols-3 gap-4">
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
                  Question Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionType })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                >
                  <option value="MCQ">MCQ</option>
                  <option value="NUMERICAL">Numerical</option>
                  <option value="CASE_STUDY">Case Study</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Chapter Slug *
              </label>
              <input
                type="text"
                value={formData.chapterSlug}
                onChange={(e) => setFormData({ ...formData, chapterSlug: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                placeholder="e.g., accountancy-11-introduction-to-accounting"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Format: {'{subjectSlug}-{classNumber}-{chapterTitle}'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Question Text *
              </label>
              <textarea
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                placeholder="Enter the question"
                rows={3}
                required
              />
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Options</label>
              <div className="space-y-2">
                {formData.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-600">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    />
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correctOption === String.fromCharCode(65 + idx)}
                      onChange={() => handleCorrectOptionChange(idx)}
                      className="w-4 h-4"
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                + Add Option
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
                placeholder="e.g., basics, important, chapter-review"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={createMutation.isPending}>
                Create Question
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

      {/* Questions List */}
      {filteredQuestions && filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{question.questionText}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                      {question.type}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        question.difficulty === 'EASY'
                          ? 'bg-green-100 text-green-800'
                          : question.difficulty === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {question.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(question.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-2">
                {question.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-sm ${
                      opt.id === question.correctOption
                        ? 'bg-green-50 border border-green-200 text-green-900 font-medium'
                        : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="font-medium">{opt.id}.</span> {opt.text}
                    {opt.id === question.correctOption && ' ✓'}
                  </div>
                ))}
              </div>

              {question.tags && question.tags.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {question.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-slate-500">No questions found. Create one to get started.</p>
        </div>
      )}
      </div>
    </div>
  );
}
