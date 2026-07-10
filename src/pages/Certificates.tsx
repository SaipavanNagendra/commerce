import { SiteHeader } from '../components/layout/SiteHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import { useDownloadCertificate, useMyCertificates } from '../hooks/usePayments';

const typeLabels: Record<string, string> = {
  OLYMPIAD_PARTICIPATION: 'Olympiad Participation',
  OLYMPIAD_RANK: 'Olympiad Rank Certificate',
  COURSE_COMPLETION: 'Course Completion',
};

export function Certificates() {
  const { data: certificates, isLoading } = useMyCertificates();
  const download = useDownloadCertificate();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex gap-8">
          <StudentSidebar />

          <div className="min-w-0 flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Certificates</h1>
              <p className="mt-1 text-sm text-slate-600">
                Certificates for olympiads and completed courses appear here once generated.
              </p>
            </div>

            {isLoading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                Loading certificates…
              </div>
            )}

            {!isLoading && (certificates ?? []).length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No certificates yet — complete an olympiad or course to earn one.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(certificates ?? []).map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl">
                      🎓
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {typeLabels[cert.type] ?? cert.type}
                      </p>
                      <p className="text-xs text-slate-500">
                        Issued {new Date(cert.issuedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => download.mutate(cert.id)}
                    disabled={download.isPending}
                    className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
