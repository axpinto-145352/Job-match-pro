"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiX,
  FiZap,
  FiTarget,
  FiShield,
  FiCpu,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 4;
const MAX_RESUME_LENGTH = 5000;

/* ------------------------------------------------------------------ */
/*  TAG INPUT COMPONENT                                                */
/* ------------------------------------------------------------------ */

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (index: number) => void;
  placeholder: string;
  id: string;
}

function TagInput({ tags, onAddTag, onRemoveTag, placeholder, id }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!tags.includes(trimmed)) {
        onAddTag(trimmed);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onRemoveTag(tags.length - 1);
    }
  };

  return (
    <div
      className="flex flex-wrap gap-2 p-3 bg-white border border-border rounded-xl cursor-text min-h-[48px] focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-sm font-medium px-3 py-1 rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTag(idx);
            }}
            className="ml-0.5 hover:text-danger transition-colors"
            aria-label={`Remove ${tag}`}
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder-muted"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PROGRESS DOTS                                                      */
/* ------------------------------------------------------------------ */

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`transition-all duration-300 rounded-full ${
            i === current
              ? "w-8 h-2.5 bg-gradient-to-r from-primary to-secondary"
              : i < current
              ? "w-2.5 h-2.5 bg-primary/40"
              : "w-2.5 h-2.5 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STEP COMPONENTS                                                    */
/* ------------------------------------------------------------------ */

function StepWelcome() {
  return (
    <div className="text-center">
      {/* Animated illustration area */}
      <div className="relative w-48 h-48 mx-auto mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 animate-pulse" />
        {/* Inner ring */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/5 to-accent/5" />
        {/* Center icon cluster */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/25">
              <FiTarget className="w-10 h-10 text-white" />
            </div>
            {/* Orbiting icons */}
            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: "0s", animationDuration: "2s" }}>
              <FiZap className="w-5 h-5 text-accent" />
            </div>
            <div className="absolute -bottom-3 -left-3 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "2s" }}>
              <FiCpu className="w-5 h-5 text-secondary" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: "1s", animationDuration: "2s" }}>
              <FiShield className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
        Welcome to <span className="gradient-text">JobMatch Pro</span>!
      </h2>
      <p className="text-muted text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-6">
        We aggregate jobs from 7+ sources and use AI to score each one against
        your resume and preferences, so you only see roles worth your time.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FiTarget className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Scoring</p>
            <p className="text-xs text-muted mt-0.5">0-100 match scores</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FiZap className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">7+ Sources</p>
            <p className="text-xs text-muted mt-0.5">All major job boards</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FiShield className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Private</p>
            <p className="text-xs text-muted mt-0.5">Encrypted & secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepResume({
  resume,
  onResumeChange,
}: {
  resume: string;
  onResumeChange: (val: string) => void;
}) {
  const charCount = resume.length;
  const isNearLimit = charCount > MAX_RESUME_LENGTH * 0.9;

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
          <FiCpu className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
          Your Resume
        </h2>
        <p className="text-muted text-sm sm:text-base max-w-md mx-auto">
          Paste your resume text below. Our AI uses it to score how well each
          job matches your background.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="relative">
          <textarea
            value={resume}
            onChange={(e) => {
              if (e.target.value.length <= MAX_RESUME_LENGTH) {
                onResumeChange(e.target.value);
              }
            }}
            placeholder="Paste your resume text here...&#10;&#10;Include your work experience, skills, education, and any relevant certifications."
            className="w-full h-64 p-4 bg-white border border-border rounded-xl text-sm text-foreground placeholder-muted/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all leading-relaxed"
          />
          <div
            className={`absolute bottom-3 right-3 text-xs font-medium ${
              isNearLimit ? "text-warning" : "text-muted/40"
            }`}
          >
            {charCount.toLocaleString()}/{MAX_RESUME_LENGTH.toLocaleString()}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Privacy note:</strong> Your resume text is used solely for
            AI scoring. It is sent to Anthropic&rsquo;s Claude API for
            processing and is not stored by the AI provider after the request
            completes. Your text is encrypted at rest in our database.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepPreferences({
  keywords,
  onAddKeyword,
  onRemoveKeyword,
  locations,
  onAddLocation,
  onRemoveLocation,
  remoteOnly,
  onRemoteToggle,
  salaryMin,
  onSalaryMinChange,
  salaryMax,
  onSalaryMaxChange,
  dealBreakers,
  onAddDealBreaker,
  onRemoveDealBreaker,
}: {
  keywords: string[];
  onAddKeyword: (k: string) => void;
  onRemoveKeyword: (i: number) => void;
  locations: string[];
  onAddLocation: (l: string) => void;
  onRemoveLocation: (i: number) => void;
  remoteOnly: boolean;
  onRemoteToggle: () => void;
  salaryMin: string;
  onSalaryMinChange: (v: string) => void;
  salaryMax: string;
  onSalaryMaxChange: (v: string) => void;
  dealBreakers: string[];
  onAddDealBreaker: (d: string) => void;
  onRemoveDealBreaker: (i: number) => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
          <FiTarget className="w-7 h-7 text-secondary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
          Job Preferences
        </h2>
        <p className="text-muted text-sm sm:text-base max-w-md mx-auto">
          Tell us what you are looking for. Press Enter to add each item.
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Keywords */}
        <div>
          <label
            htmlFor="keywords"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Keywords
          </label>
          <TagInput
            id="keywords"
            tags={keywords}
            onAddTag={onAddKeyword}
            onRemoveTag={onRemoveKeyword}
            placeholder='e.g. "React", "Senior Engineer", "Machine Learning"'
          />
          <p className="text-xs text-muted mt-1.5">
            Job titles, skills, or technologies you want to match
          </p>
        </div>

        {/* Locations */}
        <div>
          <label
            htmlFor="locations"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Locations
          </label>
          <TagInput
            id="locations"
            tags={locations}
            onAddTag={onAddLocation}
            onRemoveTag={onRemoveLocation}
            placeholder='e.g. "San Francisco", "New York", "Austin"'
          />
          <p className="text-xs text-muted mt-1.5">
            Cities or regions where you want to work
          </p>
        </div>

        {/* Remote toggle */}
        <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Remote work only
            </p>
            <p className="text-xs text-muted mt-0.5">
              Only show remote or work-from-home positions
            </p>
          </div>
          <button
            type="button"
            onClick={onRemoteToggle}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              remoteOnly
                ? "bg-gradient-to-r from-primary to-secondary"
                : "bg-border"
            }`}
            role="switch"
            aria-checked={remoteOnly}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                remoteOnly ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Salary range */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Salary Range (USD/year)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={salaryMin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  onSalaryMinChange(val);
                }}
                placeholder="Min"
                className="w-full pl-7 pr-3 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={salaryMax}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  onSalaryMaxChange(val);
                }}
                placeholder="Max"
                className="w-full pl-7 pr-3 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Deal-breakers */}
        <div>
          <label
            htmlFor="dealbreakers"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Deal-breakers
          </label>
          <TagInput
            id="dealbreakers"
            tags={dealBreakers}
            onAddTag={onAddDealBreaker}
            onRemoveTag={onRemoveDealBreaker}
            placeholder='e.g. "No relocation", "No travel >20%", "No contract"'
          />
          <p className="text-xs text-muted mt-1.5">
            Things that would make you skip a job listing
          </p>
        </div>
      </div>
    </div>
  );
}

