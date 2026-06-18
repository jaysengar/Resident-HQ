import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { useSocietyTheme } from "@/hooks/useSocietyTheme";
import { Shield, ArrowRight, Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/$colonySlug/login")({
  component: ColonyLogin,
});

function ColonyLogin() {
  const { colonySlug } = Route.useParams();
  const society = useSocietyTheme(colonySlug);
  
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

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("society_id, role, societies!inner(slug)")
        .eq("id", authData.user.id)
        .single();

      if (userError || !userData) {
        throw new Error("Could not fetch user profile details.");
      }

      if (userData.societies.slug !== colonySlug) {
        await supabase.auth.signOut();
        throw new Error(`You do not have access to colony '${colonySlug}'.`);
      }

      toast.success("Login successful");
      if (userData.role === "manager") {
        window.location.href = `/${colonySlug}/manager`;
      } else if (userData.role === "guard") {
        window.location.href = `/${colonySlug}/guard`;
      } else {
        window.location.href = `/${colonySlug}/`;
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const hasLogo = !!society?.logo_url;
  const displayName = society?.name ? society.name : colonySlug;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-white/30">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        
        {/* Animated decorative orbs */}
        <motion.div 
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] opacity-20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-white/5 rounded-full blur-[120px]"
        />

        <div className="relative z-10 max-w-lg px-12">
          <div className="inline-flex items-center gap-4 mb-12 bg-white/5 backdrop-blur-md p-3 pr-6 rounded-2xl border border-white/10">
            {hasLogo ? (
              <img src={society.logo_url} alt={displayName} className="h-10 w-10 object-contain rounded-lg bg-white" />
            ) : (
              <div className="bg-white text-black p-2 rounded-xl">
                <Shield size={24} />
              </div>
            )}
            <span className="text-xl font-bold tracking-tight capitalize">{displayName}</span>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl font-black mb-6 leading-tight">Welcome to your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Resident Portal.</span></h1>
            <p className="text-xl text-gray-400 font-medium">Access your personalized dashboard, manage guests, and stay connected with your community.</p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center p-6 md:p-12 relative overflow-y-auto max-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_50%)] lg:hidden pointer-events-none" />
        
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
          {hasLogo ? (
            <img src={society.logo_url} alt={displayName} className="h-8 w-8 object-contain rounded-lg bg-white" />
          ) : (
            <div className="bg-white text-black p-1.5 rounded-lg"><Shield size={16} /></div>
          )}
          <span className="font-bold capitalize">{displayName}</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md mx-auto relative z-10 py-12 lg:py-0"
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
                  className="w-full pl-11 pr-4 py-4 bg-[#111] border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
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
                  className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
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
                  className="w-full pl-11 pr-4 py-4 bg-[#111] border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="group w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-[0_0_20px_var(--primary)] shadow-[var(--primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {loading ? "Authenticating..." : "Sign In"}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {forgotOpen && <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
