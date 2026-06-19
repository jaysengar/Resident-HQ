import { createFileRoute } from "@tanstack/react-router";
import { ManagerProvider } from "@/context/ManagerContext";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantGuard } from "@/components/auth/TenantGuard";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
import { RouteErrorFallback } from "@/components/ui/RouteErrorFallback";

export const Route = createFileRoute("/$colonySlug/manager")({
  head: () => ({
    meta: [{ title: "Manager Panel — Resident HQ Smart Society" }],
  }),
  component: ManagerApp,
  errorComponent: RouteErrorFallback,
});

function ManagerApp() {
  const { colonySlug } = Route.useParams();

  return (
    <TenantGuard expectedSlug={colonySlug}>
      <ProtectedRoute allowedRoles={["manager"]}>
        <SubscriptionGuard colonySlug={colonySlug} role="manager">
          <ManagerProvider colonySlug={colonySlug}>
            <ManagerLayout />
          </ManagerProvider>
        </SubscriptionGuard>
      </ProtectedRoute>
    </TenantGuard>
  );
}
