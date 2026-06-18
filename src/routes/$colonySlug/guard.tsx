import { createFileRoute } from "@tanstack/react-router";
import { GuardProvider } from "@/context/GuardContext";
import { GuardLayout } from "@/components/guard/GuardLayout";

export const Route = createFileRoute("/$colonySlug/guard")({
  head: () => ({
    meta: [{ title: "Guard Panel — Resident HQ Smart Society" }],
  }),
  component: GuardApp,
});

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantGuard } from "@/components/auth/TenantGuard";

function GuardApp() {
  const { colonySlug } = Route.useParams();

  return (
    <TenantGuard expectedSlug={colonySlug}>
      <ProtectedRoute allowedRoles={["guard"]}>
        <GuardProvider colonySlug={colonySlug}>
          <GuardLayout />
        </GuardProvider>
      </ProtectedRoute>
    </TenantGuard>
  );
}
