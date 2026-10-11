import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { DataGuard } from "@/components/layout/data-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DataGuard>
        <AppShell>{children}</AppShell>
      </DataGuard>
    </AuthGuard>
  );
}
