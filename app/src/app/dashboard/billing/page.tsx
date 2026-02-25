"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FiCreditCard,
  FiCheck,
  FiTrendingUp,
  FiZap,
  FiUsers,
  FiFileText,
  FiStar,
  FiArrowRight,
  FiLoader,
  FiShield,
  FiClock,
  FiBarChart2,
} from "react-icons/fi";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
  cta: string;
}

interface UsageStat {
  label: string;
  current: number;
  limit: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

// ---------------------------------------------------------------------------
// Pricing tiers data
// ---------------------------------------------------------------------------

const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Get started with basic job matching",
    features: [
      "5 job scans per day",
      "1 profile",
      "Basic AI matching",
      "Email notifications",
      "7-day match history",
    ],
    cta: "Current Plan",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "per month",
    description: "For active job seekers",
    features: [
      "50 job scans per day",
      "5 profiles",
      "Advanced AI matching",
      "Priority notifications",
      "30-day match history",
      "Google Sheets export",
      "Resume scoring insights",
    ],
    highlight: true,
    badge: "Most Popular",
    cta: "Upgrade to Pro",
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    period: "per month",
    description: "Maximize your job search",
    features: [
      "Unlimited job scans",
      "Unlimited profiles",
      "Premium AI matching",
      "Instant notifications",
      "Unlimited match history",
      "Google Sheets export",
      "Resume scoring insights",
      "AI cover letter drafts",
      "Application tracking",
    ],
    cta: "Upgrade to Premium",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    period: "per month",
    description: "For teams and recruitment agencies",
    features: [
      "Everything in Premium",
      "Team collaboration",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "Marketing automation",
      "Lead pipeline management",
      "Custom AI training",
    ],
    badge: "Best Value",
    cta: "Upgrade to Enterprise",
  },
];

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function PlanCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="skeleton h-5 w-24 mb-2" />
      <div className="skeleton h-9 w-20 mb-1" />
      <div className="skeleton h-3 w-32 mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-3 w-full" />
        ))}
      </div>
      <div className="skeleton h-10 w-full rounded-lg mt-6" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Usage Progress Bar
// ---------------------------------------------------------------------------

function UsageBar({ stat }: { stat: UsageStat }) {
  const percentage = Math.min((stat.current / stat.limit) * 100, 100);
  const isNearLimit = percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg ${stat.color} flex items-center justify-center`}
          >
            {stat.icon}
          </div>
          <span className="text-sm font-medium text-foreground">
            {stat.label}
          </span>
        </div>
        <span className="text-sm text-muted">
          <span
            className={`font-semibold ${
              isNearLimit ? "text-amber-600" : "text-foreground"
            }`}
          >
            {stat.current.toLocaleString()}
          </span>{" "}
          / {stat.limit.toLocaleString()} {stat.unit}
        </span>
      </div>
      <div className="h-2.5 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isNearLimit
              ? "bg-gradient-to-r from-amber-400 to-amber-500"
              : "bg-gradient-to-r from-primary to-secondary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Billing Page
// ---------------------------------------------------------------------------

export default function BillingPage() {
  const [currentPlan] = useState("free");
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  const usageStats: UsageStat[] = [
    {
      label: "Job Scans",
      current: 3,
      limit: 5,
      unit: "today",
      icon: <FiBarChart2 size={14} className="text-blue-600" />,
      color: "bg-blue-100",
    },
    {
      label: "Profiles",
      current: 1,
      limit: 1,
      unit: "profiles",
      icon: <FiUsers size={14} className="text-purple-600" />,
      color: "bg-purple-100",
    },
    {
      label: "Match History",
      current: 42,
      limit: 100,
      unit: "matches",
      icon: <FiFileText size={14} className="text-cyan-600" />,
      color: "bg-cyan-100",
    },
    {
      label: "AI Credits",
      current: 8,
      limit: 10,
      unit: "credits",
      icon: <FiZap size={14} className="text-amber-600" />,
      color: "bg-amber-100",
    },
  ];

  const handleUpgrade = async (tierId: string) => {
    if (tierId === currentPlan) return;
    setUpgrading(tierId);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(
        `Upgrade to ${
          PRICING_TIERS.find((t) => t.id === tierId)?.name
        } initiated! Redirecting to checkout...`
      );
    } catch {
      toast.error("Failed to initiate upgrade. Please try again.");
    } finally {
      setUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    toast.success("Redirecting to billing portal...");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Billing &amp; Subscription
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage your plan, usage, and payment details
          </p>
        </div>
        <button
          onClick={handleManageBilling}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
        >
          <FiCreditCard size={16} />
          Manage Billing
        </button>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
              <FiStar size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {PRICING_TIERS.find((t) => t.id === currentPlan)?.name} Plan
                </h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Active
                </span>
              </div>
              <p className="text-sm text-muted mt-0.5">
                {PRICING_TIERS.find((t) => t.id === currentPlan)?.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              ${PRICING_TIERS.find((t) => t.id === currentPlan)?.price}
              <span className="text-sm font-normal text-muted">/mo</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted mt-1">
              <FiClock size={11} />
              {currentPlan === "free"
                ? "No expiration"
                : "Renews on Mar 25, 2026"}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <FiTrendingUp size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Usage This Period
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usageStats.map((stat) => (
            <UsageBar key={stat.label} stat={stat} />
          ))}
        </div>
      </div>

      {/* Pricing Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${
            billingCycle === "monthly" ? "text-foreground" : "text-muted"
          }`}
        >
          Monthly
        </span>
        <button
          onClick={() =>
            setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")
          }
          className={`relative w-12 h-6 rounded-full transition-colors ${
            billingCycle === "annual" ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              billingCycle === "annual"
                ? "translate-x-6"
                : "translate-x-0.5"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${
            billingCycle === "annual" ? "text-foreground" : "text-muted"
          }`}
        >
          Annual
        </span>
        {billingCycle === "annual" && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            Save 20%
          </span>
        )}
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRICING_TIERS.map((tier) => {
          const isCurrent = tier.id === currentPlan;
          const displayPrice =
            billingCycle === "annual"
              ? Math.round(tier.price * 0.8)
              : tier.price;

          return (
            <div
              key={tier.id}
              className={`relative bg-white rounded-xl border p-6 flex flex-col transition-all hover:shadow-md ${
                tier.highlight
                  ? "border-primary shadow-md shadow-primary/10"
                  : "border-border"
              } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white whitespace-nowrap">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-foreground">
                    ${displayPrice}
                  </span>
                  <span className="text-sm text-muted">
                    {tier.price === 0 ? "forever" : "/mo"}
                  </span>
                </div>
                {billingCycle === "annual" && tier.price > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ${displayPrice * 12}/year (save ${(tier.price - displayPrice) * 12})
                  </p>
                )}
                <p className="text-xs text-muted mt-2">{tier.description}</p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <FiCheck
                      size={14}
                      className="text-green-500 flex-shrink-0 mt-0.5"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(tier.id)}
                disabled={isCurrent || upgrading === tier.id}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isCurrent
                    ? "bg-surface text-muted cursor-default"
                    : tier.highlight
                    ? "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                } disabled:opacity-60`}
              >
                {upgrading === tier.id ? (
                  <>
                    <FiLoader size={14} className="animate-spin" />
                    Processing...
                  </>
                ) : isCurrent ? (
                  "Current Plan"
                ) : (
                  <>
                    {tier.cta}
                    <FiArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Security note */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FiShield size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Secure Payments
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              All payments are processed securely through Stripe. We never store
              your payment information on our servers. Your data is protected
              with AES-256-GCM encryption. Cancel or change your plan at any
              time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
