import { createFileRoute } from "@tanstack/react-router";
import { ManagerProvider } from "@/context/ManagerContext";
import { ManagerLayout } from "@/components/manager/ManagerLayout";

export const Route = createFileRoute("/$colonySlug/manager")({
  head: () => ({
    meta: [{ title: "Manager Panel — Resident HQ Smart Society" }],
  }),
  component: ManagerApp,
});

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantGuard } from "@/components/auth/TenantGuard";

function ManagerApp() {
  const { colonySlug } = Route.useParams();

  return (
    <TenantGuard expectedSlug={colonySlug}>
      <ProtectedRoute allowedRoles={["manager"]}>
        <ManagerProvider colonySlug={colonySlug}>
          <ManagerLayout />
        </ManagerProvider>
      </ProtectedRoute>
    </TenantGuard>
  );
}
