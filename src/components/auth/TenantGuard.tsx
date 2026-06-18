import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "@tanstack/react-router";

export function TenantGuard({ children, expectedSlug }: { children: ReactNode; expectedSlug: string }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // If not authenticated and not on login page, redirect to global login
      // but append redirect url so they come back if needed
      window.location.href = `/login`;
      return;
    }

    if (user && user.role !== "admin") {
      // Admin can access any slug, but regular users must match
      if (user.societySlug && user.societySlug !== expectedSlug) {
        // User is trying to access another society's page
        window.location.href = `/${user.societySlug}/`;
      }
    }
  }, [user, isAuthenticated, isLoading, expectedSlug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Prevent rendering children while we redirect
  if (!isAuthenticated || (user && user.role !== "admin" && user.societySlug !== expectedSlug)) {
    return null;
  }

  return <>{children}</>;
}
