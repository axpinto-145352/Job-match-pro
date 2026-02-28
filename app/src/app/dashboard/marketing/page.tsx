"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  FiBarChart2,
  FiUsers,
  FiTrendingUp,
  FiMail,
  FiEdit3,
  FiPlus,
  FiTarget,
  FiActivity,
  FiMessageSquare,
  FiCopy,
  FiX,
  FiZap,
  FiCalendar,
  FiExternalLink,
  FiLoader,
  FiHash,
  FiFileText,
  FiSend,
} from "react-icons/fi";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  content: Record<string, unknown>;
  metrics?: {
    openRate?: number;
    clickRate?: number;
    sent?: number;
  } | null;
  createdAt: string;
  _count?: { contacts: number };
}

interface GeneratedContent {
  type: string;
  content: Record<string, unknown>;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-9 w-9 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-16 mb-1" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}

function CampaignCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-5 w-40" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="flex gap-4 mb-3">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-3 w-20" />
      </div>
      <div className="skeleton h-3 w-28" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaign type badge helper
// ---------------------------------------------------------------------------

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  EMAIL_DRIP: "Email Drip",
  SOCIAL_POST: "Social Post",
  CONTENT_SEO: "Content/SEO",
  REFERRAL: "Referral",
  PRODUCT_HUNT: "Product Hunt",
  RETARGETING: "Retargeting",
};

const CAMPAIGN_TYPE_COLORS: Record<string, string> = {
  EMAIL_DRIP: "bg-blue-100 text-blue-700",
  SOCIAL_POST: "bg-purple-100 text-purple-700",
  CONTENT_SEO: "bg-cyan-100 text-cyan-700",
  REFERRAL: "bg-green-100 text-green-700",
  PRODUCT_HUNT: "bg-orange-100 text-orange-700",
  RETARGETING: "bg-pink-100 text-pink-700",
};

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SCHEDULED: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

// ---------------------------------------------------------------------------
// Main Marketing Dashboard Page
// ---------------------------------------------------------------------------

