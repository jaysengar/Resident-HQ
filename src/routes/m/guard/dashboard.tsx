import { createFileRoute } from "@tanstack/react-router";
import { GuardProvider } from "@/context/GuardContext";
import { GuardLayout } from "@/components/guard/GuardLayout";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/m/guard/dashboard")({
  component: GuardDashboard,
});

function GuardDashboard() {
  const { user } = useAuth();
  
  // Wait until user context is populated
  if (!user || !user.societySlug) {
    return <div className="p-6 text-center text-gray-500">Loading your community...</div>;
  }

  return (
    <GuardProvider colonySlug={user.societySlug}>
      <GuardLayout />
    </GuardProvider>
  );
}
