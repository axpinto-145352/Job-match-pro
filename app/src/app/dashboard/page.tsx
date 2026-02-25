"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiBookmark,
  FiExternalLink,
  FiArchive,
  FiFlag,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiTrendingUp,
  FiInbox,
  FiSliders,
} from "react-icons/fi";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string;
  postedAt: string | null;
  remote: boolean;
  salary: string | null;
}

interface UserJob {
  id: string;
  userId: string;
  jobId: string;
  profileId: string | null;
  aiScore: number | null;
  aiReason: string | null;
  status: "NEW" | "SAVED" | "APPLIED" | "ARCHIVED";
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
  job: Job;
  profile: { id: string; name: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface JobsResponse {
  jobs: UserJob[];
  pagination: Pagination;
}

type StatusFilter = "" | "NEW" | "SAVED" | "APPLIED" | "ARCHIVED";
type SortOption = "score_desc" | "date_desc" | "score_asc" | "date_asc";
type ViewMode = "grid" | "list";

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getScoreClass(score: number | null): string {
  if (score === null) return "bg-gray-100 text-gray-500";
  if (score >= 80) return "score-excellent";
  if (score >= 60) return "score-good";
  if (score >= 40) return "score-fair";
  return "score-poor";
}

function getScoreLabel(score: number | null): string {
  if (score === null) return "N/A";
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
}

function getStatusBadge(status: string): { bg: string; text: string } {
  switch (status) {
    case "NEW":
      return { bg: "bg-blue-100 text-blue-700", text: "New" };
    case "SAVED":
      return { bg: "bg-purple-100 text-purple-700", text: "Saved" };
    case "APPLIED":
      return { bg: "bg-green-100 text-green-700", text: "Applied" };
    case "ARCHIVED":
      return { bg: "bg-gray-100 text-gray-500", text: "Archived" };
    default:
      return { bg: "bg-gray-100 text-gray-500", text: status };
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCompanyInitial(company: string): string {
  return company.charAt(0).toUpperCase();
}

function getCompanyColor(company: string): string {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-cyan-500 to-cyan-600",
    "from-emerald-500 to-emerald-600",
    "from-orange-500 to-orange-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
    "from-teal-500 to-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function StatsBarSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-5 w-32 rounded" />
      ))}
    </div>
  );
}

