import { createFileRoute, Link } from "@tanstack/react-router";
import {
  motion,
  useScroll,
  useSpring,
  useInView,
} from "framer-motion";
import {
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Star,
  Fingerprint,
  SmartphoneNfc,
  ReceiptText,
  LifeBuoy,
  MessageSquareQuote,
  TrendingUp,
  MapPin,
  Check,
  X,
} from "lucide-react";
import React, { useRef, useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resident HQ — Premium Society Management" },
      {
        name: "description",
        content:
          "Replace outdated apps with one secure, blazing-fast platform for your residential society. Gate management, automated billing, helpdesk, and more.",
      },
    ],
  }),
  component: LandingPage,
});

/* ─────────────────────── Page Root ─────────────────────── */
function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-[#1d1d1f] flex justify-center py-0 sm:py-4 md:py-8 px-0 sm:px-4 font-sans selection:bg-brand/30 selection:text-[#1d1d1f] relative">
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-brand origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Main Container */}
      <div className="w-full max-w-[1600px] sm:rounded-[2.5rem] bg-white shadow-elevated overflow-hidden relative border border-gray-200/50">
        <Navbar />
        <HeroSection />
        <LogoCloud />
        <StatsSection />
        <FeaturesShowcase />
        <HowItWorks />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}

/* ─────────────────────── Navbar ─────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed sm:absolute w-full sm:w-[calc(100%-2rem)] max-w-[1600px] flex items-center justify-between px-5 py-4 md:px-12 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-[12px] border-b border-gray-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-3 text-lg font-black tracking-tight">
        <img src="/textures/logo.png" alt="Resident HQ Logo" className="w-9 h-9 object-contain" />
        <span className="text-gray-900 hidden sm:block font-sans tracking-wide">Resident HQ</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 font-mono uppercase tracking-widest text-[11px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
          <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
          <span>All systems operational</span>
        </div>

        <Link
          to="/login"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="text-xs md:text-sm font-bold bg-brand text-white px-5 py-2 md:px-6 md:py-2.5 rounded-full shadow-sm hover:bg-brand-hover transition-colors"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

/* ─────────────────────── Hero ─────────────────────── */
function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center pointer-events-none" />
      {/* Light Overlay Gradient (fade left to right for text readability) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#f0f4f8] via-[#f0f4f8]/80 to-[#f0f4f8]/30 pointer-events-none" />
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,102,204,0.15),transparent_50%)] pointer-events-none" />
      
      {/* Left (7 cols) */}
      <div className="lg:col-span-7 relative z-10 pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="font-mono text-brand tracking-widest uppercase text-xs mb-8 inline-flex items-center gap-2 font-bold px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20"
        >
          <MapPin size={14} />
          <span>India's Premium Society OS</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] leading-[0.9] font-black tracking-[-0.04em] mb-8 text-gray-900"
        >
          Living, <br />
          <span className="text-gray-400">Elevated.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
          className="text-gray-600 text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-normal"
        >
          Gate management, financial reconciliation, and community coordination. Stop switching tabs. <span className="text-gray-900 font-bold">Run your entire residential complex from one intuitive dashboard.</span>
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-brand text-white font-bold rounded-full px-8 py-4 hover:bg-brand-hover transition-colors gap-2 text-lg shadow-md"
          >
            Start For Free <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-gray-100 border border-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-lg shadow-sm"
          >
            <Globe size={18} /> Resident Portal
          </Link>
        </motion.div>
      </div>

      {/* Right (5 cols) - Mockups */}
      <div className="lg:col-span-5 relative z-10 h-[450px] hidden lg:flex items-center justify-center">
        <div className="w-full h-full relative flex items-center justify-center">
          
          {/* Main Dashboard Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute z-10 w-80 bg-white border border-gray-200 rounded-2xl p-6 shadow-elevated"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-500 font-mono">Monthly Collections</span>
              <span className="text-xs bg-brand/10 text-brand border border-brand/20 font-bold px-2 py-0.5 rounded-full">Oct 2026</span>
            </div>
            <div className="text-4xl font-black mb-6 text-gray-900">₹4.2L</div>
            <div className="flex items-end gap-2 h-20">
              {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className={`w-full rounded-t-md ${i === 5 ? 'bg-brand' : 'bg-gray-200'}`} style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </motion.div>

          {/* Visitor Alert Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute z-20 -right-4 top-16 w-64 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl p-5 shadow-elevated"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                <Users size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Rohan Delivery</div>
                <div className="text-xs text-gray-500">Swiggy • 2 mins ago</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 text-xs py-2 rounded-lg flex justify-center items-center gap-1 transition-colors font-medium">
                <X size={14} /> Deny
              </button>
              <button className="flex-1 bg-brand hover:bg-brand-hover text-white text-xs py-2 rounded-lg flex justify-center items-center gap-1 font-bold transition-colors shadow-sm">
                <Check size={14} /> Approve
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Logo Cloud ─────────────────────── */
function LogoCloud() {
  const items = [
    "SECURE ISOLATION",
    "AUTOMATED BILLING",
    "REAL-TIME ALERTS",
    "COMMUNITY FEED",
    "HELPDESK",
    "GUARD APP",
    "NOC MANAGEMENT",
    "DOCUMENT VAULT",
  ];

  return (
    <div className="py-6 border-y border-gray-200 bg-[#f0f4f8] flex overflow-hidden whitespace-nowrap relative z-20">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 40, repeat: Infinity }}
        className="flex gap-10 px-4 items-center"
      >
        {[...Array(2)].map((_, setIdx) => (
          <React.Fragment key={setIdx}>
            {items.map((text, i) => (
              <React.Fragment key={`${setIdx}-${i}`}>
                <span className="text-xl font-bold text-gray-400 uppercase tracking-widest font-sans">
                  {text}
                </span>
                <span className="text-gray-300">|</span>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────── Stats ─────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function StatsSection() {
  return (
    <div className="w-full py-24 relative z-20 bg-white">
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 text-center">
        {[
          { value: 50, suffix: "+", label: "Societies Onboarded" },
          { value: 10000, suffix: "+", label: "Active Residents" },
          { value: 99, suffix: ".9%", label: "Platform Uptime" },
          { value: 500000, suffix: "+", label: "Entries Processed" },
        ].map((stat) => (
          <div key={stat.label} className="space-y-3">
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Features Showcase ─────────────────────── */
const FEATURES = [
  {
    icon: Fingerprint,
    title: "Data Sovereignty",
    desc: "Row-level security ensures complete data isolation. No tenant can ever access another society's records.",
  },
  {
    icon: SmartphoneNfc,
    title: "Instant Gate Logs",
    desc: "Guards input details in seconds. Residents get push notifications and approve entry directly from their phones.",
  },
  {
    icon: ReceiptText,
    title: "Automated Reconciliation",
    desc: "Generate monthly maintenance invoices in bulk. Integrated with gateways for instant ledger updates.",
  },
  {
    icon: LifeBuoy,
    title: "Ticketing System",
    desc: "Plumbing issue? Raise a ticket. Managers can assign vendors and track resolution timelines.",
  },
  {
    icon: MessageSquareQuote,
    title: "Notice Board & Feed",
    desc: "Broadcast official notices or let residents interact in a moderated community marketplace.",
  },
  {
    icon: TrendingUp,
    title: "Financial Dashboard",
    desc: "Track pending dues, collection efficiency, and expense run-rates with clear, actionable graphs.",
  },
];

function FeaturesShowcase() {
  return (
    <section className="py-24 px-5 relative z-10 max-w-7xl mx-auto">
      <div className="mb-16 md:flex justify-between items-end pb-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">Core Modules.</h2>
          <p className="text-gray-500 text-lg font-light leading-relaxed">Everything required to run a modern residential complex, elegantly organized into dedicated workspaces.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature: f, index }: { feature: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-2xl bg-white border border-gray-200 p-8 hover:scale-[1.02] shadow-sm hover:shadow-elevated transition-all duration-300 cursor-pointer"
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-6 text-brand transition-colors">
          <f.icon size={24} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{f.title}</h3>
        <p className="text-gray-600 leading-relaxed font-light text-base">{f.desc}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────── How It Works ─────────────────────── */
function HowItWorks() {
  const steps = [
    { num: "01", title: "Setup Society", desc: "Define wings, flats, and operational rules in the admin panel." },
    { num: "02", title: "Onboard Residents", desc: "Bulk import data or send out self-serve email registration links." },
    { num: "03", title: "Go Live", desc: "Hand over the guard app and start tracking entries and payments from day one." },
  ];

  return (
    <section className="w-full bg-[#f0f4f8] text-gray-900 py-24 px-6 md:px-12 lg:px-20 relative z-20 mx-auto max-w-full border-y border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Deployment Flow.</h2>
          <p className="text-gray-600 text-lg font-medium">Get your society up and running in a matter of hours, not weeks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col border-t-4 border-brand pt-6"
            >
              <div className="font-mono text-sm font-bold mb-4 text-brand">STEP {step.num}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed text-base font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Testimonials ─────────────────────── */
const TESTIMONIALS = [
  { name: "Rajesh Sharma", role: "President, Green Valley", text: "We dumped our chaotic WhatsApp groups. The dedicated helpdesk module alone justified the switch. Extremely well-built software.", avatar: "RS" },
  { name: "Priya Kapoor", role: "Secretary, Sapphire Heights", text: "Automating the maintenance bills saved our committee a week of manual reconciliation every month. Solid execution.", avatar: "PK" },
  { name: "Amit Deshmukh", role: "Manager, Horizon Towers", text: "The guard interface is simple enough that our security staff learned it in 15 minutes. Very practical design.", avatar: "AD" },
  { name: "Sneha Iyer", role: "Resident, Palm Grove", text: "Approving visitors from my phone is seamless. No more annoying intercom calls while I'm in a meeting.", avatar: "SI" },
];

function TestimonialsSection() {
  return (
    <section className="py-24 px-5 relative z-10 max-w-7xl mx-auto bg-white">
      <div className="mb-16 pb-8">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">Trusted by Committees.</h2>
        <p className="text-gray-500 text-lg font-light">Real feedback from the people running residential operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl bg-[#f0f4f8] border border-gray-200 p-8 hover:scale-[1.02] hover:bg-white hover:shadow-elevated transition-all duration-300"
          >
            <div className="flex gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={16} className="text-brand fill-brand" />)}
            </div>
            <p className="text-gray-700 leading-relaxed mb-8 text-base md:text-lg font-light">"{t.text}"</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white font-bold text-lg shadow-md">
                {t.avatar}
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────── Pricing ─────────────────────── */
function PricingSection() {
  const plans = [
    { id: "basic", name: "Standard", price: "5,000", desc: "Core gate management and notices.", features: ["Guard App & visitor logs", "Digital notice board", "Resident directory", "Up to 100 flats"], popular: false },
    { id: "pro", name: "Professional", price: "10,000", desc: "Complete financial automation suite.", features: ["Everything in Standard", "Instant On-Demand Custom Features", "Payment gateway integration", "Document vault & Audit Logs", "Custom data exports", "Unlimited flats"], popular: true },
  ];

  return (
    <section className="py-24 px-5 relative z-10 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">Straightforward Plans.</h2>
        <p className="text-gray-500 text-lg font-light">No hidden fees or complex tiered billing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-8 flex flex-col transition-all ${
              plan.popular ? "bg-white scale-105 shadow-elevated border-2 border-brand" : "bg-white border border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="relative z-10">
              {plan.popular && (
               <div className="text-brand font-bold text-xs uppercase tracking-widest mb-4 bg-brand/10 inline-block px-3 py-1 rounded-full border border-brand/20">
                  Recommended
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-base text-gray-500 mb-6 h-12">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-8 pb-8 border-b border-gray-200">
                <span className="text-4xl font-black text-gray-900 tracking-tight">₹{plan.price}</span>
                <span className="text-sm text-gray-500">/month</span>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-base text-gray-700">
                    <CheckCircle2 size={20} className={plan.popular ? "text-brand" : "text-gray-400"} />
                    <span className="font-light">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`w-full text-center py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 mt-auto ${
                  plan.popular ? "bg-brand text-white hover:bg-brand-hover shadow-md" : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                Select Plan
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────── CTA & Footer ─────────────────────── */
function CTASection() {
  return (
    <section className="py-24 px-5 relative z-10 bg-white">
      <div className="max-w-5xl mx-auto bg-brand rounded-3xl p-12 md:p-20 text-center shadow-elevated overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-sm">
            Ready to Modernize?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop relying on fragmented communication channels and manual ledgers. Experience the premium standard.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-white text-brand font-black rounded-full px-10 py-4 hover:bg-gray-50 transition-colors gap-2 text-lg shadow-lg hover:scale-105 transform duration-300"
          >
            Request Account Setup
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#f0f4f8] pt-20 pb-10 px-6 md:px-12 lg:px-20 relative border-t border-gray-200 sm:rounded-b-[2.5rem]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 text-xl font-black tracking-tight mb-6 text-gray-900">
            <img src="/textures/logo.png" alt="Resident HQ Logo" className="w-8 h-8 object-contain" />
            <span>Resident HQ</span>
          </div>
          <p className="text-gray-500 text-sm font-light leading-relaxed">
            Enterprise-grade management software for forward-thinking residential communities.
          </p>
        </div>
        
        <div className="md:col-span-2 flex gap-16 md:justify-center">
          <div className="space-y-6">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-widest">Platform</h4>
            <div className="flex flex-col gap-4">
              <Link to="/features" className="text-gray-500 hover:text-brand text-sm transition-colors font-light">Features</Link>
              <Link to="/pricing" className="text-gray-500 hover:text-brand text-sm transition-colors font-light">Pricing</Link>
              <Link to="/security" className="text-gray-500 hover:text-brand text-sm transition-colors font-light">Security</Link>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-widest">Company</h4>
            <div className="flex flex-col gap-4">
              <Link to="/about" className="text-gray-500 hover:text-brand text-sm transition-colors font-light">About Us</Link>
              <Link to="/privacy" className="text-gray-500 hover:text-brand text-sm transition-colors font-light">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-brand text-sm transition-colors font-light">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 flex flex-col md:items-end justify-between">
          <div className="flex gap-5 mb-8">
            <a href="#" className="text-gray-400 hover:text-brand transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-brand transition-colors"><Github size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-brand transition-colors"><Linkedin size={20} /></a>
          </div>
          <p className="text-xs text-gray-400 font-mono">
            © 2026 Resident HQ.
          </p>
        </div>
      </div>
    </footer>
  );
}
