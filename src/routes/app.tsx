import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, ChevronRight } from "lucide-react";

import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app")({
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
  component: MobileAppLanding,
});

import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { registerForPushNotifications } from "@/lib/notifications";

function MobileAppLanding() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        
        // Ensure push notifications are registered on auto-login too
        registerForPushNotifications(session.user.id).catch(err => console.error("Push registration error", err));

        supabase.from("users").select("role, societies(slug)").eq("id", session.user.id).single()
          .then(({ data: user }) => {
            const slug = (user as any)?.societies?.slug || "demo";
            if (user?.role === "guard") {
              router.navigate({ to: `/${slug}/guard` });
            } else if (user?.role === "manager") {
              router.navigate({ to: `/${slug}/manager` });
            } else if (user?.role === "admin") {
              router.navigate({ to: `/admin` });
            } else {
              router.navigate({ to: `/${slug}` });
            }
          });
      }
    });
  }, [router]);

  return (
    <div className="fixed inset-0 bg-[#f0f4f8] overflow-hidden flex flex-col justify-between selection:bg-brand/30">
      {/* Background Image full screen */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f4f8]/50 to-[#f0f4f8]/20" />
      </div>

      {/* Top Section - Logo */}
      <div className="relative z-10 px-6 pt-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 rounded-3xl shadow-elevated border border-white/50 mb-6"
        >
          <img src="/textures/logo.png" alt="Resident HQ" className="w-16 h-16 object-contain" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Resident HQ</h1>
          <p className="text-gray-700 font-medium text-lg px-4">
            Security & Living, Elevated.
          </p>
        </motion.div>
      </div>

      {/* Bottom Section - Login Button */}
      <div className="relative z-10 w-full px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-elevated w-full"
        >
          <div className="flex items-center gap-3 mb-6 bg-brand/10 p-3 rounded-2xl w-fit">
            <Shield size={20} className="text-brand" />
            <span className="text-sm font-bold text-gray-900">Secure Access</span>
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-8 leading-tight">
            Welcome to<br />your community.
          </h2>

          <Link
            to="/app-login"
            className="w-full flex items-center justify-between bg-brand text-white p-5 rounded-2xl font-bold text-lg shadow-md hover:bg-brand-hover active:scale-95 transition-all"
          >
            <span>Sign In</span>
            <div className="bg-white/20 p-1.5 rounded-xl">
              <ChevronRight size={20} />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