function StepComplete({
  keywords,
  locations,
  remoteOnly,
  salaryMin,
  salaryMax,
  dealBreakers,
  hasResume,
}: {
  keywords: string[];
  locations: string[];
  remoteOnly: boolean;
  salaryMin: string;
  salaryMax: string;
  dealBreakers: string[];
  hasResume: boolean;
}) {
  const formatSalary = (val: string) => {
    if (!val) return "Not set";
    return `$${parseInt(val).toLocaleString()}`;
  };

  return (
    <div className="text-center">
      {/* Success animation */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-success/20 to-accent/20 animate-ping opacity-20" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-success/10 to-accent/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success to-accent flex items-center justify-center shadow-lg shadow-success/25">
            <FiCheck className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
        You&rsquo;re All Set!
      </h2>
      <p className="text-muted text-sm sm:text-base max-w-md mx-auto mb-8">
        Your profile is ready. Here&rsquo;s a summary of what we&rsquo;ll use to
        match jobs for you.
      </p>

      {/* Profile summary */}
      <div className="max-w-md mx-auto text-left">
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          {/* Resume status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Resume</span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                hasResume
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {hasResume ? "Uploaded" : "Skipped"}
            </span>
          </div>

          {/* Keywords */}
          <div>
            <span className="text-sm font-medium text-foreground block mb-2">
              Keywords
            </span>
            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((k, i) => (
                  <span
                    key={i}
                    className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full"
                  >
                    {k}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted">None specified</span>
            )}
          </div>

          {/* Locations */}
          <div>
            <span className="text-sm font-medium text-foreground block mb-2">
              Locations
            </span>
            {locations.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {locations.map((l, i) => (
                  <span
                    key={i}
                    className="text-xs bg-secondary/10 text-secondary px-2.5 py-1 rounded-full"
                  >
                    {l}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted">None specified</span>
            )}
          </div>

          {/* Remote */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Remote only
            </span>
            <span className="text-xs text-muted">
              {remoteOnly ? "Yes" : "No"}
            </span>
          </div>

          {/* Salary */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Salary range
            </span>
            <span className="text-xs text-muted">
              {salaryMin || salaryMax
                ? `${formatSalary(salaryMin)} - ${formatSalary(salaryMax)}`
                : "Not set"}
            </span>
          </div>

          {/* Deal-breakers */}
          <div>
            <span className="text-sm font-medium text-foreground block mb-2">
              Deal-breakers
            </span>
            {dealBreakers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {dealBreakers.map((d, i) => (
                  <span
                    key={i}
                    className="text-xs bg-danger/10 text-danger px-2.5 py-1 rounded-full"
                  >
                    {d}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted">None specified</span>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-800 text-center leading-relaxed">
            Your free trial includes <strong>10 AI-scored jobs per day</strong>.
            Upgrade anytime from your dashboard for more.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN ONBOARDING PAGE                                               */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form state
  const [resume, setResume] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [dealBreakers, setDealBreakers] = useState<string[]>([]);

  // Tag handlers
  const addKeyword = useCallback(
    (k: string) => setKeywords((prev) => [...prev, k]),
    []
  );
  const removeKeyword = useCallback(
    (i: number) => setKeywords((prev) => prev.filter((_, idx) => idx !== i)),
    []
  );
  const addLocation = useCallback(
    (l: string) => setLocations((prev) => [...prev, l]),
    []
  );
  const removeLocation = useCallback(
    (i: number) => setLocations((prev) => prev.filter((_, idx) => idx !== i)),
    []
  );
  const addDealBreaker = useCallback(
    (d: string) => setDealBreakers((prev) => [...prev, d]),
    []
  );
  const removeDealBreaker = useCallback(
    (i: number) =>
      setDealBreakers((prev) => prev.filter((_, idx) => idx !== i)),
    []
  );

  // Navigation
  const goNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  // Submit profile
  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const body = {
        name: "My First Profile",
        keywords,
        locations,
        remoteOnly,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        dealBreakers,
        resumeText: resume || null,
      };

      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        // If profile creation fails, still redirect to dashboard
        console.error("Failed to create profile:", await res.text());
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error creating profile:", err);
      // Redirect anyway so user is not stuck
      router.push("/dashboard");
    }
  };

  // Step button labels
  const nextLabel = currentStep === 0 ? "Let's set up your first profile" : "Next";
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-accent/15 to-primary/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(to right, #0f172a 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20">
              JM
            </div>
            <span className="font-semibold text-foreground text-sm">
              Job<span className="gradient-text">Match</span> Pro
            </span>
          </Link>
          <ProgressDots current={currentStep} total={TOTAL_STEPS} />
        </div>
      </div>

      {/* Step content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-primary/5 border border-white/60 p-6 sm:p-10">
          {/* Step label */}
          <div className="flex items-center justify-center mb-6">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Step {currentStep + 1} of {TOTAL_STEPS}
            </span>
          </div>

          {/* Animated step content */}
          <div
            key={currentStep}
            className="animate-[fadeSlideIn_0.3s_ease-out]"
            style={{
              animation: "fadeSlideIn 0.3s ease-out",
            }}
          >
            {currentStep === 0 && <StepWelcome />}
            {currentStep === 1 && (
              <StepResume resume={resume} onResumeChange={setResume} />
            )}
            {currentStep === 2 && (
              <StepPreferences
                keywords={keywords}
                onAddKeyword={addKeyword}
                onRemoveKeyword={removeKeyword}
                locations={locations}
                onAddLocation={addLocation}
                onRemoveLocation={removeLocation}
                remoteOnly={remoteOnly}
                onRemoteToggle={() => setRemoteOnly(!remoteOnly)}
                salaryMin={salaryMin}
                onSalaryMinChange={setSalaryMin}
                salaryMax={salaryMax}
                onSalaryMaxChange={setSalaryMax}
                dealBreakers={dealBreakers}
                onAddDealBreaker={addDealBreaker}
                onRemoveDealBreaker={removeDealBreaker}
              />
            )}
            {currentStep === 3 && (
              <StepComplete
                keywords={keywords}
                locations={locations}
                remoteOnly={remoteOnly}
                salaryMin={salaryMin}
                salaryMax={salaryMax}
                dealBreakers={dealBreakers}
                hasResume={resume.trim().length > 0}
              />
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between">
          {/* Back button */}
          <div>
            {currentStep > 0 ? (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors px-4 py-2.5 rounded-xl hover:bg-white/60"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}
          </div>

          {/* Skip / Next / Finish */}
          <div className="flex items-center gap-3">
            {currentStep === 1 && (
              <button
                onClick={goNext}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors px-4 py-2.5 rounded-xl hover:bg-white/60"
              >
                Skip for now
              </button>
            )}

            {isLastStep ? (
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary px-7 py-3 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Go to Dashboard
                    <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary px-7 py-3 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                {nextLabel}
                <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
