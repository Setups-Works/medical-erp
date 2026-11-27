import { RequireSession } from "@/features/auth/components/RequireSession";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession>
      <AdminShell>{children}</AdminShell>
    </RequireSession>
  );
}
