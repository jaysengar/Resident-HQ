import { createFileRoute } from "@tanstack/react-router";
import { AppProvider } from "@/context/AppContext";
import { HomeView } from "@/components/views/HomeView";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/m/resident/dashboard")({
  component: ResidentDashboard,
});

function ResidentDashboard() {
  const { user } = useAuth();
  
  // Wait until user context is populated
  if (!user || !user.societySlug) {
    return <div className="p-6 text-center text-gray-500">Loading your community...</div>;
  }

  return (
    <AppProvider colonySlug={user.societySlug}>
      <HomeView />
    </AppProvider>
  );
}
