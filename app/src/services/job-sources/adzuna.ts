import { z } from 'zod';
import { NormalizedJob, NormalizedJobSchema } from '../job-types';

// ---------------------------------------------------------------------------
// Adzuna API response schemas
// ---------------------------------------------------------------------------
const AdzunaLocationSchema = z.object({
  display_name: z.string().nullable().optional(),
});

const AdzunaCompanySchema = z.object({
  display_name: z.string().nullable().optional(),
});

const AdzunaJobSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  company: AdzunaCompanySchema.nullable().optional(),
  location: AdzunaLocationSchema.nullable().optional(),
  description: z.string().nullable().optional(),
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  redirect_url: z.string().url().nullable().optional(),
  created: z.string().nullable().optional(),
  contract_type: z.string().nullable().optional(),
});

const AdzunaResponseSchema = z.object({
  results: z.array(AdzunaJobSchema).default([]),
});

type AdzunaJob = z.infer<typeof AdzunaJobSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildSalary(job: AdzunaJob): string | null {
  if (job.salary_min == null && job.salary_max == null) return null;
  const min = job.salary_min != null ? `GBP ${job.salary_min.toLocaleString()}` : '';
  const max = job.salary_max != null ? `GBP ${job.salary_max.toLocaleString()}` : '';
  if (min && max) return `${min} - ${max} / year`;
  return `${min || max} / year`;
}

function detectRemote(job: AdzunaJob): boolean {
  const text = [
    job.title,
    job.description ?? '',
    job.location?.display_name ?? '',
  ].join(' ').toLowerCase();
  return text.includes('remote') || text.includes('work from home');
}

function normalizeJob(raw: AdzunaJob): NormalizedJob {
  const normalized = {
    externalId: String(raw.id),
    source: 'adzuna' as const,
    title: raw.title,
    company: raw.company?.display_name ?? 'Unknown',
    location: raw.location?.display_name ?? 'Unknown',
    description: raw.description ?? '',
    salary: buildSalary(raw),
    url: raw.redirect_url ?? `https://www.adzuna.co.uk/jobs/details/${raw.id}`,
    postedAt: raw.created ?? null,
    remote: detectRemote(raw),
  };

  return NormalizedJobSchema.parse(normalized);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch jobs from the Adzuna API and return them in the normalized
 * NormalizedJob format.
 *
 * Adzuna requires both ADZUNA_APP_ID and ADZUNA_APP_KEY environment
 * variables to be set.
 */
export async function fetchAdzunaJobs(
  query: string,
  location: string,
): Promise<NormalizedJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.error('[Adzuna] ADZUNA_APP_ID or ADZUNA_APP_KEY is not set. Skipping Adzuna source.');
    return [];
  }

  // Adzuna uses a country code in the URL path; default to "us".
  const country = 'us';
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '50',
    what: query,
    where: location,
    content_type: 'application/json',
    max_days_old: '30',
  });

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.error(`[Adzuna] HTTP ${response.status}: ${response.statusText}`);
      return [];
    }

    const json: unknown = await response.json();
    const parsed = AdzunaResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[Adzuna] Response validation failed:', parsed.error.flatten());
      return [];
    }

    const jobs: NormalizedJob[] = [];
    for (const raw of parsed.data.results) {
      try {
        jobs.push(normalizeJob(raw));
      } catch (err) {
        console.warn('[Adzuna] Skipping invalid job entry:', (err as Error).message);
      }
    }

    console.info(`[Adzuna] Fetched ${jobs.length} jobs for query "${query}"`);
    return jobs;
  } catch (err) {
    console.error('[Adzuna] Fetch failed:', (err as Error).message);
    return [];
  }
}
