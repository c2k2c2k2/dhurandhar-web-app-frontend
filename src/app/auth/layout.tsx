import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/lib/auth/AuthProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
