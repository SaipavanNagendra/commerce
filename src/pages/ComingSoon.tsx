import { SiteHeader } from '../components/layout/SiteHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex gap-8">
          <StudentSidebar />
          <div className="min-w-0 flex-1">
            <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
