import { createFileRoute, Link } from "@tanstack/react-router";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useInView,
} from "framer-motion";
import {
  Shield,
  Building2,
  Smartphone,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Lock,
  BellRing,
  Activity,
  Wallet,
  Star,
  ChevronRight,
  Globe,
  Headphones,
  BarChart3,
  FileText,
  Camera,
  Megaphone,
  Ticket,
  Truck,
  Crown,
  Sparkles,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";
import React, { useRef, useEffect, useState } from "react";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title: "Resident HQ — The Smart Society Management Platform" },
      {
        name: "description",
        content:
          "Replace 10 different apps with one secure, blazing-fast platform for your residential society. Gate management, automated billing, helpdesk, and more.",
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
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden selection:bg-violet-500/30 font-sans">
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Pure CSS Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-slate-950/40 pointer-events-none z-10" />
      </div>

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
      className={`flex items-center justify-between px-5 py-4 md:px-12 sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/70 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-2.5 text-lg font-black tracking-tight">
        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white p-2 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)]">
          <Shield size={18} />
        </div>
        <span className="text-white hidden sm:block">Resident HQ</span>
      </div>
      <div className="flex items-center gap-3 md:gap-5">
        <Link
          to="/login"
          className="text-sm font-semibold text-gray-300 hover:text-white transition-colors hidden sm:block"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="text-xs md:text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2.5 md:px-7 md:py-3 rounded-full shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] hover:scale-105 transition-all"
        >
          Get Started Free
        </Link>
      </div>
    </nav>
  );
}

/* ─────────────────────── Hero ─────────────────────── */
function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <motion.section
      ref={containerRef}
      style={{ y, opacity }}
      className="min-h-[90vh] flex flex-col items-center justify-center text-center px-5 pt-20 pb-16 md:pt-28 md:pb-24 relative w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring" }}
        className="max-w-5xl w-full space-y-8 relative z-10"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-500/10 backdrop-blur-xl border border-violet-500/20 text-violet-300 text-xs font-bold tracking-widest uppercase"
        >
          <Sparkles size={14} className="text-violet-400" />
          <span>India's #1 Society OS</span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-[3rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[7rem] font-black tracking-[-0.04em] text-white leading-[0.95]">
          Your Society,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300">
            Supercharged.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
          Gate management, automated billing, helpdesk, and community — all in
          one beautiful platform.{" "}
          <span className="text-white font-semibold">
            Replace 10 apps with Resident HQ.
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="group w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-bold text-base md:text-lg shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            Start For Free
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white/5 backdrop-blur-xl text-white border border-white/15 rounded-full font-bold text-base md:text-lg hover:bg-white/10 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <Globe size={18} />
            Resident Portal
          </Link>
        </div>

        {/* Social proof line */}
        <p className="text-sm text-gray-500 pt-2">
          ✨ Trusted by 50+ premium societies across India
        </p>
      </motion.div>

      {/* Floating feature cards */}
      <div className="absolute top-1/4 left-[3%] hidden xl:flex flex-col gap-4">
        <FloatingCard icon={Shield} label="Secure" delay={0} rotate={-8} />
        <FloatingCard icon={Users} label="Community" delay={0.5} rotate={8} />
      </div>
      <div
        className="absolute top-1/3 right-[3%] hidden xl:flex flex-col gap-4"
      >
        <FloatingCard icon={Wallet} label="Billing" delay={1} rotate={8} />
        <FloatingCard
          icon={BellRing}
          label="Alerts"
          delay={1.5}
          rotate={-6}
        />
      </div>
    </motion.section>
  );
}

function FloatingCard({
  icon: Icon,
  label,
  delay,
  rotate,
}: {
  icon: any;
  label: string;
  delay: number;
  rotate: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { delay, duration: 0.5 },
        y: { delay, duration: 4, repeat: Infinity },
      }}
      style={{ rotate }}
      className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center gap-1 shadow-xl"
    >
      <Icon size={20} className="text-violet-300" />
      <span className="text-[8px] font-bold text-white/50 uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
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
    <div className="py-6 border-y border-white/5 bg-black/30 flex overflow-hidden whitespace-nowrap relative z-20">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
        className="flex gap-8 md:gap-14 px-4 items-center"
      >
        {[...Array(2)].map((_, setIdx) => (
          <React.Fragment key={setIdx}>
            {items.map((text, i) => (
              <React.Fragment key={`${setIdx}-${i}`}>
                <span className="text-xl md:text-3xl font-black text-white/15 uppercase tracking-tight">
                  {text}
                </span>
                <span className="text-violet-500/50 text-lg">◆</span>
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
    <div className="w-full py-16 md:py-24 relative z-20">
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
        {[
          { value: 50, suffix: "+", label: "Premium Societies" },
          { value: 10000, suffix: "+", label: "Happy Residents" },
          { value: 99, suffix: ".9%", label: "Uptime" },
          { value: 500000, suffix: "+", label: "Entries Logged" },
        ].map((stat) => (
          <div key={stat.label} className="space-y-2">
            <h3 className="text-3xl md:text-5xl font-black text-white">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </h3>
            <p className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-widest">
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
    icon: Shield,
    title: "Enterprise Security",
    desc: "Strict data isolation between societies. RLS policies ensure no tenant can see another's data.",
    gradient: "from-violet-600/20 to-indigo-600/20",
    iconColor: "text-violet-400",
    borderColor: "border-violet-500/20",
    large: true,
  },
  {
    icon: Activity,
    title: "Real-time Gate Management",
    desc: "Guards log visitors instantly. Residents approve from their phone. 60-second auto-timeout.",
    gradient: "from-orange-600/20 to-red-600/20",
    iconColor: "text-orange-400",
    borderColor: "border-orange-500/20",
  },
  {
    icon: Wallet,
    title: "Automated Billing",
    desc: "Generate monthly dues for all flats in one click. Razorpay-powered payments.",
    gradient: "from-emerald-600/20 to-teal-600/20",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
  },
  {
    icon: Headphones,
    title: "Helpdesk & Tickets",
    desc: "Residents raise tickets. Managers track, prioritize, and resolve them in real time.",
    gradient: "from-blue-600/20 to-cyan-600/20",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/20",
  },
  {
    icon: Megaphone,
    title: "Community Feed",
    desc: "General discussions, Buy & Sell marketplace, and society-wide announcements.",
    gradient: "from-pink-600/20 to-rose-600/20",
    iconColor: "text-pink-400",
    borderColor: "border-pink-500/20",
  },
  {
    icon: BarChart3,
    title: "Manager Dashboard",
    desc: "Revenue charts, collection rates, occupancy stats — all in a beautiful dark-mode panel.",
    gradient: "from-amber-600/20 to-yellow-600/20",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/20",
    large: true,
  },
];

function FeaturesShowcase() {
  return (
    <section className="py-24 md:py-36 px-5 relative z-10 max-w-7xl mx-auto">
      <SectionHeader
        badge="Platform"
        title="Everything your society needs."
        subtitle="From gate security to financial management, all unified in one premium interface."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  feature: f,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      className={`group relative rounded-3xl border ${f.borderColor} bg-white/[0.02] backdrop-blur-sm overflow-hidden p-8 hover:bg-white/[0.04] transition-colors ${
        f.large ? "lg:col-span-2 lg:row-span-1" : ""
      }`}
    >
      {/* Hover glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden lg:block"
        style={{
          background: useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(139,92,246,0.1), transparent 80%)`,
        }}
      />

      <div className="relative z-10">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 border ${f.borderColor}`}
        >
          <f.icon size={26} className={f.iconColor} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
          {f.title}
        </h3>
        <p className="text-gray-400 leading-relaxed">{f.desc}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────── How It Works ─────────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Register Your Society",
      desc: "Fill in society details, choose a plan, and pay securely with Razorpay.",
      icon: FileText,
      color: "from-violet-500 to-indigo-600",
    },
    {
      num: "02",
      title: "Invite Residents & Guards",
      desc: "Add flats, invite residents via email magic links, and set up guard accounts.",
      icon: Users,
      color: "from-fuchsia-500 to-pink-600",
    },
    {
      num: "03",
      title: "Manage Everything",
      desc: "Automated billing, real-time gate alerts, helpdesk, community — it just works.",
      icon: Zap,
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <section className="py-24 md:py-36 px-5 relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          badge="Simple"
          title="Up and running in minutes."
          subtitle="Three steps to transform how your society operates."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[17%] right-[17%] h-[2px] bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-amber-500/30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg mb-6 relative z-10`}
              >
                <step.icon size={28} />
              </div>
              <span className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2">
                Step {step.num}
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Testimonials ─────────────────────── */
const TESTIMONIALS = [
  {
    name: "Rajesh Sharma",
    role: "President, Green Valley Enclave",
    text: "Resident HQ transformed our society management. The guard app alone saved us 4 hours daily. Billing is now 100% digital.",
    avatar: "RS",
  },
  {
    name: "Priya Kapoor",
    role: "Secretary, Sapphire Heights",
    text: "We replaced WhatsApp groups, Excel sheets, and 3 other apps. Everything is in one place now. The residents love the real-time gate alerts.",
    avatar: "PK",
  },
  {
    name: "Amit Deshmukh",
    role: "Manager, Horizon Towers",
    text: "Collection rate went from 65% to 94% in the first month. The automated billing and Razorpay integration is a game-changer.",
    avatar: "AD",
  },
  {
    name: "Sneha Iyer",
    role: "Resident, Palm Grove Society",
    text: "I can approve visitors from my phone before they even reach my door. The community feed keeps everyone connected. Absolutely brilliant.",
    avatar: "SI",
  },
];

