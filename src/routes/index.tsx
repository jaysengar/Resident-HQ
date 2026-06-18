import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { Shield, Building2, Smartphone, Users, Zap, CheckCircle2, ArrowRight, Laptop, Lock, BellRing, Activity, Wallet, Star } from "lucide-react";
import React, { useRef } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden bg-[#020202] selection:bg-violet-500/30 font-sans">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Global Background Layer with Banner */}
      <div className="fixed inset-0 pointer-events-none -z-50">
        <div className="absolute top-0 w-full h-[80vh] bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2500&q=80')] bg-cover bg-center opacity-30 mix-blend-luminosity mask-image:linear-gradient(to_bottom,white,transparent)" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020202]/70 via-[#020202]/95 to-[#020202]" />
        
        {/* Animated glowing orbs for dense look */}
        <motion.div 
          animate={{ x: [-20, 20, -20], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-violet-600/30 rounded-full blur-[100px] md:blur-[150px]" 
        />
        <motion.div 
          animate={{ x: [20, -20, 20], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[5%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-fuchsia-600/20 rounded-full blur-[100px] md:blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-1/2 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-30" />
      </div>

      <Navbar />
      <HeroSection />
      <StatsSection />
      <MarqueeSection />
      <BentoGridSection />
      <CTASection />

      <footer className="border-t border-white/10 py-8 md:py-12 text-center text-gray-500 text-sm md:text-base bg-black/80 backdrop-blur-xl relative z-10 px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-violet-500" />
            <span className="text-lg font-bold text-gray-300">Resident HQ</span>
          </div>
          <span className="hidden md:inline text-gray-700">|</span>
          <p>© 2026 Built for the modern society.</p>
        </div>
      </footer>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-4 md:px-12 backdrop-blur-3xl border-b border-white/10 sticky top-0 z-50 bg-[#000000]/60 supports-[backdrop-filter]:bg-[#000000]/40">
      <div className="flex items-center gap-2 md:gap-3 text-lg md:text-xl font-black tracking-tight">
        <div className="bg-white text-black p-1.5 md:p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          <Shield size={18} className="md:w-5 md:h-5" />
        </div>
        <span className="text-white hidden xs:block">
          Resident HQ
        </span>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors hidden sm:block">
          Resident Login
        </Link>
        <Link
          to="/register"
          className="text-xs md:text-sm font-bold bg-white text-black px-4 py-2 md:px-6 md:py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.8)] hover:scale-105 transition-all"
        >
          Register Society
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.section 
      ref={containerRef}
      style={{ y, opacity }}
      className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 md:pt-32 md:pb-20 relative w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.1, type: "spring" }}
        className="max-w-6xl w-full space-y-6 md:space-y-10 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-violet-200 text-xs md:text-sm font-bold tracking-widest uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <Zap size={14} className="fill-current text-violet-400" />
          <span>The Next Generation OS for Societies</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-[7rem] lg:text-[8rem] font-black tracking-tighter text-white leading-[0.95] drop-shadow-2xl px-2">
          Society Management <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white pb-2 block mt-2">
            Reimagined.
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium mt-6 px-4">
          Everything your residential society needs in one secure, insanely fast, and beautiful platform.
          Replace 10 different apps with <strong className="text-white">Resident HQ</strong>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-8 w-full px-4">
          <Link
            to="/register"
            className="group w-full sm:w-auto px-6 py-4 md:px-10 md:py-5 bg-white text-black rounded-full font-bold text-base md:text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            Onboard Your Society
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-4 md:px-10 md:py-5 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full font-bold text-base md:text-lg hover:bg-white/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            Resident Portal
          </Link>
        </div>
      </motion.div>

      {/* Background Graphic elements to make it "bhara bhara" */}
      <div className="absolute top-1/3 left-[5%] hidden lg:flex flex-col gap-4 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/30 backdrop-blur border border-violet-500/50 flex items-center justify-center -rotate-12">
          <Shield size={28} className="text-violet-300" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-600/30 backdrop-blur border border-blue-500/50 flex items-center justify-center rotate-12 ml-8">
          <Users size={20} className="text-blue-300" />
        </div>
      </div>

      <div className="absolute bottom-1/4 right-[5%] hidden lg:flex flex-col gap-4 animate-pulse" style={{ animationDelay: '1s' }}>
        <div className="w-16 h-16 rounded-2xl bg-orange-600/30 backdrop-blur border border-orange-500/50 flex items-center justify-center rotate-12">
          <Wallet size={28} className="text-orange-300" />
        </div>
        <div className="w-14 h-14 rounded-full bg-emerald-600/30 backdrop-blur border border-emerald-500/50 flex items-center justify-center -rotate-12 mr-10">
          <CheckCircle2 size={24} className="text-emerald-300" />
        </div>
      </div>
    </motion.section>
  );
}

function StatsSection() {
  return (
    <div className="w-full border-y border-white/10 bg-black/50 backdrop-blur-xl py-6 md:py-10 z-20 relative">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
        <div className="flex-1 w-full pt-4 md:pt-0">
          <h3 className="text-3xl md:text-5xl font-black text-white mb-1">50+</h3>
          <p className="text-sm md:text-base text-gray-400 font-medium uppercase tracking-widest">Premium Societies</p>
        </div>
        <div className="flex-1 w-full pt-4 md:pt-0">
          <h3 className="text-3xl md:text-5xl font-black text-white mb-1">10k+</h3>
          <p className="text-sm md:text-base text-gray-400 font-medium uppercase tracking-widest">Happy Residents</p>
        </div>
        <div className="flex-1 w-full pt-4 md:pt-0">
          <h3 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 mb-1">99.9%</h3>
          <p className="text-sm md:text-base text-gray-400 font-medium uppercase tracking-widest">Uptime Reliability</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeSection() {
  return (
    <div className="py-8 md:py-12 border-b border-white/5 bg-[#050505] flex overflow-hidden whitespace-nowrap relative z-20 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 25, repeat: Infinity }}
        className="flex gap-8 md:gap-16 px-4 md:px-8 items-center"
      >
        {[...Array(2)].map((_, i) => (
          <React.Fragment key={i}>
            <MarqueeItem text="SECURE ISOLATION" />
            <span className="text-violet-500 text-xl md:text-2xl">•</span>
            <MarqueeItem text="AUTOMATED BILLING" />
            <span className="text-fuchsia-500 text-xl md:text-2xl">•</span>
            <MarqueeItem text="INSTANT NOTIFICATIONS" />
            <span className="text-orange-500 text-xl md:text-2xl">•</span>
            <MarqueeItem text="COMMUNITY ENGAGEMENT" />
            <span className="text-blue-500 text-xl md:text-2xl">•</span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

function MarqueeItem({ text }: { text: string }) {
  return <span className="text-2xl md:text-5xl font-black text-white/30 uppercase tracking-tight">{text}</span>;
}

function BentoGridSection() {
  return (
    <section className="py-24 md:py-40 px-4 relative z-10 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16 md:mb-24 px-2"
      >
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
          Designed for scale. <br className="hidden md:block"/>
          <span className="text-gray-500">Built for you.</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto lg:auto-rows-[320px]">
        
        {/* Large Feature Card 1 */}
        <BentoCard className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-violet-900/30 to-black p-8 md:p-12 flex flex-col justify-between h-[400px] lg:h-auto">
          <div>
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Shield size={32} className="text-violet-400" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Enterprise-grade Security</h3>
            <p className="text-lg md:text-xl text-gray-400 max-w-md">Strict data isolation between societies. Your resident data is partitioned and encrypted at rest.</p>
          </div>
          <div className="mt-8 relative h-32 md:h-48 overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-inner">
             {/* Fake code block representation */}
             <div className="absolute top-4 left-4 font-mono text-xs md:text-sm text-gray-500 space-y-2 md:space-y-3">
                <p><span className="text-pink-400">const</span> <span className="text-blue-300">tenantIsolation</span> = <span className="text-yellow-200">true</span>;</p>
                <p><span className="text-pink-400">await</span> <span className="text-green-300">enforcePolicies</span>(society.id);</p>
                <p className="text-emerald-400 mt-2 md:mt-4 flex items-center gap-2"><CheckCircle2 size={16}/> Verified Secure Context</p>
             </div>
          </div>
        </BentoCard>

        {/* Small Card 1 */}
        <BentoCard className="bg-gradient-to-br from-blue-900/30 to-black p-8 h-[280px] lg:h-auto">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
            <Smartphone size={24} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Resident App</h3>
          <p className="text-gray-400 leading-relaxed">Helpdesk, Dues, and community feeds directly on your phone.</p>
        </BentoCard>

        {/* Small Card 2 */}
        <BentoCard className="bg-gradient-to-br from-emerald-900/30 to-black p-8 h-[280px] lg:h-auto">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
            <Wallet size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Automated Billing</h3>
          <p className="text-gray-400 leading-relaxed">Generate monthly dues instantly. No manual math required.</p>
        </BentoCard>

        {/* Medium Card */}
        <BentoCard className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-black via-[#111] to-black p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 overflow-hidden min-h-[400px] lg:min-h-0 lg:h-[320px]">
          <div className="flex-1 w-full z-10 relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-6 tracking-widest uppercase">
              <Activity size={14} /> Live Sync
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Gate Management</h3>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl">Guards use a specialized tablet UI to verify entries. Residents receive push notifications before the visitor reaches the door.</p>
          </div>
          <div className="flex-1 w-full relative min-h-[250px] md:h-full mt-6 md:mt-0">
            <div className="absolute md:right-0 top-1/2 -translate-y-1/2 left-0 md:left-auto w-[150%] md:w-[120%] h-[150%] bg-orange-500/10 rounded-full blur-[80px]" />
            <div className="absolute inset-y-0 left-0 right-0 md:left-auto md:right-0 md:w-80 bg-[#111]/80 backdrop-blur-xl border border-white/10 md:border-r-0 md:rounded-l-[2rem] rounded-2xl p-6 shadow-2xl flex flex-col justify-center gap-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 shadow-sm">
                 <div className="w-12 h-12 rounded-full bg-orange-500/20 animate-pulse" />
                 <div className="flex-1 space-y-2">
                   <div className="h-3 bg-white/20 rounded-full w-full" />
                   <div className="h-3 bg-white/10 rounded-full w-2/3" />
                 </div>
               </div>
               <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-3 shadow-sm transform transition-transform hover:scale-105">
                 <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                 <div>
                   <span className="text-emerald-400 font-bold block">Entry Approved</span>
                   <span className="text-emerald-500/60 text-sm">Delivery via Main Gate</span>
                 </div>
               </div>
            </div>
          </div>
        </BentoCard>

      </div>
    </section>
  );
}

function BentoCard({ children, className }: { children: React.ReactNode; className?: string }) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={`group relative rounded-3xl md:rounded-[2.5rem] border border-white/10 overflow-hidden bg-[#080808] ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Hidden by default on mobile, active on desktop hover */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-500 lg:group-hover:opacity-100 hidden lg:block"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(139, 92, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      {/* Fallback glow for mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent lg:hidden" />
      
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}

function CTASection() {
  return (
    <section className="py-24 md:py-40 px-4 relative z-10 overflow-hidden border-t border-white/5">
      <div className="max-w-5xl mx-auto bg-[#0a0a0a] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-3xl md:rounded-[3rem] p-8 md:p-24 text-center relative overflow-hidden">
        {/* Abstract Glow in CTA */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] md:w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.2),transparent_60%)]" />
        
        <h2 className="text-4xl md:text-7xl font-black text-white mb-6 md:mb-8 relative z-10 tracking-tight leading-tight">Step into the future.</h2>
        <p className="text-lg md:text-xl text-gray-400 mb-10 md:mb-12 max-w-2xl mx-auto relative z-10 font-medium px-4">
          Say goodbye to WhatsApp groups and excel sheets. 
          Run your entire society seamlessly on <span className="text-white">Resident HQ</span>.
        </p>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4 md:gap-6 w-full md:w-auto px-4 md:px-0">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 md:px-12 md:py-6 bg-white text-black rounded-full font-bold text-base md:text-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            Create Society Account
            <ArrowRight size={20} className="hidden sm:block"/>
          </Link>
        </div>
      </div>
    </section>
  );
}
