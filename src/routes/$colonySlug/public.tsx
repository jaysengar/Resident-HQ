import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Shield,
  MapPin,
  Phone,
  Mail,
  Users,
  ChevronRight,
  ShieldCheck,
  Building2,
  X,
  ChevronLeft,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { getSocietyBranding } from "@/lib/api/api";
import React from "react";

export const Route = createFileRoute("/$colonySlug/public")({
  head: () => ({
    meta: [
      { title: "Society Portal — Resident HQ" },
      {
        name: "description",
        content:
          "Access your society portal. View information, login as resident or manager.",
      },
    ],
  }),
  component: ColonyPublicPage,
});

/* ─── Premium Tilt Card ─── */
export function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothX = useSpring(rotateX, { stiffness: 150, damping: 15 });
  const smoothY = useSpring(rotateY, { stiffness: 150, damping: 15 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    rotateY.set((x - rect.width / 2) / 20);
    rotateX.set(-(y - rect.height / 2) / 20);
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

/* ─── Loading Skeleton ─── */
function PublicPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navbar skeleton */}
      <div className="flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="w-32 h-4 rounded-full bg-white/5 animate-pulse hidden sm:block" />
        </div>
        <div className="w-28 h-10 rounded-full bg-white/5 animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-12">
        {/* Hero skeleton */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
          <div className="w-36 h-36 rounded-[32px] bg-white/5 animate-pulse shrink-0" />
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="h-12 md:h-20 bg-white/5 rounded-2xl animate-pulse max-w-lg" />
            <div className="h-6 bg-white/5 rounded-full animate-pulse max-w-md" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Gallery skeleton */}
        <div className="h-80 rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse mb-24" />

        {/* CTA cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse" />
          <div
            className="h-56 rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse"
            style={{ animationDelay: "0.1s" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
function ColonyPublicPage() {
  const { colonySlug } = Route.useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    getSocietyBranding(colonySlug)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [colonySlug]);

  if (loading) return <PublicPageSkeleton />;

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Building2 size={36} className="text-zinc-600" />
          </div>
          <h1 className="text-3xl font-black mb-3">Society Not Found</h1>
          <p className="text-zinc-500 mb-8 max-w-md">
            The workspace "{colonySlug}" does not exist or has been
            deactivated.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-bold transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Resident HQ
          </Link>
        </motion.div>
      </div>
    );
  }

  const { society, branding } = data;
  const primaryColor =
    branding?.primary_color || society?.primary_color || "#6d28d9";
  const photos = branding?.society_photos || [];

  return (
    <div
      className="min-h-screen text-white overflow-hidden relative"
      style={{
        background:
          "radial-gradient(circle at top, #18181b 0%, #050505 60%, #000000 100%)",
        perspective: "2500px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-[180px]"
          style={{ background: `${primaryColor}20` }}
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute right-0 top-0 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full bg-blue-500/8 blur-[200px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[160px]"
          style={{ background: `${primaryColor}10` }}
        />

        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <Link
          to="/"
          className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
        >
          <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/10 group-hover:bg-white/10 transition-colors">
            <Shield size={18} />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold tracking-wide block">
              {society.name}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Powered by Resident HQ
            </span>
          </div>
        </Link>
        <Link
          to={`/${colonySlug}/login`}
          className="text-sm font-bold text-white px-6 py-2.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all shadow-lg flex items-center gap-2"
        >
          Access Portal
          <ChevronRight size={14} />
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-16 pb-24">
        {/* Hero */}
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative shrink-0"
          >
            {/* Logo glow */}
            <div
              className="absolute inset-0 blur-[60px] rounded-full"
              style={{ background: primaryColor, opacity: 0.3 }}
            />
            {branding?.banner_url ? (
              <div className="absolute -inset-8 rounded-[40px] overflow-hidden opacity-20 blur-sm">
                <img
                  src={branding.banner_url}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            ) : null}
            <motion.img
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              src={
                branding?.logo_url ||
                society?.logo_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(society.name)}&size=200&background=6d28d9&color=fff&bold=true&font-size=0.35`
              }
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-[32px] border-2 border-white/15 shadow-2xl object-cover"
              alt={society.name}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center md:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60 uppercase tracking-widest mb-4"
            >
              <Sparkles size={12} style={{ color: primaryColor }} />
              Verified Community
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05] mb-4">
              {society.name}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-xl font-medium">
              {branding?.tagline ||
                "Experience the next generation of community living."}
            </p>
            {society.address && (
              <div className="flex items-center gap-2 mt-4 text-sm text-zinc-500 justify-center md:justify-start">
                <MapPin size={14} style={{ color: primaryColor }} />
                {society.address}
              </div>
            )}
          </motion.div>
        </div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-28"
        >
          <InfoCard
            icon={MapPin}
            label="Location"
            value={society.address || "Not specified"}
            primaryColor={primaryColor}
          />
          {branding?.contact_phone && (
            <InfoCard
              icon={Phone}
              label="Contact"
              value={branding.contact_phone}
              primaryColor={primaryColor}
            />
          )}
          {branding?.contact_email && (
            <InfoCard
              icon={Mail}
              label="Email"
              value={branding.contact_email}
              primaryColor={primaryColor}
            />
          )}
        </motion.div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-28"
          >
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-1 h-6 rounded-full"
                style={{ background: primaryColor }}
              />
              <h2 className="text-2xl font-black tracking-tight">Gallery</h2>
            </div>

            {/* Main image */}
            <motion.div
              layout
              className="rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.5)] aspect-video mb-5 relative cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedPhoto}
                  src={photos[selectedPhoto]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                  alt={`Society photo ${selectedPhoto + 1}`}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ExternalLink
                  size={32}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </motion.div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {photos.map((url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPhoto(i)}
                    className={`shrink-0 w-24 h-16 md:w-32 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedPhoto === i
                        ? "border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        : "border-white/10 opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxOpen && photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                onClick={() => setLightboxOpen(false)}
              >
                <X size={20} />
              </button>
              <motion.img
                key={selectedPhoto}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={photos[selectedPhoto]}
                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
                alt="Gallery fullscreen"
                onClick={(e) => e.stopPropagation()}
              />
              {photos.length > 1 && (
                <>
                  <button
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(
                        (prev) => (prev - 1 + photos.length) % photos.length
                      );
                    }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(
                        (prev) => (prev + 1) % photos.length
                      );
                    }}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portal Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <TiltCard>
            <Link to={`/${colonySlug}/login`} className="block h-full">
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative overflow-hidden p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 h-full flex flex-col justify-between transition-all hover:border-white/20"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at center, ${primaryColor}15, transparent 70%)`,
                  }}
                />

                <div className="relative z-10 flex items-start justify-between mb-10">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${primaryColor}20` }}
                  >
                    <Users size={26} style={{ color: primaryColor }} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    Resident Portal
                  </h3>
                  <p className="text-zinc-400 font-medium leading-relaxed">
                    Access your flat dashboard, pay dues, manage visitors, and
                    stay connected with your community.
                  </p>
                </div>
              </motion.div>
            </Link>
          </TiltCard>

          <TiltCard>
            <Link to={`/${colonySlug}/login`} className="block h-full">
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative overflow-hidden p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 h-full flex flex-col justify-between transition-all hover:border-white/20"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08),transparent_70%)]" />

                <div className="relative z-10 flex items-start justify-between mb-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-violet-500/15">
                    <ShieldCheck size={26} className="text-violet-400" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    Manager Portal
                  </h3>
                  <p className="text-zinc-400 font-medium leading-relaxed">
                    Manage society operations, track financials, resolve
                    helpdesk tickets, and oversee security.
                  </p>
                </div>
              </motion.div>
            </Link>
          </TiltCard>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center bg-black/30 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 text-zinc-600 text-sm">
          <Shield size={14} className="text-violet-500/50" />
          <span>
            Powered by{" "}
            <Link
              to="/"
              className="text-zinc-400 hover:text-white transition-colors font-semibold"
            >
              Resident HQ
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ─── Info Card ─── */
function InfoCard({
  icon: Icon,
  label,
  value,
  primaryColor,
}: {
  icon: any;
  label: string;
  value: string;
  primaryColor: string;
}) {
  return (
    <TiltCard>
      <motion.div
        whileHover={{ scale: 1.02, y: -6 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-[0_10px_40px_rgba(0,0,0,0.3)] h-full transition-all hover:border-white/20"
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}30, transparent)`,
          }}
        />
        <div className="relative z-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: `${primaryColor}20` }}
          >
            <Icon size={22} style={{ color: primaryColor }} />
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-2">
            {label}
          </p>
          <p className="text-base text-white font-medium leading-relaxed">
            {value}
          </p>
        </div>
      </motion.div>
    </TiltCard>
  );
}
