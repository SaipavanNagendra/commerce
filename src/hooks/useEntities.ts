import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  subjectsApi,
  chaptersApi,
  lessonsApi,
  notesApi,
  questionsApi,
  testsApi,
  schoolsApi,
  olympiadsApi,
} from '../api/entities.api';
import type {
  CreateSubjectPayload,
  UpdateSubjectPayload,
  CreateChapterPayload,
  UpdateChapterPayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  CreateNotePayload,
  UpdateNotePayload,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  CreateTestPayload,
  UpdateTestPayload,
  CreateSchoolPayload,
  UpdateSchoolPayload,
  CreateOlympiadPayload,
  UpdateOlympiadPayload,
  AutosaveTestPayload,
  SubmitTestPayload,
  RegisterOlympiadPayload,
  JoinSchoolPayload,
} from '../types/entities.types';
import { generateIdempotencyKey } from '../api/payments.api';

// ========== QUERY KEYS ==========
const queryKeys = {
  subjects: ['subjects'],
  chapters: ['chapters'],
  lessons: ['lessons'],
  notes: ['notes'],
  questions: ['questions'],
  tests: ['tests'],
  schools: ['schools'],
  olympiads: ['olympiads'],
};

// ========== SUBJECTS HOOKS ==========
export function useSubjects() {
  return useQuery({
    queryKey: queryKeys.subjects,
    queryFn: () => subjectsApi.list(),
  });
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: [...queryKeys.subjects, id],
    queryFn: () => subjectsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubjectPayload) => subjectsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
    },
  });
}

export function useUpdateSubject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSubjectPayload) => subjectsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.subjects, id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subjectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
    },
  });
}

// ========== CHAPTERS HOOKS ==========
export function useChapters(filters?: { subjectId?: string; classLevel?: string }) {
  return useQuery({
    queryKey: [...queryKeys.chapters, filters],
    queryFn: () => chaptersApi.list(filters),
  });
}

export function useChapter(id: string) {
  return useQuery({
    queryKey: [...queryKeys.chapters, id],
    queryFn: () => chaptersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChapterPayload) => chaptersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters });
    },
  });
}

export function useUpdateChapter(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateChapterPayload) => chaptersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.chapters, id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters });
    },
  });
}

export function useDeleteChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chaptersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters });
    },
  });
}

// ========== LESSONS HOOKS ==========
export function useLessons(filters?: { chapterId?: string }) {
  return useQuery({
    queryKey: [...queryKeys.lessons, filters],
    queryFn: () => lessonsApi.list(filters),
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: [...queryKeys.lessons, id],
    queryFn: () => lessonsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLessonPayload) => lessonsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
    },
  });
}

export function useUpdateLesson(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateLessonPayload) => lessonsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.lessons, id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
    },
  });
}

// ========== NOTES HOOKS ==========
export function useNotes(filters?: { chapterId?: string }) {
  return useQuery({
    queryKey: [...queryKeys.notes, filters],
    queryFn: () => notesApi.list(filters),
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: [...queryKeys.notes, id],
    queryFn: () => notesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotePayload) => notesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
  });
}

export function useUpdateNote(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateNotePayload) => notesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.notes, id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
  });
}

// ========== QUESTIONS HOOKS ==========
export function useQuestions(filters?: { subjectId?: string; chapterSlug?: string }) {
  return useQuery({
    queryKey: [...queryKeys.questions, filters],
    queryFn: () => questionsApi.list(filters),
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: [...queryKeys.questions, id],
    queryFn: () => questionsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuestionPayload) => questionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions });
    },
  });
}

export function useUpdateQuestion(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateQuestionPayload) => questionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.questions, id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.questions });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions });
    },
  });
}

// ========== TESTS HOOKS ==========
export function useTests(filters?: { subjectId?: string }) {
  return useQuery({
    queryKey: [...queryKeys.tests, filters],
    queryFn: () => testsApi.list(filters),
  });
}

