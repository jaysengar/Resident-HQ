import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { Shield, ArrowRight, Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: GlobalLogin,
});

function GlobalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      let { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, societies(slug)")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (!userData) {
        if (email.includes("admin")) {
          const { data: newAdmin, error: insertError } = await supabase
            .from("users")
            .insert({
              id: authData.user.id,
              role: "admin",
              name: "Super Admin",
              email: email,
              phone: "0000000000"
            })
            .select("role, societies(slug)")
            .single();

          if (insertError) throw new Error("Could not create admin profile.");
          userData = newAdmin;
        } else {
          throw new Error("Could not fetch user profile details.");
        }
      }

      const slug = userData.societies?.slug;
      
      if (!slug && userData.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("No society assigned to your account.");
      }

      // Try to register for push notifications (fails silently on web, succeeds on Android/iOS via Capacitor)
      try {
        const { registerForPushNotifications } = await import("@/lib/notifications");
        await registerForPushNotifications(authData.user.id);
      } catch (e) {
        console.error("Push notification registration skipped", e);
      }

      toast.success("Login successful");
      
      if (userData.role === "admin") window.location.href = "/admin";
      else if (userData.role === "manager") window.location.href = `/${slug}/manager`;
      else if (userData.role === "guard") window.location.href = `/${slug}/guard`;
      else window.location.href = `/${slug}`;
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] text-gray-900 selection:bg-brand/30">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-r border-gray-200 bg-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
        
        {/* Frosted Glass Content Box */}
        <div className="relative z-10 w-full max-w-lg p-10 mx-12 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/50 shadow-elevated">
          <Link to="/" className="inline-flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity">
            <img src="/textures/logo.png" alt="Resident HQ Logo" className="w-10 h-10 object-contain drop-shadow-md" />
            <span className="text-2xl font-black tracking-tight text-gray-900">Resident HQ</span>
          </Link>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-4xl xl:text-5xl font-black mb-4 leading-tight text-gray-900">Welcome back to the <span className="text-brand">Future of Living.</span></h1>
            <p className="text-lg text-gray-700 font-medium">Securely access your society portal to manage dues, helpdesk tickets, and gate alerts.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.5 }}
            className="mt-10 p-5 rounded-2xl bg-white border border-white/50 shadow-sm flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <Lock className="text-brand" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1 text-base">Bank-grade Security</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Your session is protected with end-to-end encryption.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative bg-[#f0f4f8] lg:bg-transparent">
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <img src="/textures/logo.png" alt="Resident HQ Logo" className="w-6 h-6 object-contain" />
          <span className="font-bold text-gray-900">Nexus</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10 bg-white p-8 sm:p-10 rounded-3xl shadow-elevated border border-gray-200"
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black mb-2 text-gray-900">Sign in</h2>
            <p className="text-gray-500">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-bold text-brand hover:text-brand-hover transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="group w-full flex items-center justify-center gap-2 bg-brand text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-hover transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Authenticating..." : "Sign In"}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-gray-500 text-sm">
               Don't have an account? <Link to="/register" className="text-brand font-bold hover:underline">Register your society</Link>
             </p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {forgotOpen && <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
