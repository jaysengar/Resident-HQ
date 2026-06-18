import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Shield,
  MapPin,
  Phone,
  Mail,
  Users,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { getSocietyBranding } from "@/lib/api/api";
import React from "react";

export const Route = createFileRoute("/$colonySlug/public")({
  component: ColonyPublicPage,
});

// --- Premium Tilt Card Component ---
export function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const smoothX = useSpring(rotateX, {
    stiffness: 150,
    damping: 15,
  });

  const smoothY = useSpring(rotateY, {
    stiffness: 150,
    damping: 15,
  });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    rotateY.set((x - centerX) / 20);
    rotateX.set(-(y - centerY) / 20);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX: smoothX,
        rotateY: smoothY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const reveal = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: -10,
  },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.8,
      type: "spring",
    },
  },
};

function ColonyPublicPage() {
  const { colonySlug } = Route.useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<number>(0);

  useEffect(() => {
    getSocietyBranding(colonySlug)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [colonySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 font-bold tracking-widest uppercase">Initializing Environment...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <Shield size={40} className="text-zinc-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Society Not Found</h1>
        <p className="text-zinc-500 mb-6">The workspace "{colonySlug}" does not exist.</p>
        <Link to="/" className="text-violet-400 hover:underline font-bold">Go Home</Link>
      </div>
    );
  }

  const { society, branding } = data;
  const primaryColor = branding?.primary_color || society?.primary_color || "#6d28d9";
  const photos = branding?.society_photos || [];

  return (
    <div
      className="min-h-screen text-white overflow-hidden relative"
      style={{
        background: "radial-gradient(circle at top,#18181b 0%,#050505 60%,#000000 100%)",
        perspective: "2500px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Floating Animated Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full blur-[180px]"
          style={{ background: `${primaryColor}25` }}
        />
        <motion.div
          animate={{
            x: [0, -120, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute right-0 top-0 w-[800px] h-[800px] rounded-full bg-blue-500/10 blur-[200px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
          className="absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[160px]"
        />

        {/* Particles */}
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Navbar overlay */}
      <div className="relative z-50 flex items-center justify-between px-6 md:px-12 py-6">
        <Link to="/" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
          <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/10 group-hover:bg-white/10 transition-colors">
            <Shield size={18} />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase hidden sm:block">{society.name}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to={`/${colonySlug}/login`}
            className="text-sm font-bold bg-white/5 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/10 hover:bg-white/10 transition-all shadow-lg"
          >
            Access Portal
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-12 pb-24">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20 mb-24">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="relative shrink-0"
          >
            <div
              className="absolute inset-0 blur-3xl"
              style={{ background: primaryColor, opacity: 0.4 }}
            />
            <img
              src={branding?.logo_url || society?.logo_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"}
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-[32px] border border-white/20 shadow-2xl object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center md:text-left"
          >
            <motion.h1
              initial={{ rotateX: -30, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="text-5xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent leading-tight pb-2"
            >
              {society.name}
            </motion.h1>
            <p className="mt-5 text-xl md:text-2xl text-zinc-400 max-w-2xl font-medium">
              {branding?.tagline || "Experience the next generation of community living."}
            </p>
          </motion.div>
        </div>

        {/* Info Cards */}
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24"
        >
          <TiltCard>
            <motion.div
              whileHover={{ scale: 1.03, y: -10 }}
              className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-7 shadow-[0_20px_100px_rgba(0,0,0,0.45)] h-full"
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: `linear-gradient(135deg, ${primaryColor}40, transparent)` }}
              />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${primaryColor}25` }}>
                  <MapPin size={24} style={{ color: primaryColor }} />
                </div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mb-2">Location</p>
                <p className="text-lg text-white font-medium">{society.address || "Not specified"}</p>
              </div>
            </motion.div>
          </TiltCard>

          {branding?.contact_phone && (
            <TiltCard>
              <motion.div
                whileHover={{ scale: 1.03, y: -10 }}
                className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-7 shadow-[0_20px_100px_rgba(0,0,0,0.45)] h-full"
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}40, transparent)` }}
                />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${primaryColor}25` }}>
                    <Phone size={24} style={{ color: primaryColor }} />
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mb-2">Contact</p>
                  <p className="text-lg text-white font-medium">{branding.contact_phone}</p>
                </div>
              </motion.div>
            </TiltCard>
          )}

          {branding?.contact_email && (
            <TiltCard>
              <motion.div
                whileHover={{ scale: 1.03, y: -10 }}
                className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-7 shadow-[0_20px_100px_rgba(0,0,0,0.45)] h-full"
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}40, transparent)` }}
                />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${primaryColor}25` }}>
                    <Mail size={24} style={{ color: primaryColor }} />
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mb-2">Email</p>
                  <p className="text-lg text-white font-medium">{branding.contact_email}</p>
                </div>
              </motion.div>
            </TiltCard>
          )}
        </motion.div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="text-3xl font-black mb-8 tracking-tight">Gallery</h2>

            <motion.div
              layout
              whileHover={{ scale: 1.02 }}
              className="rounded-[40px] overflow-hidden border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.6)] aspect-video mb-6 relative"
            >
              <motion.img
                key={selectedPhoto}
                src={photos[selectedPhoto]}
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {photos.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {photos.map((url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPhoto(i)}
                    className={`shrink-0 w-32 h-24 rounded-2xl overflow-hidden border-2 transition-all ${selectedPhoto === i
                        ? "border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        : "border-white/10 opacity-50 hover:opacity-100"
                      }`}
                  >
                    <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Login CTAs */}
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <TiltCard>
            <Link to={`/${colonySlug}/login`} className="block h-full">
              <motion.div
                whileHover={{ y: -15, scale: 1.03 }}
                className="group relative overflow-hidden p-8 rounded-[36px] bg-white/[0.04] backdrop-blur-3xl border border-white/10 h-full flex flex-col justify-between"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, ${primaryColor}20, transparent 70%)` }}
                />

                <div className="relative z-10 flex items-start justify-between mb-12">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: `${primaryColor}25` }}>
                    <Users size={28} style={{ color: primaryColor }} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Resident Portal</h3>
                  <p className="text-zinc-400 font-medium">Access your flat dashboard, clear dues securely, and connect with your community.</p>
                </div>
              </motion.div>
            </Link>
          </TiltCard>

          <TiltCard>
            <Link to={`/${colonySlug}/login`} className="block h-full">
              <motion.div
                whileHover={{ y: -15, scale: 1.03 }}
                className="group relative overflow-hidden p-8 rounded-[36px] bg-white/[0.04] backdrop-blur-3xl border border-white/10 h-full flex flex-col justify-between"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, #8b5cf620, transparent 70%)` }}
                />

                <div className="relative z-10 flex items-start justify-between mb-12">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-violet-500/20">
                    <ShieldCheck size={28} className="text-violet-400" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Manager Portal</h3>
                  <p className="text-zinc-400 font-medium">Control society operations, track helpdesk tickets, and oversee security logs.</p>
                </div>
              </motion.div>
            </Link>
          </TiltCard>
        </motion.div>

      </div>
    </div>
  );
}
