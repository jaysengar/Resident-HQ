import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppProvider } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantGuard } from "@/components/auth/TenantGuard";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
import { RouteErrorFallback } from "@/components/ui/RouteErrorFallback";
import { registerForPushNotifications } from "@/lib/notifications";
import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { ThemeProvider } from "@/components/ThemeProvider";

export const Route = createFileRoute("/$colonySlug/")({
  head: () => ({
    meta: [{ title: "Resident Panel — Resident HQ Smart Society" }],
  }),
  component: App,
  errorComponent: RouteErrorFallback,
});

function App() {
  const { colonySlug } = Route.useParams();
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.navigate({ to: "/login" });
        return;
      }
      setSessionUser(session.user);
      
      // Auto-register for push notifications if they landed directly here
      registerForPushNotifications(session.user.id).catch(err => console.error(err));
    });
  }, [router]);

  return (
    <TenantGuard expectedSlug={colonySlug}>
      <ProtectedRoute allowedRoles={["resident"]}>
        <SubscriptionGuard colonySlug={colonySlug} role="resident">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppProvider colonySlug={colonySlug}>
              <MainLayout />
            </AppProvider>
          </ThemeProvider>
        </SubscriptionGuard>
      </ProtectedRoute>
    </TenantGuard>
  );
}
