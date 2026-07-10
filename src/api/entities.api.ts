import { api } from '../lib/axios';
import type {
  Subject,
  Chapter,
  Lesson,
  Note,
  Question,
  Test,
  School,
  Olympiad,
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
  StartTestResponse,
  AutosaveTestPayload,
  AutosaveTestResponse,
  SubmitTestPayload,
  SubmitTestResponse,
  TestResult,
  RegisterOlympiadPayload,
  OlympiadRegistration,
  LeaderboardEntry,
  JoinSchoolPayload,
  SchoolStudentRosterItem,
  SchoolDashboardStats,
} from '../types/entities.types';


// ========== SUBJECTS ==========
export const subjectsApi = {
  list: () => api.get<Subject[]>('/subjects').then((res) => res.data),

  get: (id: string) => api.get<Subject>(`/subjects/${id}`).then((res) => res.data),

  create: (payload: CreateSubjectPayload) => {
    const formData = new FormData();
    formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    if (payload.icon) formData.append('icon', payload.icon);
    return api.post<Subject>('/subjects', formData).then((res) => res.data);
  },

  update: (id: string, payload: UpdateSubjectPayload) => {
    const formData = new FormData();
    if (payload.name) formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    if (payload.icon) formData.append('icon', payload.icon);
    if (payload.isActive !== undefined) formData.append('isActive', String(payload.isActive));
    return api.patch<Subject>(`/subjects/${id}`, formData).then((res) => res.data);
  },

  delete: (id: string) => api.delete(`/subjects/${id}`).then((res) => res.data),
};

// ========== CHAPTERS ==========
export const chaptersApi = {
  list: (filters?: { subjectId?: string; classLevel?: string }) =>
    api.get<Chapter[]>('/chapters', { params: filters }).then((res) => res.data),

  get: (id: string) => api.get<Chapter>(`/chapters/${id}`).then((res) => res.data),

  create: (payload: CreateChapterPayload) =>
    api.post<Chapter>('/chapters', payload).then((res) => res.data),

  update: (id: string, payload: UpdateChapterPayload) =>
    api.patch<Chapter>(`/chapters/${id}`, payload).then((res) => res.data),

  delete: (id: string) => api.delete(`/chapters/${id}`).then((res) => res.data),
};

// ========== LESSONS ==========
export const lessonsApi = {
  list: (filters?: { chapterId?: string }) =>
    api.get<Lesson[]>('/lessons', { params: filters }).then((res) => res.data),

  get: (id: string) => api.get<Lesson>(`/lessons/${id}`).then((res) => res.data),

  create: (payload: CreateLessonPayload) => {
    const formData = new FormData();
    formData.append('chapterId', payload.chapterId);
    formData.append('title', payload.title);
    formData.append('order', String(payload.order));
    formData.append('duration', String(payload.duration));
    formData.append('video', payload.video);
    return api.post<{ message: string; lessonId: string }>('/lessons', formData).then((res) => res.data);
  },

  update: (id: string, payload: UpdateLessonPayload) =>
    api.patch<Lesson>(`/lessons/${id}`, payload).then((res) => res.data),

  delete: (id: string) => api.delete(`/lessons/${id}`).then((res) => res.data),
};

