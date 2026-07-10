import { Link } from 'react-router-dom';
import { useSubjects } from '../hooks/useEntities';
import { SiteHeader } from '../components/layout/SiteHeader';
import { useAuthContext } from '../context/AuthContext';
import { StudentSidebar } from '../components/layout/StudentSidebar';

export function SubjectsList() {
  const { data: subjects, isLoading, isError } = useSubjects();
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex gap-8">
          {isAuthenticated && <StudentSidebar />}

          <div className="min-w-0 flex-1">
            <div className="mb-6">
              <p className="text-sm text-slate-500">
                <Link to="/subjects" className="hover:text-slate-800">Home</Link>
                <span className="mx-1.5">›</span>
                <span className="font-medium text-slate-800">Subjects</span>
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">All Subjects</h1>
              <p className="mt-1 text-sm text-slate-600">
                Class 11 &amp; 12 Commerce syllabus, mapped to chapters, video lessons and mock tests.
              </p>
            </div>

            {isLoading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                Loading subjects…
              </div>
            )}

            {isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-600">
                Couldn't load subjects. Please try again shortly.
              </div>
            )}

            {!isLoading && subjects && subjects.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No subjects published yet.
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(subjects ?? []).map((subject) => (
                <Link
                  key={subject.id}
                  to={`/subjects/${subject.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                    🏛️
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-700">
                    {subject.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{subject.description}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
                    Explore course →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
