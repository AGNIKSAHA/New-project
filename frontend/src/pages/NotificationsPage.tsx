import toast from "react-hot-toast";
import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount
} from "../features/notifications/notificationHooks";
import { Loader } from "../components/Loader";

export const NotificationsPage = () => {
  const notificationsQuery = useNotifications(true);
  const unreadQuery = useUnreadNotificationsCount(true);
  const markRead = useMarkNotificationRead();

  if (notificationsQuery.isLoading || unreadQuery.isLoading) {
    return <Loader label="Loading notifications..." />;
  }

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadQuery.data?.count ?? 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold">Notifications ({unreadCount} unread)</h1>
      <div className="mt-4 space-y-3">
        {notifications.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 p-4">
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-slate-600">{item.message}</p>
            <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
            {!item.isRead && (
              <button
                type="button"
                className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                disabled={markRead.isPending}
                onClick={async () => {
                  try {
                    await markRead.mutateAsync(item.id);
                  } catch {
                    toast.error("Could not mark as read");
                  }
                }}
              >
                Mark Read
              </button>
            )}
          </div>
        ))}
        {notifications.length === 0 && <p className="text-sm text-slate-600">No notifications.</p>}
      </div>
    </section>
  );
};
