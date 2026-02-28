import { z } from 'zod';

// ---------------------------------------------------------------------------
// Job Source enum
// ---------------------------------------------------------------------------
export const JobSourceEnum = z.enum([
  'jsearch',
  'adzuna',
  'themuse',
  'remoteok',
]);
export type JobSource = z.infer<typeof JobSourceEnum>;

// ---------------------------------------------------------------------------
// Normalized job – the common shape every source adapter must produce
// ---------------------------------------------------------------------------
export const NormalizedJobSchema = z.object({
  externalId: z.string().min(1),
  source: JobSourceEnum,
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string(),
  description: z.string(),
  salary: z.string().nullable(),
  url: z.string().url(),
  postedAt: z.string().nullable(), // ISO-8601 or null
  remote: z.boolean(),
});

export type NormalizedJob = z.infer<typeof NormalizedJobSchema>;

// ---------------------------------------------------------------------------
// Scored job – a normalized job enriched with an AI match score
// ---------------------------------------------------------------------------
export const ScoredJobSchema = NormalizedJobSchema.extend({
  score: z.number().int().min(0).max(100),
  reasoning: z.string(),
});

export type ScoredJob = z.infer<typeof ScoredJobSchema>;

// ---------------------------------------------------------------------------
// User search profile – sent alongside jobs when requesting AI scoring
// ---------------------------------------------------------------------------
export const SearchProfileSchema = z.object({
  resumeText: z.string(),
  keywords: z.array(z.string()),
  preferredLocations: z.array(z.string()),
  remotePreference: z.enum(['remote_only', 'hybrid', 'onsite', 'no_preference']),
  minSalary: z.number().nullable().optional(),
  dealBreakers: z.array(z.string()),
});

export type SearchProfile = z.infer<typeof SearchProfileSchema>;

// ---------------------------------------------------------------------------
// Individual score result returned from the AI scoring service
// ---------------------------------------------------------------------------
export const JobScoreResultSchema = z.object({
  externalId: z.string(),
  score: z.number().int().min(0).max(100),
  reasoning: z.string(),
});

export type JobScoreResult = z.infer<typeof JobScoreResultSchema>;
