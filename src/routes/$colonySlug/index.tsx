import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppProvider } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantGuard } from "@/components/auth/TenantGuard";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
import { RouteErrorFallback } from "@/components/ui/RouteErrorFallback";

export const Route = createFileRoute("/$colonySlug/")({
  head: () => ({
    meta: [{ title: "Resident Panel — Resident HQ Smart Society" }],
  }),
  component: App,
  errorComponent: RouteErrorFallback,
});

function App() {
  const { colonySlug } = Route.useParams();

  return (
    <TenantGuard expectedSlug={colonySlug}>
      <ProtectedRoute allowedRoles={["resident"]}>
        <SubscriptionGuard colonySlug={colonySlug} role="resident">
          <AppProvider colonySlug={colonySlug}>
            <MainLayout />
          </AppProvider>
        </SubscriptionGuard>
      </ProtectedRoute>
    </TenantGuard>
  );
}
