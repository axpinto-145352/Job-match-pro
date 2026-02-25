"use client";

import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiFilter,
  FiX,
  FiMail,
  FiGlobe,
  FiLoader,
  FiChevronRight,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiArrowLeft,
  FiRefreshCw,
  FiTarget,
} from "react-icons/fi";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LeadStage = "NEW" | "CONTACTED" | "ENGAGED" | "QUALIFIED" | "CONVERTED";

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  score: number;
  stage: LeadStage;
  phone?: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGES: { key: LeadStage; label: string; color: string; bgColor: string }[] = [
  {
    key: "NEW",
    label: "New",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
  },
  {
    key: "CONTACTED",
    label: "Contacted",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
  },
  {
    key: "ENGAGED",
    label: "Engaged",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
  },
  {
    key: "QUALIFIED",
    label: "Qualified",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50 border-cyan-200",
  },
  {
    key: "CONVERTED",
    label: "Converted",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
  },
];

const SOURCE_OPTIONS = [
  "Website",
  "LinkedIn",
  "Referral",
  "Cold Outreach",
  "Social Media",
  "Event",
  "Other",
];

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function LeadCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-border p-3 mb-2">
      <div className="skeleton h-4 w-32 mb-2" />
      <div className="skeleton h-3 w-40 mb-2" />
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-5 w-8 rounded-full" />
      </div>
    </div>
  );
}

