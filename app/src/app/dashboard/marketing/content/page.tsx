"use client";

import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiCopy,
  FiTrash2,
  FiLoader,
  FiX,
  FiZap,
  FiMessageSquare,
  FiMail,
  FiEdit3,
  FiHash,
  FiEye,
  FiRefreshCw,
  FiArrowLeft,
  FiCalendar,
  FiGrid,
  FiList,
} from "react-icons/fi";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContentType = "social" | "email" | "blog" | "seo";

interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  preview: string;
  content: string;
  createdAt: string;
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONTENT_TYPES: {
  key: ContentType | "ALL";
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}[] = [
  {
    key: "ALL",
    label: "All Types",
    icon: <FiGrid size={14} />,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  {
    key: "social",
    label: "Social Posts",
    icon: <FiMessageSquare size={14} />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    key: "email",
    label: "Email",
    icon: <FiMail size={14} />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    key: "blog",
    label: "Blog Posts",
    icon: <FiEdit3 size={14} />,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  {
    key: "seo",
    label: "SEO Content",
    icon: <FiHash size={14} />,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
];

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function ContentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton h-6 w-6 rounded" />
        <div className="skeleton h-4 w-20 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4 mb-2" />
      <div className="skeleton h-3 w-full mb-1" />
      <div className="skeleton h-3 w-2/3 mb-4" />
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-24" />
        <div className="flex gap-1">
          <div className="skeleton h-7 w-7 rounded" />
          <div className="skeleton h-7 w-7 rounded" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content type helpers
// ---------------------------------------------------------------------------

function getContentTypeInfo(type: ContentType) {
  const found = CONTENT_TYPES.find((t) => t.key === type);
  return (
    found ?? {
      label: type,
      icon: <FiFileText size={14} />,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    }
  );
}

// ---------------------------------------------------------------------------
// Content Card
// ---------------------------------------------------------------------------

function ContentCard({
  item,
  onCopy,
  onDelete,
  onPreview,
}: {
  item: ContentItem;
  onCopy: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onPreview: (item: ContentItem) => void;
}) {
  const typeInfo = getContentTypeInfo(item.type);

  return (
    <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all group">
      {/* Type badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${typeInfo.bgColor} ${typeInfo.color}`}
        >
          {typeInfo.icon}
          {typeInfo.label}
        </span>
        <span className="text-[10px] text-muted flex items-center gap-1">
          <FiCalendar size={10} />
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-1">
        {item.title}
      </h3>

      {/* Preview */}
      <p className="text-xs text-muted line-clamp-3 mb-4 leading-relaxed">
        {item.preview}
      </p>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted"
            >
              #{tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-muted">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
        <button
          onClick={() => onPreview(item)}
          className="p-2 text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
          title="Preview"
        >
          <FiEye size={14} />
        </button>
        <button
          onClick={() => onCopy(item)}
          className="p-2 text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
          title="Copy to clipboard"
        >
          <FiCopy size={14} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content Preview Modal
// ---------------------------------------------------------------------------

function ContentPreviewModal({
  item,
  onClose,
  onCopy,
}: {
  item: ContentItem;
  onClose: () => void;
  onCopy: (item: ContentItem) => void;
}) {
  const typeInfo = getContentTypeInfo(item.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-10 h-10 rounded-lg ${typeInfo.bgColor} flex items-center justify-center ${typeInfo.color}`}
          >
            {typeInfo.icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeInfo.bgColor} ${typeInfo.color}`}
              >
                {typeInfo.label}
              </span>
              <span className="text-xs text-muted">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-4 mb-4">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {item.content}
          </pre>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-muted bg-surface rounded-lg hover:bg-border transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onCopy(item);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <FiCopy size={14} />
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generate Content Modal
// ---------------------------------------------------------------------------

function GenerateContentModal({
  onClose,
  onGenerated,
}: {
  onClose: () => void;
  onGenerated: (item: ContentItem) => void;
}) {
  const [type, setType] = useState<ContentType>("social");
  const [topic, setTopic] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
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
          type,
          params: {
            topic: topic.trim(),
            additionalContext: additionalContext.trim() || undefined,
            ...(type === "social" ? { platform: "linkedin" } : {}),
            ...(type === "blog" ? { blogTopic: topic.trim() } : {}),
            ...(type === "email"
              ? { audience: topic.trim(), emailType: "promotional" }
              : {}),
          },
        }),
      });

      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();

      // Create content item from response
      const newItem: ContentItem = {
        id: `content-${Date.now()}`,
        type,
        title: topic.trim(),
        preview:
          typeof data.content === "string"
            ? data.content.substring(0, 200)
            : JSON.stringify(data.content).substring(0, 200),
        content:
          typeof data.content === "string"
            ? data.content
            : JSON.stringify(data.content, null, 2),
        createdAt: new Date().toISOString(),
        tags: [type, "ai-generated"],
      };

      onGenerated(newItem);
      toast.success("Content generated successfully!");
      onClose();
    } catch {
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
            <FiZap size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Generate Content with AI
            </h2>
            <p className="text-xs text-muted">
              Create marketing content powered by AI
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Content Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CONTENT_TYPES.filter((t) => t.key !== "ALL").map((t) => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key as ContentType)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm transition-all ${
                    type === t.key
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted hover:border-primary/30"
                  }`}
                >
                  {t.icon}
                  <span className="text-[10px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Topic / Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                type === "social"
                  ? "e.g., AI-powered job matching benefits"
                  : type === "email"
                  ? "e.g., New feature announcement"
                  : type === "blog"
                  ? "e.g., Top 10 resume tips for 2026"
                  : "e.g., Job search platform SEO"
              }
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Additional Context{" "}
              <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Add any specific instructions, keywords, tone preferences, or target audience details..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
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
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
          >
            {generating ? (
              <>
                <FiLoader size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FiZap size={14} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Content Library Page
// ---------------------------------------------------------------------------

export default function ContentLibraryPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContentType | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  // Fetch content
  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/content");
      if (!res.ok) throw new Error("Failed to fetch content");
      const data = await res.json();
      setContentItems(data.content ?? data ?? []);
    } catch {
      // Placeholder data
      setContentItems([
        {
          id: "1",
          type: "social",
          title: "AI Job Matching Launch Post",
          preview:
            "Excited to announce our AI-powered job matching platform! Using advanced NLP, we match your resume to the perfect opportunities. No more endless scrolling through job boards.",
          content:
            "Excited to announce our AI-powered job matching platform! Using advanced NLP, we match your resume to the perfect opportunities. No more endless scrolling through job boards.\n\nOur AI analyzes your skills, experience, and preferences to surface the most relevant positions.\n\n#JobSearch #AI #CareerGrowth #TechJobs",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          tags: ["launch", "social-media", "linkedin"],
        },
        {
          id: "2",
          type: "email",
          title: "Welcome Email Sequence - Day 1",
          preview:
            "Welcome to Job Match Pro! We are thrilled to have you on board. Here is how to get started with your AI-powered job search in 3 simple steps...",
          content:
            "Subject: Welcome to Job Match Pro!\n\nHi {{name}},\n\nWelcome to Job Match Pro! We are thrilled to have you on board.\n\nHere is how to get started:\n\n1. Upload your resume - Our AI will analyze your skills and experience\n2. Set your preferences - Tell us what you are looking for\n3. Get matched - Start receiving AI-scored job matches\n\nYour first matches are ready and waiting.\n\nBest,\nThe Job Match Pro Team",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          tags: ["onboarding", "email-sequence"],
        },
        {
          id: "3",
          type: "blog",
          title: "Top 10 Resume Tips for 2026",
          preview:
            "In today's competitive job market, your resume needs to stand out. Here are our top 10 tips for crafting a resume that catches both AI and human attention...",
          content:
            "# Top 10 Resume Tips for 2026\n\nIn today's competitive job market, your resume needs to stand out. Here are our top 10 tips:\n\n1. Optimize for ATS systems\n2. Quantify your achievements\n3. Use action verbs\n4. Tailor for each application\n5. Keep it concise (1-2 pages)\n6. Include relevant keywords\n7. Highlight remote work experience\n8. Add a skills section\n9. Use a clean, modern format\n10. Proofread meticulously",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          tags: ["resume", "career-advice", "tips"],
        },
        {
          id: "4",
          type: "seo",
          title: "AI Job Matching Platform - Landing Page SEO",
          preview:
            "Meta title: AI Job Matching | Find Your Perfect Role with Smart Resume Scoring. Meta description: Job Match Pro uses AI to analyze your resume and score job matches...",
          content:
            "Meta Title: AI Job Matching | Find Your Perfect Role with Smart Resume Scoring\n\nMeta Description: Job Match Pro uses AI to analyze your resume and score job matches. Upload your resume and get matched with opportunities that fit your skills and preferences.\n\nH1: Find Your Dream Job with AI-Powered Matching\n\nKeywords: AI job matching, resume scoring, job search platform, career matching, smart job search",
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          tags: ["seo", "landing-page", "keywords"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Filter content
  const filteredContent = contentItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesType = typeFilter === "ALL" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Handle copy
  const handleCopy = (item: ContentItem) => {
    navigator.clipboard.writeText(item.content);
    toast.success("Content copied to clipboard!");
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setContentItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Content deleted");
  };

  // Handle generated
  const handleGenerated = (item: ContentItem) => {
    setContentItems((prev) => [item, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/marketing"
            className="p-2 text-muted hover:text-foreground rounded-lg hover:bg-surface transition-colors"
          >
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Content Library
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Browse, manage, and generate AI-powered marketing content
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchContent}
            className="p-2 text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <FiZap size={16} />
            Generate New
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content by title, text, or tags..."
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Type filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {CONTENT_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() =>
                  setTypeFilter(t.key as ContentType | "ALL")
                }
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  typeFilter === t.key
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:text-foreground"
              }`}
              title="Grid view"
            >
              <FiGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:text-foreground"
              }`}
              title="List view"
            >
              <FiList size={14} />
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 mt-3 text-xs text-muted">
          <FiFilter size={11} />
          {filteredContent.length} item
          {filteredContent.length !== 1 ? "s" : ""}
          {typeFilter !== "ALL" &&
            ` in ${CONTENT_TYPES.find((t) => t.key === typeFilter)?.label}`}
        </div>
      </div>

      {/* Content Grid / List */}
      {loading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="bg-white rounded-xl border border-border py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
            <FiFileText size={28} className="text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {searchQuery || typeFilter !== "ALL"
              ? "No matching content found"
              : "No content yet"}
          </h3>
          <p className="text-xs text-muted mb-4">
            {searchQuery || typeFilter !== "ALL"
              ? "Try adjusting your search or filters"
              : "Generate your first piece of AI-powered marketing content"}
          </p>
          {!searchQuery && typeFilter === "ALL" && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <FiZap size={14} />
              Generate Content
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onPreview={setPreviewItem}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredContent.map((item) => {
            const typeInfo = getContentTypeInfo(item.type);
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-border p-4 hover:shadow-sm hover:border-primary/30 transition-all flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${typeInfo.bgColor} flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}
                >
                  {typeInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {item.preview}
                  </p>
                </div>
                <span className="text-[10px] text-muted flex-shrink-0 hidden sm:block">
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="p-2 text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <FiEye size={14} />
                  </button>
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-2 text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    title="Copy"
                  >
                    <FiCopy size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <GenerateContentModal
          onClose={() => setShowGenerateModal(false)}
          onGenerated={handleGenerated}
        />
      )}

      {/* Preview Modal */}
      {previewItem && (
        <ContentPreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onCopy={handleCopy}
        />
      )}
    </div>
  );
}
