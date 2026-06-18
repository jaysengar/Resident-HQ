import { useAuth } from "@/context/AuthContext";
import { Navigate, useParams } from "@tanstack/react-router";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  // Using an unsafe cast here since we know the route has colonySlug
  // Alternatively, just pass it down as a prop if we want strict typing
  const params = useParams({ strict: false });
  const colonySlug = params.colonySlug as string;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/$colonySlug/login" params={{ colonySlug }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are logged in but wrong role, redirect to their proper dashboard
    if (user.role === "manager")
      return <Navigate to="/$colonySlug/manager" params={{ colonySlug }} replace />;
    if (user.role === "guard")
      return <Navigate to="/$colonySlug/guard" params={{ colonySlug }} replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/$colonySlug/" params={{ colonySlug }} replace />;
  }

  return <>{children}</>;
}