function JobCardSkeleton({ view }: { view: ViewMode }) {
  if (view === "list") {
    return (
      <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
        <div className="skeleton w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-48 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        <div className="skeleton h-8 w-16 rounded-full" />
        <div className="skeleton h-8 w-20 rounded-full" />
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="skeleton w-11 h-11 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton h-10 w-full rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-8 flex-1 rounded-lg" />
        <div className="skeleton h-8 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6">
        <FiInbox size={36} className="text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasFilters ? "No jobs match your filters" : "No jobs yet"}
      </h3>
      <p className="text-muted text-sm max-w-sm">
        {hasFilters
          ? "Try adjusting your search criteria or clearing filters to see more results."
          : "Jobs will appear here once your search profiles start finding matches. Make sure you have an active profile set up."}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Job card component
// ---------------------------------------------------------------------------

function JobCard({
  userJob,
  view,
  onStatusChange,
  onFlag,
}: {
  userJob: UserJob;
  view: ViewMode;
  onStatusChange: (id: string, status: UserJob["status"]) => void;
  onFlag: (id: string) => void;
}) {
  const { job, aiScore, aiReason, status, flagged } = userJob;
  const scoreBadge = getScoreClass(aiScore);
  const statusBadge = getStatusBadge(status);

  if (view === "list") {
    return (
      <div className="bg-white rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/20 transition-all group">
        <div className="flex items-center gap-4">
          {/* Company logo */}
          <div
            className={`w-11 h-11 rounded-lg bg-gradient-to-br ${getCompanyColor(
              job.company
            )} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
          >
            {getCompanyInitial(job.company)}
          </div>

          {/* Job info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
              <span className="truncate">{job.company}</span>
              {job.location && (
                <>
                  <span className="text-border">|</span>
                  <span className="flex items-center gap-1 truncate">
                    <FiMapPin size={11} />
                    {job.location}
                  </span>
                </>
              )}
              {job.remote && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 text-[10px] font-medium">
                  Remote
                </span>
              )}
            </div>
          </div>

          {/* Score */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${scoreBadge}`}
          >
            {aiScore !== null ? `${aiScore}%` : "N/A"}
          </div>

          {/* Status */}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusBadge.bg}`}
          >
            {statusBadge.text}
          </span>

          {/* Date */}
          <span className="text-xs text-muted flex-shrink-0 hidden lg:block w-16 text-right">
            {formatDate(job.postedAt)}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {status !== "SAVED" && (
              <button
                onClick={() => onStatusChange(userJob.id, "SAVED")}
                className="p-1.5 rounded-lg hover:bg-purple-50 text-muted hover:text-purple-600 transition-colors"
                title="Save"
              >
                <FiBookmark size={15} />
              </button>
            )}
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (status !== "APPLIED") {
                  onStatusChange(userJob.id, "APPLIED");
                }
              }}
              className="p-1.5 rounded-lg hover:bg-green-50 text-muted hover:text-green-600 transition-colors"
              title="Apply"
            >
              <FiExternalLink size={15} />
            </a>
            <button
              onClick={() => onStatusChange(userJob.id, "ARCHIVED")}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-muted hover:text-gray-600 transition-colors"
              title="Archive"
            >
              <FiArchive size={15} />
            </button>
            <button
              onClick={() => onFlag(userJob.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                flagged
                  ? "bg-red-50 text-red-500"
                  : "hover:bg-red-50 text-muted hover:text-red-500"
              }`}
              title={flagged ? "Unflag" : "Report bad score"}
            >
              <FiFlag size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all flex flex-col group">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-11 h-11 rounded-lg bg-gradient-to-br ${getCompanyColor(
            job.company
          )} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
        >
          {getCompanyInitial(job.company)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {job.title}
          </h3>
          <p className="text-xs text-muted mt-1 truncate">{job.company}</p>
        </div>
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${scoreBadge}`}
          title={`AI Score: ${aiScore ?? "N/A"} - ${getScoreLabel(aiScore)}`}
        >
          {aiScore !== null ? `${aiScore}` : "--"}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <FiMapPin size={11} />
            <span className="truncate max-w-[120px]">{job.location}</span>
          </span>
        )}
        {job.remote && (
          <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-medium">
            Remote
          </span>
        )}
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge.bg}`}>
          {statusBadge.text}
        </span>
        {job.salary && (
          <span className="text-xs text-muted truncate max-w-[120px]">
            {job.salary}
          </span>
        )}
      </div>

      {/* AI Reasoning */}
      {aiReason && (
        <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2 flex-1">
          {aiReason}
        </p>
      )}
      {!aiReason && <div className="flex-1" />}

      {/* Date */}
      <div className="flex items-center gap-1 text-[11px] text-muted mb-3">
        <FiClock size={11} />
        <span>{formatDate(job.postedAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border">
        {status !== "SAVED" ? (
          <button
            onClick={() => onStatusChange(userJob.id, "SAVED")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <FiBookmark size={13} />
            Save
          </button>
        ) : (
          <button
            onClick={() => onStatusChange(userJob.id, "NEW")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FiBookmark size={13} />
            Unsave
          </button>
        )}
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (status !== "APPLIED") {
              onStatusChange(userJob.id, "APPLIED");
            }
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <FiExternalLink size={13} />
          Apply
        </a>
        <button
          onClick={() => onStatusChange(userJob.id, "ARCHIVED")}
          className="p-2 rounded-lg text-muted hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Archive"
        >
          <FiArchive size={14} />
        </button>
        <button
          onClick={() => onFlag(userJob.id)}
          className={`p-2 rounded-lg transition-colors ${
            flagged
              ? "bg-red-50 text-red-500"
              : "text-muted hover:bg-red-50 hover:text-red-500"
          }`}
          title={flagged ? "Unflag" : "Report bad score"}
        >
          <FiFlag size={14} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination component
// ---------------------------------------------------------------------------

function PaginationBar({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg text-muted hover:bg-white hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft size={18} />
      </button>
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-muted text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-white hover:text-foreground"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg text-muted hover:bg-white hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  // State
  const [jobs, setJobs] = useState<UserJob[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("score_desc");
  const [view, setView] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Stats
  const [stats, setStats] = useState({ newToday: 0, saved: 0, applied: 0 });

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (minScore > 0) params.set("minScore", String(minScore));
      if (maxScore < 100) params.set("maxScore", String(maxScore));
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");

      const data: JobsResponse = await res.json();
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, minScore, maxScore, sort, page]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const [newRes, savedRes, appliedRes] = await Promise.all([
        fetch("/api/jobs?status=NEW&limit=1"),
        fetch("/api/jobs?status=SAVED&limit=1"),
        fetch("/api/jobs?status=APPLIED&limit=1"),
      ]);
      const [newData, savedData, appliedData] = await Promise.all([
        newRes.json(),
        savedRes.json(),
        appliedRes.json(),
      ]);
      setStats({
        newToday: newData.pagination?.total ?? 0,
        saved: savedData.pagination?.total ?? 0,
        applied: appliedData.pagination?.total ?? 0,
      });
    } catch {
      // Stats are non-critical, fail silently
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Action handlers
  const handleStatusChange = async (id: string, newStatus: UserJob["status"]) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
      );

      const labels: Record<string, string> = {
        SAVED: "Job saved",
        APPLIED: "Marked as applied",
        ARCHIVED: "Job archived",
        NEW: "Moved to inbox",
      };
      toast.success(labels[newStatus] || "Status updated");
      fetchStats();
    } catch {
      toast.error("Failed to update job status");
    }
  };

  const handleFlag = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagged: !job.flagged }),
      });

      if (!res.ok) throw new Error("Failed to flag");

      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, flagged: !j.flagged } : j))
      );

      toast.success(job.flagged ? "Flag removed" : "Reported for review");
    } catch {
      toast.error("Failed to flag job");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const hasFilters = !!(
    search ||
    statusFilter ||
    minScore > 0 ||
    maxScore < 100 ||
    remoteOnly
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Job Feed</h1>
        <p className="text-sm text-muted mt-1">
          AI-matched jobs tailored to your profiles
        </p>
      </div>

      {/* Stats Bar */}
      {loading && jobs.length === 0 ? (
        <StatsBarSkeleton />
      ) : (
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          <span className="flex items-center gap-1.5 text-muted">
            <FiStar size={14} className="text-primary" />
            <span className="font-medium text-foreground">{stats.newToday}</span>{" "}
            new jobs
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5 text-muted">
            <FiBookmark size={14} className="text-purple-500" />
            <span className="font-medium text-foreground">{stats.saved}</span>{" "}
            saved
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5 text-muted">
            <FiTrendingUp size={14} className="text-green-500" />
            <span className="font-medium text-foreground">{stats.applied}</span>{" "}
            applied
          </span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <FiSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
              showFilters || hasFilters
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted hover:bg-surface"
            }`}
          >
            <FiSliders size={15} />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
          <div className="hidden sm:flex items-center gap-1 border border-border rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`p-2 rounded-md transition-colors ${
                view === "grid"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground"
              }`}
              title="Grid view"
            >
              <FiGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`p-2 rounded-md transition-colors ${
                view === "list"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground"
              }`}
              title="List view"
            >
              <FiList size={15} />
            </button>
          </div>
        </form>

        {/* Filter row */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status */}
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All</option>
                <option value="NEW">New</option>
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Score Range */}
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">
                Min Score: {minScore}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={minScore}
                onChange={(e) => {
                  setMinScore(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">
                Max Score: {maxScore}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={maxScore}
                onChange={(e) => {
                  setMaxScore(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-primary"
              />
            </div>

            {/* Remote toggle */}
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">
                Remote Only
              </label>
              <button
                type="button"
                onClick={() => {
                  setRemoteOnly(!remoteOnly);
                  setPage(1);
                }}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  remoteOnly
                    ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                    : "border-border text-muted hover:bg-surface"
                }`}
              >
                {remoteOnly ? "Remote Only" : "All Locations"}
              </button>
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortOption);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="score_desc">Score (High to Low)</option>
                <option value="date_desc">Date (Newest)</option>
                <option value="score_asc">Score (Low to High)</option>
                <option value="date_asc">Date (Oldest)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Job Cards */}
      {loading ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} view={view} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted">
              Showing {(pagination.page - 1) * pagination.limit + 1}
              {"-"}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )}{" "}
              of {pagination.total} jobs
            </p>
            <div className="sm:hidden flex items-center gap-1 border border-border rounded-lg p-0.5">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  view === "grid"
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <FiGrid size={14} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  view === "list"
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <FiList size={14} />
              </button>
            </div>
          </div>

          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                : "space-y-3"
            }
          >
            {jobs.map((userJob) => (
              <JobCard
                key={userJob.id}
                userJob={userJob}
                view={view}
                onStatusChange={handleStatusChange}
                onFlag={handleFlag}
              />
            ))}
          </div>

          <PaginationBar
            pagination={pagination}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
}
