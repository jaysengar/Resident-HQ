import { createFileRoute } from "@tanstack/react-router";
import { GuardProvider } from "@/context/GuardContext";
import { GuardLayout } from "@/components/guard/GuardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantGuard } from "@/components/auth/TenantGuard";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
import { RouteErrorFallback } from "@/components/ui/RouteErrorFallback";

export const Route = createFileRoute("/$colonySlug/guard")({
  head: () => ({
    meta: [{ title: "Guard Panel — Resident HQ Smart Society" }],
  }),
  component: GuardApp,
  errorComponent: RouteErrorFallback,
});

function GuardApp() {
  const { colonySlug } = Route.useParams();

  return (
    <TenantGuard expectedSlug={colonySlug}>
      <ProtectedRoute allowedRoles={["guard"]}>
        <SubscriptionGuard colonySlug={colonySlug} role="guard">
          <GuardProvider colonySlug={colonySlug}>
            <GuardLayout />
          </GuardProvider>
        </SubscriptionGuard>
      </ProtectedRoute>
    </TenantGuard>
  );
}
