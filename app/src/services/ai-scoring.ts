import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { scrubPII } from '../lib/pii-scrubber';
import {
  NormalizedJob,
  SearchProfile,
  JobScoreResult,
  JobScoreResultSchema,
  ScoredJob,
} from './job-types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of jobs to include in each API call to Claude. */
const BATCH_SIZE = 5;

/** Model to use for scoring -- Haiku is fast and cost-effective. */
const SCORING_MODEL = 'claude-haiku-4-20250514';

/** Maximum tokens for each scoring response. */
const MAX_TOKENS = 2048;

// ---------------------------------------------------------------------------
// Zod schema for the raw AI response (array of score results)
// ---------------------------------------------------------------------------
const AIScoreResponseSchema = z.array(
  z.object({
    externalId: z.string(),
    score: z.number(),
    reasoning: z.string(),
  }),
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clamp a numeric value into the [0, 100] integer range.
 */
function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Prepare a single job for inclusion in the scoring prompt.
 * Runs the PII scrubber over the description so we never send personal
 * data to the AI.  Truncates very long descriptions to keep token usage
 * reasonable.
 */
function prepareJobForPrompt(job: NormalizedJob): Record<string, unknown> {
  const MAX_DESC_LENGTH = 2000;
  const scrubbedDescription = scrubPII(job.description);
  const truncatedDescription =
    scrubbedDescription.length > MAX_DESC_LENGTH
      ? scrubbedDescription.slice(0, MAX_DESC_LENGTH) + '...[truncated]'
      : scrubbedDescription;

  return {
    externalId: job.externalId,
    title: job.title,
    company: job.company,
    location: job.location,
    description: truncatedDescription,
    salary: job.salary,
    remote: job.remote,
    postedAt: job.postedAt,
  };
}

/**
 * Build the system prompt for the scoring request.
 */
function buildSystemPrompt(): string {
  return `You are JobMatch Pro's AI job scoring engine. Your task is to evaluate how well each job listing matches a candidate's profile, preferences, and priorities.

SCORING GUIDELINES:
- Score each job from 0 to 100 where:
  - 0-20: Very poor match, major misalignments or deal-breakers present
  - 21-40: Weak match, several significant gaps
  - 41-60: Moderate match, some alignment but notable gaps
  - 61-80: Good match, strong alignment with minor gaps
  - 81-100: Excellent match, strong alignment across most or all criteria
- Consider these factors (in rough order of importance):
  1. Deal-breakers: If a job triggers ANY deal-breaker, cap the score at 25 maximum
  2. Keyword and skill alignment with the candidate's resume
  3. Location / remote preference match
  4. Salary expectations (if available)
  5. Overall role relevance to the candidate's experience and career goals

BIAS MITIGATION INSTRUCTIONS:
- Do NOT let company prestige, brand recognition, or company size influence the score.
  A job at a small unknown startup should score the same as an identical role at a
  Fortune 500 company if all other factors are equal.
- Do NOT penalize or reward jobs based on the industry unless the candidate has
  explicitly stated industry preferences or deal-breakers.
- Do NOT infer demographic information about the candidate or use any perceived
  demographic characteristics in scoring.
- Evaluate each job strictly on the objective criteria provided in the candidate
  profile: skills, keywords, location preference, salary range, and deal-breakers.
- If job descriptions contain gendered, age-biased, or otherwise exclusionary language,
  note this in the reasoning but do NOT let it inflate or deflate the score.

RESPONSE FORMAT:
Respond ONLY with a JSON array. No markdown fences, no explanation outside the JSON.
Each element must have exactly these keys:
- "externalId": the job's externalId (string)
- "score": integer 0-100
- "reasoning": 1-3 sentence explanation of the score`;
}

/**
 * Build the user prompt for a batch of jobs.
 */
function buildUserPrompt(
  jobs: Record<string, unknown>[],
  profile: SearchProfile,
): string {
  return `CANDIDATE PROFILE:
Resume summary: ${scrubPII(profile.resumeText)}
Keywords / skills: ${profile.keywords.join(', ')}
Preferred locations: ${profile.preferredLocations.join(', ') || 'No preference'}
Remote preference: ${profile.remotePreference}
Minimum salary: ${profile.minSalary != null ? `$${profile.minSalary.toLocaleString()}` : 'Not specified'}
Deal-breakers: ${profile.dealBreakers.length > 0 ? profile.dealBreakers.join(', ') : 'None specified'}

JOBS TO SCORE (${jobs.length}):
${JSON.stringify(jobs, null, 2)}

Score each job against the candidate profile above. Return a JSON array with one entry per job.`;
}

/**
 * Score a single batch of jobs (up to BATCH_SIZE) via the Claude API.
 */
async function scoreBatch(
  client: Anthropic,
  jobs: NormalizedJob[],
  profile: SearchProfile,
): Promise<JobScoreResult[]> {
  const preparedJobs = jobs.map(prepareJobForPrompt);
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(preparedJobs, profile);

  const response = await client.messages.create({
    model: SCORING_MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Claude scoring response');
  }

  // Strip potential markdown code fences
  const cleaned = textBlock.text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse scoring response as JSON: ${cleaned.slice(0, 300)}`);
  }

  const validated = AIScoreResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `Scoring response validation failed: ${JSON.stringify(validated.error.flatten())}`,
    );
  }

  // Clamp scores and validate through the strict schema
  return validated.data.map((item) => {
    const clamped = {
      externalId: item.externalId,
      score: clampScore(item.score),
      reasoning: item.reasoning,
    };
    return JobScoreResultSchema.parse(clamped);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Score an array of normalized jobs against a user's search profile using
 * Claude Haiku.
 *
 * Jobs are batched (BATCH_SIZE per API call) to balance throughput and token
 * limits.  Each job description is PII-scrubbed before being sent to the AI.
 *
 * Returns an array of ScoredJob objects (the original NormalizedJob fields
 * plus `score` and `reasoning`).
 */
export async function scoreJobs(
  jobs: NormalizedJob[],
  profile: SearchProfile,
): Promise<ScoredJob[]> {
  if (jobs.length === 0) {
    console.info('[AI Scoring] No jobs to score.');
    return [];
  }

  const client = new Anthropic();

  // Split jobs into batches
  const batches: NormalizedJob[][] = [];
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    batches.push(jobs.slice(i, i + BATCH_SIZE));
  }

  console.info(
    `[AI Scoring] Scoring ${jobs.length} jobs in ${batches.length} batch(es) of up to ${BATCH_SIZE}`,
  );

  // Process batches sequentially to avoid rate-limit issues
  const allScores: Map<string, JobScoreResult> = new Map();

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      console.info(`[AI Scoring] Processing batch ${i + 1}/${batches.length} (${batch.length} jobs)`);
      const batchResults = await scoreBatch(client, batch, profile);
      for (const result of batchResults) {
        allScores.set(result.externalId, result);
      }
    } catch (err) {
      console.error(
        `[AI Scoring] Batch ${i + 1}/${batches.length} failed:`,
        (err as Error).message,
      );
      // Assign a default score of 50 with an error note for jobs in the failed batch
      for (const job of batch) {
        allScores.set(job.externalId, {
          externalId: job.externalId,
          score: 50,
          reasoning: 'Scoring temporarily unavailable. Default score assigned.',
        });
      }
    }
  }

  // Merge scores back onto the original job objects
  const scoredJobs: ScoredJob[] = jobs.map((job) => {
    const scoreResult = allScores.get(job.externalId);
    return {
      ...job,
      score: scoreResult?.score ?? 50,
      reasoning: scoreResult?.reasoning ?? 'No score available.',
    };
  });

  console.info(`[AI Scoring] Completed scoring for ${scoredJobs.length} jobs.`);
  return scoredJobs;
}
