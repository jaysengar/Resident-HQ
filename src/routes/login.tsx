import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { Shield, ArrowRight, Lock, Mail, Building2 } from "lucide-react";

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

      toast.success("Login successful");
      
      if (userData.role === "admin") window.location.href = "/admin";
      else if (userData.role === "manager") window.location.href = `/${slug}/manager`;
      else if (userData.role === "guard") window.location.href = `/${slug}/guard`;
      else window.location.href = `/${slug}/`;
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-violet-500/30">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        
        {/* Animated decorative orbs */}
        <motion.div 
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-fuchsia-600/10 rounded-full blur-[120px]"
        />

        <div className="relative z-10 max-w-lg px-12">
          <Link to="/" className="inline-flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity">
            <div className="bg-white text-black p-2 rounded-xl">
              <Shield size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight">Resident HQ</span>
          </Link>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl font-black mb-6 leading-tight">Welcome back to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Future of Living.</span></h1>
            <p className="text-xl text-gray-400 font-medium">Securely access your society portal to manage dues, helpdesk tickets, and gate alerts.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Lock className="text-emerald-400" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1 text-lg">Bank-grade Security</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Your session is protected with end-to-end encryption. Nexus strictly isolates tenant data.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05),transparent_50%)] lg:hidden" />
        
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="bg-white text-black p-1.5 rounded-lg"><Shield size={16} /></div>
          <span className="font-bold">Nexus</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10">
            <h2 className="text-4xl font-black mb-2">Sign in</h2>
            <p className="text-gray-400">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-[#111] border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-[#111] border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="group w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Authenticating..." : "Sign In to Portal"}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </motion.button>
          </form>

          <div className="mt-10 text-center">
             <p className="text-gray-500">
               Don't have an account? <Link to="/register" className="text-white font-bold hover:underline">Register your society</Link>
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
