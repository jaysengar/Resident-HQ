import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { registerForPushNotifications } from "@/lib/notifications";

export const Route = createFileRoute("/app-login")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: user } = await supabase.from("users").select("role, societies(slug)").eq("id", session.user.id).single();
      const slug = (user as any)?.societies?.slug || "demo";
      if (user?.role === "guard") {
        throw redirect({ to: `/${slug}/guard` });
      } else if (user?.role === "manager") {
        throw redirect({ to: `/${slug}/manager` });
      } else if (user?.role === "admin") {
        throw redirect({ to: `/admin` });
      } else {
        throw redirect({ to: `/${slug}` });
      }
    }
  },
  component: MobileLogin,
});

function MobileLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Request push notification permissions and register token
      if (data.user) {
        try {
          await registerForPushNotifications(data.user.id);
        } catch (e) {
          console.error("Push registration failed", e);
        }

        // Fetch user role and society slug to determine redirect path
        const { data: profile } = await supabase
          .from("users")
          .select("role, societies(slug)")
          .eq("id", data.user.id)
          .single();

        const slug = (profile as any)?.societies?.slug || "demo";
        toast.success("Successfully logged in");

        setTimeout(() => {
          if (profile?.role === "guard") {
            navigate({ to: `/${slug}/guard` });
          } else if (profile?.role === "manager") {
            navigate({ to: `/${slug}/manager` });
          } else if (profile?.role === "admin") {
            navigate({ to: `/admin` });
          } else {
            navigate({ to: `/${slug}` });
          }
        }, 500);
        return;
      }

      toast.success("Successfully logged in");
      setTimeout(() => {
        navigate({ to: "/demo" });
      }, 500);
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-brand/30 relative overflow-hidden">
      {/* Background Image full screen */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[#f0f4f8]/20" />
      </div>

      {/* Header */}
      <div className="px-6 pt-12 pb-6 relative z-10 flex items-center justify-between">
        <Link to="/app" className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-white/50 text-gray-700 hover:bg-white active:scale-95 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm">
          <img src="/textures/logo.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Form Section */}
      <div className="flex-1 px-6 flex flex-col justify-center pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/60 shadow-elevated"
        >
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-600 font-medium mb-8">Sign in to manage your community.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 px-1">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand shadow-sm transition-all"
                  placeholder="resident@society.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 px-1">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand shadow-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button type="button" className="text-sm font-bold text-brand hover:text-brand-hover">
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white font-bold text-lg rounded-2xl py-4 shadow-md flex items-center justify-center gap-2 hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 mt-8"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <LogIn size={20} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
