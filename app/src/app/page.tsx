"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiTarget,
  FiShield,
  FiZap,
  FiGrid,
  FiDownload,
  FiMail,
  FiChevronDown,
  FiCheck,
  FiStar,
  FiArrowRight,
  FiMenu,
  FiX,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it Works", href: "#how-it-works" },
];

const COMPANIES = ["Google", "Meta", "Amazon", "Netflix", "Apple", "Microsoft", "Stripe", "Airbnb"];

const STEPS = [
  {
    num: 1,
    title: "Create Your Profile",
    desc: "Upload your resume and set your preferences — role, location, salary, remote — in under two minutes.",
    icon: <FiGrid className="w-6 h-6" />,
  },
  {
    num: 2,
    title: "AI Scores Your Jobs",
    desc: "Our Claude-powered AI evaluates every listing against your unique criteria and assigns a 0-100 match score.",
    icon: <FiTarget className="w-6 h-6" />,
  },
  {
    num: 3,
    title: "Apply with Confidence",
    desc: "Top matches are delivered to your inbox daily. Export to Google Sheets, filter, and apply to the best fits first.",
    icon: <FiZap className="w-6 h-6" />,
  },
];

const FEATURES = [
  {
    icon: <FiSearch className="w-7 h-7" />,
    title: "Multi-Source Aggregation",
    desc: "We pull from LinkedIn, Indeed, Glassdoor, and 4+ more boards so you never miss a listing.",
  },
  {
    icon: <FiTarget className="w-7 h-7" />,
    title: "AI-Powered Scoring",
    desc: "Every job gets a 0-100 match score with plain-English reasoning so you know exactly why it fits.",
  },
  {
    icon: <FiGrid className="w-7 h-7" />,
    title: "Smart Filters",
    desc: "Slice your results by score, location, salary range, remote status, and more in a single click.",
  },
  {
    icon: <FiDownload className="w-7 h-7" />,
    title: "Google Sheets Export",
    desc: "Push your scored jobs straight into a spreadsheet to organize, track, and share your search.",
  },
  {
    icon: <FiMail className="w-7 h-7" />,
    title: "Daily Job Alerts",
    desc: "Wake up to a curated digest of fresh high-match jobs delivered to your inbox every morning.",
  },
  {
    icon: <FiShield className="w-7 h-7" />,
    title: "Privacy-First",
    desc: "Your data is encrypted at rest and in transit. We never sell your information — period.",
  },
];