function TestimonialsSection() {
  return (
    <section className="py-24 md:py-36 px-5 relative z-10">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badge="Loved by residents"
          title="Hear from our community."
          subtitle="Thousands of residents and managers trust Resident HQ every day."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 hover:bg-white/[0.04] transition-colors"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 text-[15px]">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Pricing ─────────────────────── */
function PricingSection() {
  const plans = [
    {
      id: "basic" as const,
      name: "Digital Security",
      price: "5,000",
      desc: "Essential gate management and digital notices for smaller communities.",
      features: [
        "Guard App with entry logging",
        "Digital notice board",
        "Basic manager dashboard",
        "Up to 100 flats",
        "Email support",
      ],
      gradient: "from-emerald-500 to-teal-600",
      popular: false,
    },
    {
      id: "pro" as const,
      name: "Smart Operations",
      price: "10,000",
      desc: "Full-featured management for mid-size societies that want automation.",
      features: [
        "Everything in Digital Security",
        "Razorpay billing integration",
        "Helpdesk & ticket system",
        "Community marketplace",
        "Society branding & white-label",
        "Up to 300 flats",
        "Priority support",
      ],
      gradient: "from-violet-500 to-fuchsia-600",
      popular: true,
    },
    {
      id: "enterprise" as const,
      name: "Premium Automation",
      price: "15,000",
      desc: "Enterprise-grade features for large societies with complex needs.",
      features: [
        "Everything in Smart Operations",
        "Bulk reminders & automation",
        "Document vault",
        "Full audit logs",
        "Advanced analytics",
        "Up to 1,000 flats",
        "Dedicated account manager",
      ],
      gradient: "from-amber-500 to-orange-600",
      popular: false,
    },
  ];

  return (
    <section className="py-24 md:py-36 px-5 relative z-10">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          badge="Pricing"
          title="Simple, transparent pricing."
          subtitle="Choose the plan that fits your society. Upgrade anytime."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl border p-8 flex flex-col transition-all hover:-translate-y-2 ${
                plan.popular
                  ? "border-violet-500/40 bg-violet-500/[0.05] shadow-[0_0_60px_rgba(139,92,246,0.15)]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full text-xs font-bold text-white shadow-lg">
                  Most Popular
                </div>
              )}

              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white mb-5`}
              >
                {plan.id === "basic" && <Shield size={22} />}
                {plan.id === "pro" && <Crown size={22} />}
                {plan.id === "enterprise" && <Sparkles size={22} />}
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-500 mb-5">{plan.desc}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">
                  ₹{plan.price}
                </span>
                <span className="text-sm text-gray-500">/month</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-gray-300"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-emerald-400 shrink-0 mt-0.5"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`w-full text-center py-3.5 rounded-full font-bold text-sm transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]"
                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                }`}
              >
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── CTA ─────────────────────── */
function CTASection() {
  return (
    <section className="py-24 md:py-36 px-5 relative z-10">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-amber-600/20 rounded-[3rem] blur-3xl" />
        <div className="relative rounded-[3rem] border border-white/10 bg-black/60 backdrop-blur-xl p-12 md:p-20 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_60%)]" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Ready to upgrade
              <br />
              your society?
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
              Say goodbye to WhatsApp chaos and Excel nightmares. Get your
              society running on{" "}
              <span className="text-white font-semibold">Resident HQ</span> in
              under 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="group px-10 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-bold text-lg shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                Create Society Account
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Footer ─────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/10 relative z-10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white p-2 rounded-xl">
                <Shield size={18} />
              </div>
              <span className="text-lg font-black text-white">
                Resident HQ
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              The modern operating system for residential societies. Secure,
              fast, and beautiful.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {["Gate Management", "Billing", "Helpdesk", "Community"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © 2026 Resident HQ. Built for the modern society.
          </p>
          <div className="flex items-center gap-4">
            <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <Twitter size={16} />
            </span>
            <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <Github size={16} />
            </span>
            <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <Linkedin size={16} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────── Shared ─────────────────────── */
function SectionHeader({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold tracking-widest uppercase mb-6">
        {badge}
      </span>
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
        {title}
      </h2>
      <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
    </motion.div>
  );
}
