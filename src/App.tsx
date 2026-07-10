import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Public / Student Pages
import { SubjectsList } from './pages/SubjectsList';
import { SubjectDetail } from './pages/SubjectDetail';
import { LessonPage } from './pages/Lesson';
import { StudentDashboard } from './pages/StudentDashboard';
import { AccountSettings } from './pages/AccountSettings';
import { ComingSoon } from './pages/ComingSoon';
import { TestsList } from './pages/TestsList';
import { TestAttempt } from './pages/TestAttempt';
import { TestResultPage } from './pages/TestResult';
import { OlympiadsList } from './pages/OlympiadsList';
import { OlympiadDetail } from './pages/OlympiadDetail';
import { Notifications } from './pages/Notifications';
import { Subscriptions } from './pages/Subscriptions';
import { Certificates } from './pages/Certificates';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { Subjects } from './pages/Subjects';
import { ChaptersManagement } from './pages/ChaptersManagement';
import { LessonsManagement } from './pages/LessonsManagement';
import { NotesManagement } from './pages/NotesManagement';
import { QuestionsManagement } from './pages/QuestionsManagement';
import { TestsManagement } from './pages/TestsManagement';
import { OlympiadManagement } from './pages/OlympiadManagement';
import { SchoolsManagement } from './pages/SchoolsManagement';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/subjects" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Public course browsing */}
            <Route path="/subjects" element={<SubjectsList />} />
            <Route path="/subjects/:slug" element={<SubjectDetail />} />
            <Route path="/lessons/:id" element={<LessonPage />} />
            <Route path="/tests" element={<TestsList />} />
            <Route
              path="/tests/:testId/attempt/:attemptId"
              element={
                <ProtectedRoute>
                  <TestAttempt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tests/:testId/attempts/:attemptId/result"
              element={
                <ProtectedRoute>
                  <TestResultPage />
                </ProtectedRoute>
              }
            />
            <Route path="/olympiads" element={<OlympiadsList />} />
            <Route path="/olympiads/:id" element={<OlympiadDetail />} />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <Subscriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <Certificates />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <ComingSoon title="Practice" description="Topic-wise practice questions are coming soon." />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ComingSoon title="Reports" description="Your performance reports will appear here once you complete a few tests." />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <ProtectedRoute>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/chapters"
              element={
                <ProtectedRoute>
                  <ChaptersManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lessons"
              element={
                <ProtectedRoute>
                  <LessonsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notes"
              element={
                <ProtectedRoute>
                  <NotesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/questions"
              element={
                <ProtectedRoute>
                  <QuestionsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tests"
              element={
                <ProtectedRoute>
                  <TestsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/olympiads"
              element={
                <ProtectedRoute>
                  <OlympiadManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schools"
              element={
                <ProtectedRoute>
                  <SchoolsManagement />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/subjects" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
