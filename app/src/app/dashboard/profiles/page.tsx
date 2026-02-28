"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEdit,
  FiTrash,
  FiX,
  FiMapPin,
  FiTag,
  FiAlertCircle,
  FiCheck,
  FiFileText,
  FiDollarSign,
  FiWifi,
  FiLoader,
} from "react-icons/fi";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchProfile {
  id: string;
  userId: string;
  name: string;
  resumeText: string | null;
  keywords: string[];
  locations: string[];
  dealBreakers: string[];
  minSalary: number | null;
  maxSalary: number | null;
  remote: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileFormData {
  name: string;
  resumeText: string;
  keywords: string[];
  locations: string[];
  dealBreakers: string[];
  minSalary: string;
  maxSalary: string;
  remote: boolean;
}

const EMPTY_FORM: ProfileFormData = {
  name: "",
  resumeText: "",
  keywords: [],
  locations: [],
  dealBreakers: [],
  minSalary: "",
  maxSalary: "",
  remote: false,
};

// ---------------------------------------------------------------------------
// Tag Input component
// ---------------------------------------------------------------------------

function TagInput({
  label,
  tags,
  onChange,
  maxTags,
  placeholder,
  icon,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags: number;
  placeholder: string;
  icon: React.ReactNode;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const value = input.trim();
    if (!value) return;
    if (tags.includes(value)) {
      toast.error("Already added");
      return;
    }
    if (tags.length >= maxTags) {
      toast.error(`Maximum ${maxTags} ${label.toLowerCase()} allowed`);
      return;
    }
    onChange([...tags, value]);
    setInput("");
  };

  const removeTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1.5">
        {icon}
        {label}
        <span className="text-muted/60">
          ({tags.length}/{maxTags})
        </span>
      </label>
      <div
        className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all min-h-[42px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              className="hover:text-danger transition-colors"
            >
              <FiX size={12} />
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (input.trim()) addTag();
            }}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[100px] text-sm text-foreground placeholder-muted outline-none bg-transparent"
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile Form Modal
// ---------------------------------------------------------------------------

function ProfileFormModal({
  profile,
  onClose,
  onSave,
}: {
  profile: SearchProfile | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState<ProfileFormData>(
    profile
      ? {
          name: profile.name,
          resumeText: profile.resumeText ?? "",
          keywords: [...profile.keywords],
          locations: [...profile.locations],
          dealBreakers: [...profile.dealBreakers],
          minSalary: profile.minSalary ? String(profile.minSalary) : "",
          maxSalary: profile.maxSalary ? String(profile.maxSalary) : "",
          remote: profile.remote,
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const isEditing = !!profile;

  const validate = (): boolean => {
    const errs: string[] = [];
    if (form.name.trim().length < 3) errs.push("Name must be at least 3 characters");
    if (form.name.trim().length > 50) errs.push("Name must be at most 50 characters");
    if (form.resumeText.length > 5000)
      errs.push("Resume text must be at most 5000 characters");
    if (form.minSalary && form.maxSalary) {
      const min = Number(form.minSalary);
      const max = Number(form.maxSalary);
      if (max < min) errs.push("Max salary must be greater than or equal to min salary");
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const body = {
      name: form.name.trim(),
      resumeText: form.resumeText || undefined,
      keywords: form.keywords,
      locations: form.locations,
      dealBreakers: form.dealBreakers,
      minSalary: form.minSalary ? Number(form.minSalary) : undefined,
      maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
      remote: form.remote,
    };

    try {
      const url = isEditing ? `/api/profiles/${profile.id}` : "/api/profiles";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403) {
          toast.error(data.message || "Profile limit reached. Please upgrade.");
        } else {
          toast.error(data.error || "Failed to save profile");
        }
        setSaving(false);
        return;
      }

      toast.success(isEditing ? "Profile updated" : "Profile created");
      onSave();
      onClose();
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-foreground">
            {isEditing ? "Edit Profile" : "Create New Profile"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface text-muted hover:text-foreground transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600 flex items-center gap-1.5">
                  <FiAlertCircle size={12} />
                  {err}
                </p>
              ))}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted mb-1.5 block">
              Profile Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Senior React Developer"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Resume text */}
          <div>
            <label className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1.5">
              <FiFileText size={12} />
              Resume / Skills Summary
              <span className="text-muted/60">
                ({form.resumeText.length}/5000)
              </span>
            </label>
            <textarea
              value={form.resumeText}
              onChange={(e) =>
                setForm({ ...form, resumeText: e.target.value.slice(0, 5000) })
              }
              placeholder="Paste your resume text or a summary of your experience and skills..."
              rows={5}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
            <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  form.resumeText.length > 4500
                    ? "bg-red-400"
                    : form.resumeText.length > 3000
                    ? "bg-yellow-400"
                    : "bg-primary"
                }`}
                style={{
                  width: `${Math.min(
                    (form.resumeText.length / 5000) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Keywords */}
          <TagInput
            label="Keywords"
            tags={form.keywords}
            onChange={(keywords) => setForm({ ...form, keywords })}
            maxTags={10}
            placeholder="Type a keyword and press Enter"
            icon={<FiTag size={12} />}
          />

          {/* Locations */}
          <TagInput
            label="Locations"
            tags={form.locations}
            onChange={(locations) => setForm({ ...form, locations })}
            maxTags={5}
            placeholder="Type a location and press Enter"
            icon={<FiMapPin size={12} />}
          />

          {/* Deal Breakers */}
          <TagInput
            label="Deal Breakers"
            tags={form.dealBreakers}
            onChange={(dealBreakers) => setForm({ ...form, dealBreakers })}
            maxTags={10}
            placeholder="e.g., No relocation, No contract"
            icon={<FiAlertCircle size={12} />}
          />

          {/* Salary range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1.5">
                <FiDollarSign size={12} />
                Min Salary (annual)
              </label>
              <input
                type="number"
                value={form.minSalary}
                onChange={(e) =>
                  setForm({ ...form, minSalary: e.target.value })
                }
                placeholder="e.g., 80000"
                min={0}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1.5">
                <FiDollarSign size={12} />
                Max Salary (annual)
              </label>
              <input
                type="number"
                value={form.maxSalary}
                onChange={(e) =>
                  setForm({ ...form, maxSalary: e.target.value })
                }
                placeholder="e.g., 150000"
                min={0}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Remote toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setForm({ ...form, remote: !form.remote })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.remote ? "bg-primary" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.remote ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="flex items-center gap-1.5 text-sm text-foreground">
                <FiWifi size={14} />
                Remote positions only
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <FiLoader size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheck size={14} />
                  {isEditing ? "Update Profile" : "Create Profile"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile Card skeleton
// ---------------------------------------------------------------------------

function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="skeleton h-6 w-16 rounded-md" />
        <div className="skeleton h-6 w-20 rounded-md" />
        <div className="skeleton h-6 w-14 rounded-md" />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="skeleton h-6 w-24 rounded-md" />
        <div className="skeleton h-6 w-20 rounded-md" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-border">
        <div className="skeleton h-8 flex-1 rounded-lg" />
        <div className="skeleton h-8 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile Card component
// ---------------------------------------------------------------------------

function ProfileCard({
  profile,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  profile: SearchProfile;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    onDelete();
  };

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md ${
        profile.isActive ? "border-border hover:border-primary/20" : "border-border opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate">
            {profile.name}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Updated {new Date(profile.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onToggleActive}
          className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
            profile.isActive ? "bg-success" : "bg-gray-200"
          }`}
          title={profile.isActive ? "Active" : "Inactive"}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              profile.isActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Keywords */}
      {profile.keywords.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {profile.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Locations */}
      {profile.locations.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {profile.locations.map((loc, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface text-muted text-[11px] font-medium"
              >
                <FiMapPin size={10} />
                {loc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Meta badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {profile.remote && (
          <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[11px] font-medium flex items-center gap-1">
            <FiWifi size={10} />
            Remote
          </span>
        )}
        {(profile.minSalary || profile.maxSalary) && (
          <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[11px] font-medium flex items-center gap-1">
            <FiDollarSign size={10} />
            {profile.minSalary
              ? `$${(profile.minSalary / 1000).toFixed(0)}k`
              : ""}
            {profile.minSalary && profile.maxSalary ? " - " : ""}
            {profile.maxSalary
              ? `$${(profile.maxSalary / 1000).toFixed(0)}k`
              : ""}
          </span>
        )}
        {profile.dealBreakers.length > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[11px] font-medium flex items-center gap-1">
            <FiAlertCircle size={10} />
            {profile.dealBreakers.length} deal breaker
            {profile.dealBreakers.length > 1 ? "s" : ""}
          </span>
        )}
        {profile.resumeText && (
          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[11px] font-medium flex items-center gap-1">
            <FiFileText size={10} />
            Resume attached
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-surface text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <FiEdit size={13} />
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            confirmDelete
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-surface text-muted hover:bg-red-50 hover:text-red-600"
          }`}
        >
          <FiTrash size={13} />
          {confirmDelete ? "Confirm?" : "Delete"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Profiles Page
// ---------------------------------------------------------------------------

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<SearchProfile | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profiles");
      if (!res.ok) throw new Error("Failed to fetch profiles");
      const data: SearchProfile[] = await res.json();
      setProfiles(data);
    } catch {
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Profile deleted");
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete profile");
    }
  };

  const handleToggleActive = async (profile: SearchProfile) => {
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !profile.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id ? { ...p, isActive: !p.isActive } : p
        )
      );
      toast.success(
        profile.isActive ? "Profile deactivated" : "Profile activated"
      );
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const openCreateModal = () => {
    setEditingProfile(null);
    setShowModal(true);
  };

  const openEditModal = (profile: SearchProfile) => {
    setEditingProfile(profile);
    setShowModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search Profiles</h1>
          <p className="text-sm text-muted mt-1">
            Create and manage your job search profiles for AI-powered matching
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <FiPlus size={16} />
          <span className="hidden sm:inline">New Profile</span>
        </button>
      </div>

      {/* Profile count */}
      {!loading && profiles.length > 0 && (
        <div className="mb-6 text-sm text-muted">
          {profiles.length} profile{profiles.length !== 1 ? "s" : ""}{" "}
          <span className="text-border">|</span>{" "}
          {profiles.filter((p) => p.isActive).length} active
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6">
            <FiFileText size={36} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No search profiles yet
          </h3>
          <p className="text-muted text-sm max-w-sm mb-6">
            Create your first search profile with your skills, preferences, and
            resume to start receiving AI-matched job recommendations.
          </p>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <FiPlus size={16} />
            Create Your First Profile
          </button>
        </div>
      ) : (
        /* Profile cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onEdit={() => openEditModal(profile)}
              onDelete={() => handleDelete(profile.id)}
              onToggleActive={() => handleToggleActive(profile)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProfileFormModal
          profile={editingProfile}
          onClose={() => setShowModal(false)}
          onSave={fetchProfiles}
        />
      )}
    </div>
  );
}
