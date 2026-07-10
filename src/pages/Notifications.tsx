import { SiteHeader } from '../components/layout/SiteHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks/useNotifications';

const typeIcon: Record<string, string> = {
  URGENT: '🚨',
  CERTIFICATE: '🎓',
  PAYMENT_SUCCESS: '💳',
};

export function Notifications() {
  const { data, isLoading } = useNotifications({ take: 50 });
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex gap-8">
          <StudentSidebar />

          <div className="min-w-0 flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-60"
              >
                Mark all as read
              </button>
            </div>

            {isLoading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                Loading notifications…
              </div>
            )}

            {!isLoading && (data?.notifications ?? []).length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                You're all caught up — no notifications yet.
              </div>
            )}

            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {(data?.notifications ?? []).map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markRead.mutate(n.id)}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 ${
                    !n.isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <span className="text-lg">{typeIcon[n.type] ?? '🔔'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
