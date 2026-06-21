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
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-between overflow-hidden"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "url('/textures/building-splash.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          
          {/* Subtle dark gradient overlays for cinematic effect */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-black/10 to-black/90" />
          <div className="absolute inset-0 z-0 bg-black/40" />

          {/* Top spacer */}
          <div className="relative z-10 w-full h-32" />

          {/* Center Text (Different from logo) */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            <h1 className="text-5xl font-extrabold tracking-tighter text-white drop-shadow-2xl">
              Resident HQ
            </h1>
            <div className="w-12 h-1 bg-primary/80 rounded-full" />
            <p className="text-white/70 text-sm tracking-widest uppercase font-semibold">
              Smart Society
            </p>
          </motion.div>
          
          {/* Bottom Branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="relative z-10 pb-12 flex flex-col items-center gap-2"
          >
            <p className="text-white/40 text-xs tracking-widest uppercase">
              From
            </p>
            <p className="text-white/90 text-sm tracking-[0.2em] uppercase font-bold">
              CodeWave Systems
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
