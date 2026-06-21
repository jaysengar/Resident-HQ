import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@tanstack/react-router";

export function CustomSplashScreen() {
  const [show, setShow] = useState(true);
  const location = useLocation();

  // Only show the custom splash screen on /app or /m or /app-login routes
  const isAppRoute = location.pathname.startsWith('/app') || location.pathname.startsWith('/m');

  useEffect(() => {
    // Check if we already showed it this session so we don't annoy the user
    const hasShown = sessionStorage.getItem('splashShown');
    
    if (isAppRoute && !hasShown) {
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem('splashShown', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isAppRoute]);

  if (!isAppRoute) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#0d1b2a] flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: "url('/textures/splash.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Subtle dark overlay for contrast */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Frosted glass R logo container */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1, type: "spring" }}
            className="relative z-10 w-32 h-32 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center"
          >
            <div className="text-6xl font-bold bg-gradient-to-br from-cyan-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              R
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 text-white/60 text-sm tracking-[0.2em] uppercase"
          >
            ResidentHQ
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