function ColumnSkeleton() {
  return (
    <div className="flex-shrink-0 w-72">
      <div className="skeleton h-5 w-24 mb-3 rounded" />
      <LeadCardSkeleton />
      <LeadCardSkeleton />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score Badge
// ---------------------------------------------------------------------------

function ScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-blue-100 text-blue-700";
    if (score >= 40) return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getColor()}`}
    >
      <FiStar size={9} />
      {score}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Lead Card
// ---------------------------------------------------------------------------

function LeadCard({
  lead,
  onEdit,
  onDelete,
  onMove,
}: {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, stage: LeadStage) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const currentStageIndex = STAGES.findIndex((s) => s.key === lead.stage);

  return (
    <div className="bg-white rounded-lg border border-border p-3 mb-2 hover:shadow-sm hover:border-primary/30 transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-1.5">
        <h4 className="text-sm font-semibold text-foreground truncate flex-1">
          {lead.name}
        </h4>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-muted hover:text-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiMoreVertical size={14} />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-6 z-20 bg-white rounded-lg border border-border shadow-lg py-1 min-w-[140px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(lead);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-surface transition-colors"
                >
                  <FiEdit2 size={13} />
                  Edit
                </button>
                {currentStageIndex < STAGES.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(lead.id, STAGES[currentStageIndex + 1].key);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-surface transition-colors"
                  >
                    <FiChevronRight size={13} />
                    Move to {STAGES[currentStageIndex + 1].label}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(lead.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 size={13} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted mb-1.5 truncate">
        <FiMail size={11} />
        <span className="truncate">{lead.email}</span>
      </div>

      {lead.company && (
        <div className="flex items-center gap-1 text-xs text-muted mb-1.5">
          <FiGlobe size={11} />
          <span className="truncate">{lead.company}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface text-muted">
          {lead.source}
        </span>
        <ScoreBadge score={lead.score} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add/Edit Lead Modal
// ---------------------------------------------------------------------------

function LeadFormModal({
  lead,
  onClose,
  onSave,
}: {
  lead: Lead | null;
  onClose: () => void;
  onSave: (data: Partial<Lead>) => void;
}) {
  const [name, setName] = useState(lead?.name ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [company, setCompany] = useState(lead?.company ?? "");
  const [source, setSource] = useState(lead?.source ?? "Website");
  const [score, setScore] = useState(lead?.score ?? 50);
  const [stage, setStage] = useState<LeadStage>(lead?.stage ?? "NEW");
  const [notes, setNotes] = useState(lead?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      onSave({
        ...(lead ? { id: lead.id } : {}),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        source,
        score,
        stage,
        notes: notes.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
            <FiUsers size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {lead ? "Edit Lead" : "Add New Lead"}
            </h2>
            <p className="text-xs text-muted">
              {lead
                ? "Update lead information"
                : "Add a lead to your pipeline"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Score (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) =>
                  setScore(
                    Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                  )
                }
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this lead..."
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
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <FiLoader size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>{lead ? "Update Lead" : "Add Lead"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Leads Pipeline Page
// ---------------------------------------------------------------------------

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data.leads ?? data ?? []);
    } catch {
      // Use placeholder data on failure
      setLeads([
        {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah@techcorp.com",
          source: "LinkedIn",
          score: 85,
          stage: "NEW",
          company: "TechCorp",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Mike Chen",
          email: "mike.chen@startup.io",
          source: "Website",
          score: 72,
          stage: "CONTACTED",
          company: "StartupIO",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Emily Davis",
          email: "emily.d@design.co",
          source: "Referral",
          score: 91,
          stage: "ENGAGED",
          company: "Design Co",
          createdAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Alex Thompson",
          email: "alex@enterprise.com",
          source: "Cold Outreach",
          score: 65,
          stage: "QUALIFIED",
          company: "Enterprise Inc",
          createdAt: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Lisa Wang",
          email: "lisa.wang@growth.dev",
          source: "Social Media",
          score: 95,
          stage: "CONVERTED",
          company: "Growth Dev",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource =
      sourceFilter === "ALL" || lead.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  // Group leads by stage
  const leadsByStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage.key] = filteredLeads.filter((l) => l.stage === stage.key);
      return acc;
    },
    {} as Record<LeadStage, Lead[]>
  );

  // Handle save (add or update)
  const handleSaveLead = (data: Partial<Lead>) => {
    if (data.id) {
      // Update
      setLeads((prev) =>
        prev.map((l) => (l.id === data.id ? { ...l, ...data } as Lead : l))
      );
      toast.success("Lead updated successfully");
    } else {
      // Add
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        name: data.name ?? "",
        email: data.email ?? "",
        source: data.source ?? "Website",
        score: data.score ?? 50,
        stage: data.stage ?? "NEW",
        phone: data.phone,
        company: data.company,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };
      setLeads((prev) => [newLead, ...prev]);
      toast.success("Lead added to pipeline");
    }
    setShowAddModal(false);
    setEditingLead(null);
  };

  // Handle delete
  const handleDeleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success("Lead removed from pipeline");
  };

  // Handle move stage
  const handleMoveLead = (id: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stage: newStage } : l))
    );
    const stageLabel = STAGES.find((s) => s.key === newStage)?.label;
    toast.success(`Lead moved to ${stageLabel}`);
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
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
              Lead Pipeline
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Manage and track your leads through the conversion funnel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            className="p-2 text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <FiPlus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, email, or company..."
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter size={14} className="text-muted" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            >
              <option value="ALL">All Sources</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <FiTarget size={12} />
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {loading ? (
            <>
              <ColumnSkeleton />
              <ColumnSkeleton />
              <ColumnSkeleton />
              <ColumnSkeleton />
              <ColumnSkeleton />
            </>
          ) : (
            STAGES.map((stage) => (
              <div key={stage.key} className="w-72 flex-shrink-0">
                {/* Column header */}
                <div
                  className={`rounded-t-xl border border-b-0 px-4 py-3 ${stage.bgColor}`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-semibold ${stage.color}`}
                    >
                      {stage.label}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.color} bg-white/60`}
                    >
                      {leadsByStage[stage.key]?.length ?? 0}
                    </span>
                  </div>
                </div>

                {/* Column body */}
                <div className="bg-surface/50 rounded-b-xl border border-t-0 border-border p-2 min-h-[300px]">
                  {leadsByStage[stage.key]?.length === 0 ? (
                    <div className="py-8 text-center">
                      <FiUsers
                        size={24}
                        className="mx-auto text-muted/40 mb-2"
                      />
                      <p className="text-xs text-muted">No leads</p>
                    </div>
                  ) : (
                    leadsByStage[stage.key]?.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onEdit={(l) => setEditingLead(l)}
                        onDelete={handleDeleteLead}
                        onMove={handleMoveLead}
                      />
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingLead) && (
        <LeadFormModal
          lead={editingLead}
          onClose={() => {
            setShowAddModal(false);
            setEditingLead(null);
          }}
          onSave={handleSaveLead}
        />
      )}
    </div>
  );
}
