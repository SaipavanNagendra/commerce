// Comprehensive types for all CommerceEdge entities
import type { ClassLevel } from './auth.types';

// ========== ENUMS ==========
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MCQ' | 'NUMERICAL' | 'CASE_STUDY';
export type TestType = 'CHAPTER' | 'UNIT' | 'HALF_YEARLY' | 'PRE_BOARD' | 'OLYMPIAD_MOCK';
export type NoteType = 'PDF' | 'MIND_MAP' | 'FORMULA_SHEET' | 'QUICK_REVISION';
export type VideoStatus = 'PROCESSING' | 'READY' | 'FAILED';

// ========== SUBJECTS ==========
export interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectPayload {
  name: string;
  description?: string;
  icon?: File;
}

export interface UpdateSubjectPayload {
  name?: string;
  description?: string;
  icon?: File;
  isActive?: boolean;
}

// ========== CHAPTERS ==========
export interface Chapter {
  id: string;
  subjectId: string;
  classLevel: ClassLevel;
  title: string;
  slug: string;
  order: number;
  subject?: Subject;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChapterPayload {
  subjectId: string;
  classLevel: ClassLevel;
  title: string;
  order: number;
}

export interface UpdateChapterPayload {
  title?: string;
  classLevel?: ClassLevel;
  order?: number;
}

// ========== LESSONS ==========
export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  order: number;
  duration: number; // in seconds
  videoUrl: string;
  videoStatus: VideoStatus;
  chapter?: Chapter;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonPayload {
  chapterId: string;
  title: string;
  order: number;
  duration: number;
  video: File;
}

export interface UpdateLessonPayload {
  title?: string;
  order?: number;
  duration?: number;
}

// ========== NOTES ==========
export interface Note {
  id: string;
  chapterId: string;
  title: string;
  type: NoteType;
  filePath: string;
  fileSize: number;
  chapter?: Chapter;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotePayload {
  chapterId: string;
  title: string;
  type: NoteType;
  filePath: string;
  fileSize: number;
}

export interface UpdateNotePayload {
  title?: string;
  type?: NoteType;
  filePath?: string;
  fileSize?: number;
}

// ========== QUESTIONS ==========
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  subjectId: string;
  chapterSlug: string;
  type: QuestionType;
  difficulty: Difficulty;
  questionText: string;
  options: QuestionOption[];
  correctOption: string;
  tags: string[];
  subject?: Subject;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionPayload {
  subjectId: string;
  chapterSlug: string;
  type: QuestionType;
  difficulty: Difficulty;
  questionText: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  correctOption: string;
  tags?: string[];
}

export interface UpdateQuestionPayload {
  questionText?: string;
  difficulty?: Difficulty;
  options?: Array<{ text: string; isCorrect: boolean }>;
  correctOption?: string;
  tags?: string[];
}

// ========== TESTS ==========
export interface Test {
  id: string;
  title: string;
  subjectId: string;
  classLevel: ClassLevel;
  type: TestType;
  totalQuestions: number;
  durationMinutes: number;
  negativeMarking: number;
  subject?: Subject;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestPayload {
  title: string;
  subjectId: string;
  classLevel: ClassLevel;
  type: TestType;
  totalQuestions: number;
  durationMinutes: number;
  negativeMarking: number;
}

export interface UpdateTestPayload {
  title?: string;
  totalQuestions?: number;
  durationMinutes?: number;
  negativeMarking?: number;
}

// ========== SCHOOLS ==========
export interface School {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
  adminId?: string;
  logoPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchoolPayload {
  name: string;
  code: string;
  state: string;
  city: string;
  adminId?: string;
  logoPath?: string;
}

export interface UpdateSchoolPayload {
  name?: string;
  code?: string;
  state?: string;
  city?: string;
  adminId?: string;
  logoPath?: string;
}

// ========== OLYMPIADS ==========
export interface Olympiad {
  id: string;
  title: string;
  subjectId: string;
  classLevel: ClassLevel;
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'ONGOING' | 'COMPLETED';
  registrationFee: number;
  examDate: string;
  testId: string;
  subject?: Subject;
  test?: Test;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOlympiadPayload {
  title: string;
  subjectId: string;
  classLevel: ClassLevel;
  registrationFee: number;
  examDate: string;
  testId: string;
}

export interface UpdateOlympiadPayload {
  title?: string;
  registrationFee?: number;
  examDate?: string;
  testId?: string;
}

// ========== LIST RESPONSES ==========
export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ========== TEST ATTEMPTS ==========
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATED' | 'ABANDONED';

// Question shape returned once a test attempt has started — correctOption
// is stripped by the backend so it can't be inspected client-side.
export interface AttemptQuestion {
  id: string;
  subjectId: string;
  chapterSlug: string;
  type: QuestionType;
  difficulty: Difficulty;
  questionText: string;
  options: string[] | QuestionOption[];
  tags: string[];
}

export interface StartTestResponse {
  attemptId: string;
  questions: AttemptQuestion[];
  endsAt: number; // ms unix timestamp
}

export interface AutosaveTestPayload {
  answers: Record<string, string>;
}

export interface AutosaveTestResponse {
  saved: boolean;
  remainingSecs: number;
}

export interface SubmitTestPayload {
  answers: Record<string, string>;
}

export interface SubmitTestResponse {
  message: string;
}

export interface TestResult {
  id: string;
  attemptId: string;
  percentile: number;
  nationalRank: number | null;
  stateRank: number | null;
  schoolRank: number | null;
  weakTopics: string[];
  strongTopics: string[];
  subjectAnalysis: Record<string, unknown>;
  createdAt: string;
}

// ========== OLYMPIADS (extended) ==========
export type OlympiadStatus = 'UPCOMING' | 'REGISTRATION_OPEN' | 'ONGOING' | 'COMPLETED';

export interface RegisterOlympiadPayload {
  schoolId?: string;
  paymentId?: string;
}

export interface OlympiadRegistration {
  id: string;
  userId: string;
  olympiadId: string;
  schoolId: string | null;
  paymentId: string | null;
  rollNumber: string | null;
  confirmed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  olympiadId: string;
  userId: string;
  score: number;
  nationalRank: number;
  stateRank: number;
  schoolRank: number;
  user?: {
    profile: {
      firstName: string;
      lastName: string;
      avatarPath: string | null;
      state: string;
    };
  };
}

// ========== DASHBOARD ==========
export interface StudentDashboardStats {
  testsTaken: number;
  latestTest: {
    id: string;
    status: AttemptStatus;
    score: number | null;
    submittedAt: string | null;
    test: { title: string };
  } | null;
  activeSubscription: {
    id: string;
    plan: string;
    expiresAt: string;
  } | null;
}

export interface SchoolDashboardStats {
  schoolName: string;
  studentsCount: number;
  code: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalRevenue: number;
  totalOlympiads: number;
  activeSubscriptions: number;
}

// ========== NOTIFICATIONS ==========
export type NotificationType = 'URGENT' | 'CERTIFICATE' | 'PAYMENT_SUCCESS' | string;

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  priority?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsListResponse {
  notifications: Notification[];
  total: number;
  skip: number;
  take: number;
}

export interface SendNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}

// ========== PAYMENTS ==========
export type PaymentPurpose = 'SUBSCRIPTION' | 'OLYMPIAD_REGISTRATION' | string;

export interface CreateOrderPayload {
  amount: number;
  purpose: PaymentPurpose;
}

export interface CreateOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
}

// ========== CERTIFICATES ==========
export type CertType = 'OLYMPIAD_PARTICIPATION' | 'OLYMPIAD_RANK' | 'COURSE_COMPLETION';

export interface Certificate {
  id: string;
  userId: string;
  type: CertType;
  referenceId: string;
  filePath: string;
  issuedAt: string;
}

export interface RequestCertificateResponse {
  message: string;
  jobId: string;
}

// ========== SUBSCRIPTIONS ==========
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface SubscribePayload {
  planId: string;
  paymentId: string;
}

// ========== FEATURE FLAGS ==========
export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  targetRoles: string[];
  rolloutPercent: number;
}

export interface CreateFeatureFlagPayload {
  name: string;
  enabled: boolean;
  targetRoles: string[];
  rolloutPercent: number;
}

export interface UpdateFeatureFlagPayload {
  enabled?: boolean;
  targetRoles?: string[];
  rolloutPercent?: number;
}

// ========== SCHOOLS (extended) ==========
export interface JoinSchoolPayload {
  code: string;
}

export interface SchoolStudentRosterItem {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      classLevel: ClassLevel;
    };
  };
}
