import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppProvider } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";

export const Route = createFileRoute("/$colonySlug/")({
  head: () => ({
    meta: [{ title: "Resident Panel — Resident HQ Smart Society" }],
  }),
  component: App,
});

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantGuard } from "@/components/auth/TenantGuard";

function App() {
  const { colonySlug } = Route.useParams();

  return (
    <TenantGuard expectedSlug={colonySlug}>
      <ProtectedRoute allowedRoles={["resident"]}>
        <AppProvider colonySlug={colonySlug}>
          <MainLayout />
        </AppProvider>
      </ProtectedRoute>
    </TenantGuard>
  );
}
