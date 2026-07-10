import { Link } from 'react-router-dom';
import { SiteHeader } from '../components/layout/SiteHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import { useAuthContext } from '../context/AuthContext';
import { useOlympiads } from '../hooks/useEntities';
import type { OlympiadStatus } from '../types/entities.types';

const statusStyles: Record<OlympiadStatus, string> = {
  UPCOMING: 'bg-slate-100 text-slate-600',
  REGISTRATION_OPEN: 'bg-green-50 text-green-700',
  ONGOING: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
};

export function OlympiadsList() {
  const { isAuthenticated } = useAuthContext();
  const { data: olympiads, isLoading } = useOlympiads();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex gap-8">
          {isAuthenticated && <StudentSidebar />}

          <div className="min-w-0 flex-1 space-y-6">
            <div>
              <p className="text-sm text-slate-500">
                <Link to="/subjects" className="hover:text-slate-800">Home</Link>
                <span className="mx-1.5">›</span>
                <span className="font-medium text-slate-800">Olympiads</span>
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">National Olympiads</h1>
              <p className="mt-1 text-sm text-slate-600">
                Compete nationally, get ranked against students across India, and win scholarships.
              </p>
            </div>

            {isLoading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                Loading olympiads…
              </div>
            )}

            {!isLoading && (olympiads ?? []).length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No olympiads scheduled right now — check back soon.
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {(olympiads ?? []).map((o) => (
                <Link
                  key={o.id}
                  to={`/olympiads/${o.id}`}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${statusStyles[o.status as OlympiadStatus] ?? statusStyles.UPCOMING}`}>
                      {o.status.replace('_', ' ')}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-slate-900">{o.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Exam Date: {new Date(o.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">₹{o.registrationFee}</span>
                    <span className="text-sm font-semibold text-blue-600">View details →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
