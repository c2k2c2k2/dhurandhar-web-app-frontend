import { NotificationsSubNav } from "@/modules/notifications/NotificationsSubNav";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <NotificationsSubNav />
      {children}
    </div>
  );
}
