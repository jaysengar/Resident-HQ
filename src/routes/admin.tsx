import { createFileRoute } from "@tanstack/react-router";
import { AdminProvider } from "@/context/AdminContext";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Super Admin — Resident HQ SaaS Control Panel" },
      {
        name: "description",
        content: "Super admin control panel — manage societies, revenue, billing, system logs.",
      },
    ],
  }),
  component: AdminApp,
});

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";

function AdminApp() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated || user?.role !== "admin") {
    return <AdminLogin />;
  }

  return (
    <AdminProvider>
      <AdminLayout />
    </AdminProvider>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if profile exists
      let { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user!.id)
        .maybeSingle();

      if (!userData) {
        // Auto-create admin profile if missing on first login
        if (email.includes("admin")) {
          const { data: newAdmin, error: insertError } = await supabase
            .from("users")
            .insert({
              id: authData.user!.id,
              role: "admin",
              name: "Super Admin",
              email: email,
              phone: "0000000000"
            })
            .select("role")
            .single();

          if (insertError) throw new Error("Could not create admin profile.");
          userData = newAdmin;
        } else {
          throw new Error("Could not fetch user profile details.");
        }
      }

      if (userData.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Unauthorized access. Admin only.");
      }

      toast.success("Admin Login successful");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] rounded-[2rem] bg-card p-8 shadow-2xl border border-border"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Super Admin Access</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage colonies</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-foreground uppercase tracking-wider opacity-80">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="admin@residenthq.io"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-foreground uppercase tracking-wider opacity-80">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="mt-4 flex w-full items-center justify-center rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Authorize"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