// ========== NOTES ==========
export const notesApi = {
  list: (filters?: { chapterId?: string }) =>
    api.get<Note[]>('/notes', { params: filters }).then((res) => res.data),

  get: (id: string) => api.get<Note>(`/notes/${id}`).then((res) => res.data),

  create: (payload: CreateNotePayload) =>
    api.post<Note>('/notes', payload).then((res) => res.data),

  update: (id: string, payload: UpdateNotePayload) =>
    api.patch<Note>(`/notes/${id}`, payload).then((res) => res.data),

  delete: (id: string) => api.delete(`/notes/${id}`).then((res) => res.data),

  // Streams the PDF via the backend's Nginx X-Accel-Redirect. We request
  // it as a blob so we can trigger a normal browser "Save As" download
  // without navigating away from the SPA.
  download: async (id: string, fileName?: string) => {
    const res = await api.get(`/notes/${id}/download`, { responseType: 'blob' });
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName ? `${fileName}.pdf` : 'note.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// ========== QUESTIONS ==========
export const questionsApi = {
  list: (filters?: { subjectId?: string; chapterSlug?: string }) =>
    api.get<Question[]>('/questions', { params: filters }).then((res) => res.data),

  get: (id: string) => api.get<Question>(`/questions/${id}`).then((res) => res.data),

  create: (payload: CreateQuestionPayload) =>
    api.post<Question>('/questions', payload).then((res) => res.data),

  update: (id: string, payload: UpdateQuestionPayload) =>
    api.patch<Question>(`/questions/${id}`, payload).then((res) => res.data),

  delete: (id: string) => api.delete(`/questions/${id}`).then((res) => res.data),
};

// ========== TESTS ==========
export const testsApi = {
  list: (filters?: { subjectId?: string }) =>
    api.get<Test[]>('/tests', { params: filters }).then((res) => res.data),

  get: (id: string) => api.get<Test>(`/tests/${id}`).then((res) => res.data),

  create: (payload: CreateTestPayload) =>
    api.post<Test>('/tests', payload).then((res) => res.data),

  update: (id: string, payload: UpdateTestPayload) =>
    api.patch<Test>(`/tests/${id}`, payload).then((res) => res.data),

  delete: (id: string) => api.delete(`/tests/${id}`).then((res) => res.data),

  // ----- Attempt flow -----
  start: (testId: string) =>
    api.post<StartTestResponse>(`/tests/${testId}/start`).then((res) => res.data),

  autosave: (testId: string, attemptId: string, payload: AutosaveTestPayload) =>
    api
      .patch<AutosaveTestResponse>(`/tests/${testId}/attempts/${attemptId}/autosave`, payload)
      .then((res) => res.data),

  submit: (testId: string, attemptId: string, payload: SubmitTestPayload) =>
    api
      .post<SubmitTestResponse>(`/tests/${testId}/attempts/${attemptId}/submit`, payload)
      .then((res) => res.data),

  getResult: (testId: string, attemptId: string) =>
    api.get<TestResult>(`/tests/${testId}/attempts/${attemptId}/result`).then((res) => res.data),
};

// ========== SCHOOLS ==========
export const schoolsApi = {
  list: (filters?: { state?: string; city?: string }) =>
    api.get<School[]>('/schools', { params: filters }).then((res) => res.data),

  get: (id: string) => api.get<School>(`/schools/${id}`).then((res) => res.data),

  create: (payload: CreateSchoolPayload) =>
    api.post<School>('/schools', payload).then((res) => res.data),

  update: (id: string, payload: UpdateSchoolPayload) =>
    api.patch<School>(`/schools/${id}`, payload).then((res) => res.data),

  delete: (id: string) => api.delete(`/schools/${id}`).then((res) => res.data),

  join: (payload: JoinSchoolPayload) =>
    api.post('/schools/join', payload).then((res) => res.data),

  dashboard: (id: string) =>
    api.get<SchoolDashboardStats>(`/schools/${id}/dashboard`).then((res) => res.data),

  students: (id: string) =>
    api.get<SchoolStudentRosterItem[]>(`/schools/${id}/students`).then((res) => res.data),
};

// ========== OLYMPIADS ==========
export const olympiadsApi = {
  list: (filters?: { classLevel?: string }) =>
    api.get<Olympiad[]>('/olympiads', { params: filters }).then((res) => res.data),

  get: (id: string) => api.get<Olympiad>(`/olympiads/${id}`).then((res) => res.data),

  create: (payload: CreateOlympiadPayload) =>
    api.post<Olympiad>('/olympiads', payload).then((res) => res.data),

  update: (id: string, payload: UpdateOlympiadPayload) =>
    api.patch<Olympiad>(`/olympiads/${id}`, payload).then((res) => res.data),

  delete: (id: string) => api.delete(`/olympiads/${id}`).then((res) => res.data),

  register: (id: string, payload: RegisterOlympiadPayload, idempotencyKey: string) =>
    api
      .post<OlympiadRegistration>(`/olympiads/${id}/register`, payload, {
        headers: { 'idempotency-key': idempotencyKey },
      })
      .then((res) => res.data),

  leaderboard: (id: string) =>
    api.get<LeaderboardEntry[]>(`/olympiads/${id}/leaderboard`).then((res) => res.data),

  myResult: (id: string) =>
    api.get<LeaderboardEntry>(`/olympiads/${id}/my-result`).then((res) => res.data),
};