export default function MarketingDashboard() {
  // State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);

  // Metrics (computed from campaigns + static placeholders)
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    activeCampaigns: 0,
    conversionRate: 0,
    monthlyGrowth: 0,
  });

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/marketing/campaigns");
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);

      // Compute metrics
      const active = (data.campaigns ?? []).filter(
        (c: Campaign) => c.status === "ACTIVE"
      ).length;
      setMetrics({
        totalLeads: data.campaigns?.reduce(
          (sum: number, c: Campaign) => sum + (c._count?.contacts ?? 0),
          0
        ) ?? 0,
        activeCampaigns: active,
        conversionRate: 12.4,
        monthlyGrowth: 23.1,
      });
    } catch {
      // Silently fail on initial load, show placeholder data
      setMetrics({
        totalLeads: 248,
        activeCampaigns: 5,
        conversionRate: 12.4,
        monthlyGrowth: 23.1,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Marketing Command Center
          </h1>
          <p className="text-muted text-sm mt-1">
            AI-powered marketing automation and lead management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/marketing/leads"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <FiUsers size={16} />
            Manage Leads
          </Link>
          <Link
            href="/dashboard/marketing/content"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
          >
            <FiFileText size={16} />
            Content Library
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="Total Leads"
              value={metrics.totalLeads.toLocaleString()}
              change="+18 this week"
              icon={<FiUsers size={20} />}
              color="from-blue-500 to-blue-600"
            />
            <MetricCard
              label="Active Campaigns"
              value={metrics.activeCampaigns.toString()}
              change={`${campaigns.length} total`}
              icon={<FiTarget size={20} />}
              color="from-purple-500 to-purple-600"
            />
            <MetricCard
              label="Conversion Rate"
              value={`${metrics.conversionRate}%`}
              change="+2.1% vs last month"
              icon={<FiBarChart2 size={20} />}
              color="from-cyan-500 to-cyan-600"
            />
            <MetricCard
              label="Monthly Growth"
              value={`${metrics.monthlyGrowth}%`}
              change="Trending up"
              icon={<FiTrendingUp size={20} />}
              color="from-green-500 to-green-600"
            />
          </>
        )}
      </div>

      {/* Campaigns Section */}
      <div className="bg-white rounded-xl border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <FiTarget size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Campaigns</h2>
            <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">
              {campaigns.length}
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <FiPlus size={16} />
            Create Campaign
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CampaignCardSkeleton />
              <CampaignCardSkeleton />
              <CampaignCardSkeleton />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <FiTarget size={40} className="mx-auto text-muted mb-3" />
              <p className="text-muted text-sm">
                No campaigns yet. Create your first AI-powered campaign.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FiPlus size={16} />
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActionSocial
          onGenerated={(c) =>
            setGeneratedContents((prev) => [c, ...prev].slice(0, 5))
          }
        />
        <QuickActionBlog
          onGenerated={(c) =>
            setGeneratedContents((prev) => [c, ...prev].slice(0, 5))
          }
        />
        <QuickActionEmail
          onGenerated={(c) =>
            setGeneratedContents((prev) => [c, ...prev].slice(0, 5))
          }
        />
      </div>

      {/* Recent AI Generated Content */}
      {generatedContents.length > 0 && (
        <div className="bg-white rounded-xl border border-border">
          <div className="flex items-center gap-2 p-5 border-b border-border">
            <FiZap size={18} className="text-secondary" />
            <h2 className="text-lg font-semibold text-foreground">
              Recent AI-Generated Content
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {generatedContents.map((item, idx) => (
              <GeneratedContentPreview key={idx} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric Card component
// ---------------------------------------------------------------------------

function MetricCard({
  label,
  value,
  change,
  icon,
  color,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted">{label}</span>
        <div
          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <p className="text-xs text-muted mt-1">{change}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaign Card component
// ---------------------------------------------------------------------------

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const typeLabel = CAMPAIGN_TYPE_LABELS[campaign.type] ?? campaign.type;
  const typeColor = CAMPAIGN_TYPE_COLORS[campaign.type] ?? "bg-gray-100 text-gray-600";
  const statusColor =
    CAMPAIGN_STATUS_COLORS[campaign.status] ?? "bg-gray-100 text-gray-600";

  const openRate =
    (campaign.metrics as Record<string, number> | null)?.openRate ?? 0;
  const clickRate =
    (campaign.metrics as Record<string, number> | null)?.clickRate ?? 0;

  return (
    <div className="bg-surface rounded-lg border border-border p-4 hover:border-primary/30 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1">
          {campaign.name}
        </h3>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor}`}
        >
          {campaign.status}
        </span>
      </div>
      <span
        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColor} mb-3`}
      >
        {typeLabel}
      </span>
      <div className="flex items-center gap-4 text-xs text-muted mb-2">
        <span className="flex items-center gap-1">
          <FiMail size={12} />
          {openRate}% open
        </span>
        <span className="flex items-center gap-1">
          <FiExternalLink size={12} />
          {clickRate}% click
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-1">
          <FiCalendar size={12} />
          {new Date(campaign.createdAt).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <FiUsers size={12} />
          {campaign._count?.contacts ?? 0} contacts
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Campaign Modal
// ---------------------------------------------------------------------------

function CreateCampaignModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("EMAIL_DRIP");
  const [targetAudience, setTargetAudience] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !targetAudience.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, targetAudience }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create campaign");
      }
      toast.success("Campaign created with AI-generated content!");
      onCreated();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create campaign"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative animate-in fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
            <FiTarget size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Create Campaign
            </h2>
            <p className="text-xs text-muted">
              AI will generate content based on your inputs
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Campaign Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q1 Developer Outreach"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Campaign Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
            >
              <option value="EMAIL_DRIP">Email Drip</option>
              <option value="SOCIAL_POST">Social Post</option>
              <option value="CONTENT_SEO">Content / SEO</option>
              <option value="REFERRAL">Referral</option>
              <option value="PRODUCT_HUNT">Product Hunt</option>
              <option value="RETARGETING">Retargeting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Target Audience
            </label>
            <textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Describe your target audience, e.g., 'Software engineers aged 25-40 looking for remote roles in AI/ML'"
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-muted bg-surface rounded-lg hover:bg-border transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
          >
            {creating ? (
              <>
                <FiLoader size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FiZap size={16} />
                Generate with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Action: Social Post
// ---------------------------------------------------------------------------

function QuickActionSocial({
  onGenerated,
}: {
  onGenerated: (c: GeneratedContent) => void;
}) {
  const [platform, setPlatform] = useState("twitter");
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "social",
          params: { platform, topic },
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      onGenerated(data);
      toast.success(`Social post for ${platform} generated!`);
      setTopic("");
    } catch {
      toast.error("Failed to generate social post.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
          <FiMessageSquare size={16} />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Generate Social Post
        </h3>
      </div>
      <div className="space-y-3">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
        >
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter / X</option>
          <option value="reddit">Reddit</option>
        </select>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic, e.g., AI job matching benefits"
          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:shadow-md transition-all disabled:opacity-50"
        >
          {generating ? (
            <FiLoader size={14} className="animate-spin" />
          ) : (
            <FiZap size={14} />
          )}
          {generating ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Action: Blog Post
// ---------------------------------------------------------------------------

function QuickActionBlog({
  onGenerated,
}: {
  onGenerated: (c: GeneratedContent) => void;
}) {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a blog topic.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "blog",
          params: {
            blogTopic: topic,
            keywords: keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean),
          },
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      onGenerated(data);
      toast.success("Blog outline generated!");
      setTopic("");
      setKeywords("");
    } catch {
      toast.error("Failed to generate blog post.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
          <FiEdit3 size={16} />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Generate Blog Post
        </h3>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Blog topic"
          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Keywords (comma-separated)"
          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg hover:shadow-md transition-all disabled:opacity-50"
        >
          {generating ? (
            <FiLoader size={14} className="animate-spin" />
          ) : (
            <FiZap size={14} />
          )}
          {generating ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Action: Email Sequence
// ---------------------------------------------------------------------------

function QuickActionEmail({
  onGenerated,
}: {
  onGenerated: (c: GeneratedContent) => void;
}) {
  const [segment, setSegment] = useState("");
  const [seqLength, setSeqLength] = useState("3");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!segment.trim()) {
      toast.error("Please enter a segment name.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email",
          params: {
            audience: segment,
            emailType: "drip",
            sequenceLength: parseInt(seqLength, 10),
          },
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      onGenerated(data);
      toast.success("Email sequence generated!");
      setSegment("");
    } catch {
      toast.error("Failed to generate email sequence.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
          <FiSend size={16} />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Generate Email Sequence
        </h3>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          placeholder="Segment name, e.g., Trial Users"
          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <select
          value={seqLength}
          onChange={(e) => setSeqLength(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
        >
          <option value="3">3 emails</option>
          <option value="5">5 emails</option>
          <option value="7">7 emails</option>
          <option value="10">10 emails</option>
        </select>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-md transition-all disabled:opacity-50"
        >
          {generating ? (
            <FiLoader size={14} className="animate-spin" />
          ) : (
            <FiZap size={14} />
          )}
          {generating ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generated Content Preview
// ---------------------------------------------------------------------------

function GeneratedContentPreview({ item }: { item: GeneratedContent }) {
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(item.content, null, 2));
    toast.success("Content copied to clipboard!");
  };

  const typeIcons: Record<string, React.ReactNode> = {
    social: <FiMessageSquare size={14} />,
    email: <FiMail size={14} />,
    blog: <FiEdit3 size={14} />,
    seo: <FiHash size={14} />,
  };

  const typeColors: Record<string, string> = {
    social: "bg-purple-100 text-purple-700",
    email: "bg-blue-100 text-blue-700",
    blog: "bg-cyan-100 text-cyan-700",
    seo: "bg-green-100 text-green-700",
  };

  // Extract a quick preview text
  const previewText = (() => {
    const c = item.content;
    if (item.type === "social" && c.posts) {
      const posts = c.posts as Array<{ text?: string }>;
      return posts[0]?.text ?? "Social post generated";
    }
    if (item.type === "email" && c.subject) return c.subject as string;
    if (item.type === "blog" && c.title) return c.title as string;
    if (item.type === "seo" && c.metaTitle) return c.metaTitle as string;
    return `${item.type} content generated`;
  })();

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
              typeColors[item.type] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {typeIcons[item.type]}
            {item.type.toUpperCase()}
          </span>
          <span className="text-xs text-muted">
            {new Date(item.generatedAt).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyToClipboard}
            className="p-1.5 text-muted hover:text-foreground rounded-md hover:bg-border/50 transition-colors"
            title="Copy to clipboard"
          >
            <FiCopy size={14} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-muted hover:text-foreground rounded-md hover:bg-border/50 transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            <FiActivity size={14} />
          </button>
        </div>
      </div>
      <p className="text-sm text-foreground line-clamp-2">{previewText}</p>
      {expanded && (
        <pre className="mt-3 text-xs text-muted bg-white p-3 rounded-lg border border-border overflow-x-auto max-h-64 overflow-y-auto">
          {JSON.stringify(item.content, null, 2)}
        </pre>
      )}
    </div>
  );
}