interface PricingTier {
  name: string;
  monthlyPrice: number;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

const PRICING: PricingTier[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    description: "For casual job seekers getting started.",
    features: ["10 jobs / day", "1 profile", "Basic AI scoring", "Community support"],
    cta: "Get Started",
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    description: "For active job seekers who want an edge.",
    features: [
      "100 jobs / day",
      "5 profiles",
      "Full AI scoring with reasoning",
      "Google Sheets export",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Premium",
    monthlyPrice: 79,
    description: "For power users and career changers.",
    features: [
      "500 jobs / day",
      "20 profiles",
      "Daily email digest",
      "API access",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    monthlyPrice: 199,
    description: "For teams and recruiting agencies.",
    features: [
      "Unlimited jobs",
      "Unlimited profiles",
      "Custom AI tuning",
      "Team collaboration",
      "Dedicated account manager",
      "SSO & advanced security",
    ],
    cta: "Contact Sales",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Now at Google",
    quote:
      "I was mass-applying to 40+ jobs a week and hearing nothing. JobMatch Pro cut that to 8 highly targeted applications — and I landed 3 interviews in the first week.",
    rating: 5,
  },
  {
    name: "Marcus Williams",
    role: "Product Manager",
    company: "Now at Stripe",
    quote:
      "The AI scoring is shockingly good. It flagged a role I would have scrolled past, explained exactly why it fit my background, and it turned out to be my dream job.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Data Scientist",
    company: "Now at Netflix",
    quote:
      "The Google Sheets export alone is worth the price. I ran my entire job search from one spreadsheet — organized, tracked, and stress-free.",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "How does the AI scoring work?",
    a: "We use Claude AI to analyze each job listing against your resume, skills, and stated preferences. The model evaluates factors like skill overlap, seniority match, location, compensation, and culture fit, then returns a 0-100 score with a human-readable explanation.",
  },
  {
    q: "Which job boards do you aggregate from?",
    a: "We currently pull from LinkedIn, Indeed, Glassdoor, ZipRecruiter, RemoteOK, We Work Remotely, and AngelList. We are continuously adding new sources.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We never sell or share your personal information with third parties. You can delete your account and all associated data at any time.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All paid plans are month-to-month with no long-term contracts. You can cancel from your dashboard in one click and retain access through the end of your billing period.",
  },
  {
    q: "Do you offer a free trial?",
    a: "Yes! Pro and Premium plans include a 14-day free trial with full access. No credit card required to start.",
  },
  {
    q: "What does the Google Sheets export include?",
    a: "Each export row contains the job title, company, location, salary range (when available), your match score, the AI reasoning summary, a direct link to the listing, and the date it was found.",
  },
];

const FOOTER_LINKS = {
  Product: ["Features", "Pricing", "Integrations", "Changelog", "API Docs"],
  Company: ["About", "Blog", "Careers", "Press Kit"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const price = (monthly: number) => {
    if (monthly === 0) return "$0";
    const value = annual ? Math.round(monthly * 12 * 0.7) : monthly;
    return `$${value}`;
  };

  const priceSuffix = (monthly: number) => {
    if (monthly === 0) return "/mo";
    return annual ? "/yr" : "/mo";
  };

  return (
    <div className="min-h-screen bg-white text-[#0f172a] overflow-x-hidden">
      {/* ───────────────── NAVBAR ───────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass transition-all duration-300">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white text-sm font-black">
              J
            </span>
            <span>
              Job<span className="gradient-text">Match</span> Pro
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748b]">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="hover:text-[#0f172a] transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/api/auth/signin"
              className="text-sm font-medium text-[#64748b] hover:text-[#0f172a] transition-colors duration-200 px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/api/auth/signin"
              className="text-sm font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-[#2563eb]/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#0f172a]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pb-6 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-[#64748b] hover:text-[#0f172a]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e2e8f0]">
              <Link
                href="/api/auth/signin"
                className="text-sm font-medium text-[#64748b] py-2"
              >
                Sign In
              </Link>
              <Link
                href="/api/auth/signin"
                className="text-sm font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-5 py-2.5 rounded-full text-center"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -20%, #2563eb33 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 50%, #7c3aed22 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 20% 80%, #06b6d422 0%, transparent 60%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(to right, #0f172a 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="mx-auto max-w-7xl px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white/60 backdrop-blur px-4 py-1.5 text-xs font-medium text-[#64748b] mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            Powered by Claude AI — now with 7+ job sources
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Stop Scrolling.{" "}
            <span className="gradient-text">Start Matching.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[#64748b] max-w-2xl mx-auto leading-relaxed">
            AI that reads every job listing across 7+ boards, scores each one against your resume and
            preferences, and delivers only the roles worth your time.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/api/auth/signin"
              className="group inline-flex items-center gap-2 text-base font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-8 py-3.5 rounded-full shadow-lg shadow-[#2563eb]/25 hover:shadow-xl hover:shadow-[#2563eb]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Free Trial
              <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-base font-semibold text-[#0f172a] border border-[#e2e8f0] bg-white px-8 py-3.5 rounded-full hover:border-[#cbd5e1] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              See How It Works
            </a>
          </div>

          {/* Mock dashboard preview */}
          <div className="mt-16 md:mt-20 mx-auto max-w-5xl relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#2563eb]/20 via-[#7c3aed]/20 to-[#06b6d4]/20 rounded-2xl blur-2xl opacity-60" />
            <div className="relative rounded-xl border border-[#e2e8f0] bg-white shadow-2xl shadow-black/5 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#fca5a5]" />
                  <span className="w-3 h-3 rounded-full bg-[#fde68a]" />
                  <span className="w-3 h-3 rounded-full bg-[#86efac]" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="mx-auto max-w-sm h-6 bg-white rounded-md border border-[#e2e8f0] flex items-center px-3">
                    <span className="text-[11px] text-[#94a3b8]">app.jobmatchpro.com/dashboard</span>
                  </div>
                </div>
              </div>
              {/* Dashboard content mock */}
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Sidebar mock */}
                  <div className="hidden md:block w-48 space-y-3">
                    <div className="h-8 bg-[#f1f5f9] rounded-lg" />
                    <div className="h-6 bg-[#f1f5f9] rounded-lg w-36" />
                    <div className="h-6 bg-[#f1f5f9] rounded-lg w-32" />
                    <div className="h-6 bg-[#f1f5f9] rounded-lg w-40" />
                    <div className="h-6 bg-[#f1f5f9] rounded-lg w-28" />
                  </div>
                  {/* Main content */}
                  <div className="flex-1 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-[#e2e8f0] p-3 text-center">
                        <div className="text-2xl font-bold text-[#2563eb]">94</div>
                        <div className="text-xs text-[#94a3b8] mt-0.5">Top Match</div>
                      </div>
                      <div className="rounded-lg border border-[#e2e8f0] p-3 text-center">
                        <div className="text-2xl font-bold text-[#0f172a]">47</div>
                        <div className="text-xs text-[#94a3b8] mt-0.5">New Today</div>
                      </div>
                      <div className="rounded-lg border border-[#e2e8f0] p-3 text-center">
                        <div className="text-2xl font-bold text-[#10b981]">12</div>
                        <div className="text-xs text-[#94a3b8] mt-0.5">Applied</div>
                      </div>
                    </div>
                    {/* Job cards mock */}
                    {[
                      { score: 94, title: "Senior Frontend Engineer", company: "Stripe", loc: "Remote", color: "#10b981", bg: "#d1fae5" },
                      { score: 87, title: "Full Stack Developer", company: "Vercel", loc: "SF / Remote", color: "#2563eb", bg: "#dbeafe" },
                      { score: 72, title: "React Engineer", company: "Airbnb", loc: "New York, NY", color: "#2563eb", bg: "#dbeafe" },
                    ].map((job) => (
                      <div
                        key={job.title}
                        className="flex items-center gap-4 rounded-lg border border-[#e2e8f0] p-4 hover:border-[#cbd5e1] transition-colors"
                      >
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm"
                          style={{ background: job.bg, color: job.color }}
                        >
                          {job.score}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{job.title}</div>
                          <div className="text-xs text-[#94a3b8]">
                            {job.company} &middot; {job.loc}
                          </div>
                        </div>
                        <div className="hidden sm:block">
                          <div className="text-xs font-medium text-[#2563eb] border border-[#2563eb]/20 rounded-full px-3 py-1">
                            View Details
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── SOCIAL PROOF BAR ───────────────── */}
      <section className="py-12 border-y border-[#e2e8f0] bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium text-[#94a3b8] mb-6 tracking-wide uppercase">
            Trusted by job seekers hired at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {COMPANIES.map((c) => (
              <span
                key={c}
                className="text-lg md:text-xl font-bold text-[#cbd5e1] select-none tracking-tight transition-colors duration-200 hover:text-[#94a3b8]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section id="how-it-works" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#2563eb] tracking-wide uppercase mb-3">
              How It Works
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Three steps to your <span className="gradient-text">dream job</span>
            </h2>
            <p className="mt-4 text-[#64748b] max-w-xl mx-auto text-lg">
              Set up once, sit back, and let AI do the heavy lifting.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-10 md:gap-6 max-w-5xl mx-auto">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-14 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#06b6d4]" />

            {STEPS.map((step) => (
              <div key={step.num} className="relative text-center flex flex-col items-center">
                {/* Numbered circle */}
                <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#2563eb]/20 mb-6">
                  {step.num}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-[#2563eb] mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-[#64748b] leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURES GRID ───────────────── */}
      <section id="features" className="py-24 md:py-32 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#7c3aed] tracking-wide uppercase mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Everything you need to <span className="gradient-text">land faster</span>
            </h2>
            <p className="mt-4 text-[#64748b] max-w-xl mx-auto text-lg">
              A full toolkit designed around how real people actually search for jobs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-[#e2e8f0] bg-white p-7 transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-1 hover:border-[#cbd5e1]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563eb]/10 to-[#7c3aed]/10 flex items-center justify-center text-[#2563eb] mb-5 transition-colors duration-300 group-hover:from-[#2563eb]/20 group-hover:to-[#7c3aed]/20">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-[#64748b] leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── PRICING ───────────────── */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#06b6d4] tracking-wide uppercase mb-3">
              Pricing
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Plans that <span className="gradient-text">grow with you</span>
            </h2>
            <p className="mt-4 text-[#64748b] max-w-xl mx-auto text-lg">
              Start free. Upgrade when you are ready. Cancel anytime.
            </p>

            {/* Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#f1f5f9] p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`text-sm font-medium px-5 py-2 rounded-full transition-all duration-200 ${
                  !annual ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`text-sm font-medium px-5 py-2 rounded-full transition-all duration-200 ${
                  annual ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b]"
                }`}
              >
                Annual{" "}
                <span className="text-xs font-semibold text-[#10b981]">-30%</span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-start">
            {PRICING.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 ${
                  tier.highlighted
                    ? "border-[#2563eb] bg-white shadow-xl shadow-[#2563eb]/10 scale-[1.02] lg:scale-105"
                    : "border-[#e2e8f0] bg-white hover:shadow-lg hover:shadow-black/[0.03] hover:border-[#cbd5e1]"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                    <FiStar className="w-3 h-3" />
                    {tier.badge}
                  </div>
                )}
                <h3 className="text-lg font-bold">{tier.name}</h3>
                <p className="text-sm text-[#64748b] mt-1 mb-5">{tier.description}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-extrabold tracking-tight">{price(tier.monthlyPrice)}</span>
                  <span className="text-[#64748b] text-sm mb-1">{priceSuffix(tier.monthlyPrice)}</span>
                </div>
                <Link
                  href="/api/auth/signin"
                  className={`block w-full text-center text-sm font-semibold py-3 rounded-full transition-all duration-300 mb-6 ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-lg shadow-[#2563eb]/25 hover:shadow-xl hover:shadow-[#2563eb]/30"
                      : "border border-[#e2e8f0] text-[#0f172a] hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                  }`}
                >
                  {tier.cta}
                </Link>
                <ul className="space-y-3">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-[#64748b]">
                      <FiCheck className="w-4 h-4 text-[#10b981] mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── TESTIMONIALS ───────────────── */}
      <section className="py-24 md:py-32 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#2563eb] tracking-wide uppercase mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Loved by <span className="gradient-text">thousands</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-[#e2e8f0] bg-white p-7 transition-all duration-300 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-1"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                  ))}
                </div>
                <p className="text-[#334155] leading-relaxed mb-6 text-sm">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-[#94a3b8]">
                      {t.role} &middot; {t.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FAQ ───────────────── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#7c3aed] tracking-wide uppercase mb-3">
              FAQ
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Common <span className="gradient-text">questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden transition-all duration-200 hover:border-[#cbd5e1]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-semibold text-[15px]">{faq.q}</span>
                  <FiChevronDown
                    className={`w-5 h-5 text-[#94a3b8] flex-shrink-0 transition-transform duration-300 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openFaq === idx ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <p className="px-6 pb-5 text-[#64748b] leading-relaxed text-sm">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── CTA SECTION ───────────────── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 50% 50% at 50% 50%, #2563eb44 0%, transparent 70%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Ready to find your{" "}
            <span className="gradient-text">dream job</span>?
          </h2>
          <p className="text-[#94a3b8] text-lg mb-10 max-w-lg mx-auto">
            Join thousands of job seekers who stopped doom-scrolling job boards and started getting
            matched by AI.
          </p>

          {/* Email capture */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-full border border-white/10 bg-white/5 text-white placeholder-[#64748b] px-6 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 focus:border-[#2563eb] transition-all duration-200"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white text-sm font-semibold px-7 py-3.5 rounded-full shadow-lg shadow-[#2563eb]/25 hover:shadow-xl hover:shadow-[#2563eb]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-[#64748b] mt-4">
            14-day free trial &middot; No credit card required
          </p>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="py-16 border-t border-[#e2e8f0] bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight mb-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white text-xs font-black">
                  J
                </span>
                <span>
                  Job<span className="gradient-text">Match</span> Pro
                </span>
              </Link>
              <p className="text-sm text-[#64748b] leading-relaxed max-w-xs mb-6">
                AI-powered job search that matches you with the right roles from 7+ job boards.
                Stop searching. Start matching.
              </p>
              {/* Social icons as text links */}
              <div className="flex gap-4">
                {["Twitter", "LinkedIn", "GitHub"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="text-xs font-medium text-[#94a3b8] hover:text-[#0f172a] transition-colors duration-200"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-sm font-semibold mb-4 text-[#0f172a]">{heading}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-[#64748b] hover:text-[#0f172a] transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-14 pt-6 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#94a3b8]">
              &copy; {new Date().getFullYear()} JobMatch Pro. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Cookies"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-xs text-[#94a3b8] hover:text-[#0f172a] transition-colors duration-200"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
