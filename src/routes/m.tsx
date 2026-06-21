import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MobileNav } from "@/components/MobileNav";

export const Route = createFileRoute("/m")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/app-login" });
    }
  },
  component: MobileLayout,
});

function MobileLayout() {
  const [role, setRole] = useState<"resident" | "guard" | null>(null);

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
        
      if (profile) {
        setRole(profile.role as "resident" | "guard");
      }
    }
    fetchRole();
  }, []);

  if (!role) {
    return <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#f0f4f8] overflow-hidden selection:bg-brand/30 pb-20">
      {/* Universal Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f4f8] to-white/50" />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <MobileNav role={role} />
    </div>
  );
}