export function useTest(id: string) {
  return useQuery({
    queryKey: [...queryKeys.tests, id],
    queryFn: () => testsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTestPayload) => testsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests });
    },
  });
}

export function useUpdateTest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTestPayload) => testsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.tests, id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tests });
    },
  });
}

export function useDeleteTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests });
    },
  });
}

// ========== SCHOOLS HOOKS ==========
export function useSchools(filters?: { state?: string; city?: string }) {
  return useQuery({
    queryKey: [...queryKeys.schools, filters],
    queryFn: () => schoolsApi.list(filters),
  });
}

export function useSchool(id: string) {
  return useQuery({
    queryKey: [...queryKeys.schools, id],
    queryFn: () => schoolsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchoolPayload) => schoolsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools });
    },
  });
}

export function useUpdateSchool(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSchoolPayload) => schoolsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.schools, id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.schools });
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schoolsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools });
    },
  });
}

// ========== OLYMPIADS HOOKS ==========
export function useOlympiads(filters?: { classLevel?: string }) {
  return useQuery({
    queryKey: [...queryKeys.olympiads, filters],
    queryFn: () => olympiadsApi.list(filters),
  });
}

export function useOlympiad(id: string) {
  return useQuery({
    queryKey: [...queryKeys.olympiads, id],
    queryFn: () => olympiadsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateOlympiad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOlympiadPayload) => olympiadsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.olympiads });
    },
  });
}

export function useUpdateOlympiad(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOlympiadPayload) => olympiadsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.olympiads, id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.olympiads });
    },
  });
}

export function useDeleteOlympiad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => olympiadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.olympiads });
    },
  });
}

// ========== TEST ATTEMPT HOOKS ==========
export function useStartTest() {
  return useMutation({
    mutationFn: (testId: string) => testsApi.start(testId),
  });
}

export function useAutosaveTest(testId: string, attemptId: string) {
  return useMutation({
    mutationFn: (payload: AutosaveTestPayload) => testsApi.autosave(testId, attemptId, payload),
  });
}

export function useSubmitTest(testId: string, attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitTestPayload) => testsApi.submit(testId, attemptId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    },
  });
}

export function useTestResult(testId: string, attemptId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['testResult', testId, attemptId],
    queryFn: () => testsApi.getResult(testId, attemptId),
    enabled: (options?.enabled ?? true) && !!testId && !!attemptId,
    // Result evaluation happens async in a BullMQ worker — poll until ready.
    refetchInterval: (query) => (query.state.data ? false : 2500),
  });
}

// ========== NOTES DOWNLOAD ==========
export function useDownloadNote() {
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title?: string }) => notesApi.download(id, title),
  });
}

// ========== SCHOOL JOIN ==========
export function useJoinSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JoinSchoolPayload) => schoolsApi.join(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useSchoolDashboard(id: string) {
  return useQuery({
    queryKey: [...queryKeys.schools, id, 'dashboard'],
    queryFn: () => schoolsApi.dashboard(id),
    enabled: !!id,
  });
}

export function useSchoolStudents(id: string) {
  return useQuery({
    queryKey: [...queryKeys.schools, id, 'students'],
    queryFn: () => schoolsApi.students(id),
    enabled: !!id,
  });
}

// ========== OLYMPIAD REGISTRATION / LEADERBOARD ==========
export function useRegisterOlympiad(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterOlympiadPayload) =>
      olympiadsApi.register(id, payload, generateIdempotencyKey()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.olympiads, id, 'my-result'] });
    },
  });
}

export function useOlympiadLeaderboard(id: string) {
  return useQuery({
    queryKey: [...queryKeys.olympiads, id, 'leaderboard'],
    queryFn: () => olympiadsApi.leaderboard(id),
    enabled: !!id,
    refetchInterval: 30_000, // matches the backend's 30s leaderboard cache TTL
  });
}

export function useOlympiadMyResult(id: string) {
  return useQuery({
    queryKey: [...queryKeys.olympiads, id, 'my-result'],
    queryFn: () => olympiadsApi.myResult(id),
    enabled: !!id,
    retry: false,
  });
}
