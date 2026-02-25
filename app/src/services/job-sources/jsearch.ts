import { z } from 'zod';
import { NormalizedJob, NormalizedJobSchema } from '../job-types';

// ---------------------------------------------------------------------------
// JSearch (RapidAPI) response schemas
// ---------------------------------------------------------------------------
const JSearchJobSchema = z.object({
  job_id: z.string(),
  job_title: z.string(),
  employer_name: z.string().nullable().optional(),
  job_city: z.string().nullable().optional(),
  job_state: z.string().nullable().optional(),
  job_country: z.string().nullable().optional(),
  job_description: z.string().nullable().optional(),
  job_min_salary: z.number().nullable().optional(),
  job_max_salary: z.number().nullable().optional(),
  job_salary_currency: z.string().nullable().optional(),
  job_salary_period: z.string().nullable().optional(),
  job_apply_link: z.string().url().nullable().optional(),
  job_posted_at_datetime_utc: z.string().nullable().optional(),
  job_is_remote: z.boolean().nullable().optional(),
});

const JSearchResponseSchema = z.object({
  status: z.string(),
  data: z.array(JSearchJobSchema).default([]),
});

type JSearchJob = z.infer<typeof JSearchJobSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildLocation(job: JSearchJob): string {
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  return parts.join(', ') || 'Unknown';
}

function buildSalary(job: JSearchJob): string | null {
  if (job.job_min_salary == null && job.job_max_salary == null) return null;
  const currency = job.job_salary_currency ?? 'USD';
  const period = job.job_salary_period ?? 'YEAR';
  const min = job.job_min_salary != null ? `${currency} ${job.job_min_salary.toLocaleString()}` : '';
  const max = job.job_max_salary != null ? `${currency} ${job.job_max_salary.toLocaleString()}` : '';
  if (min && max) return `${min} - ${max} / ${period}`;
  return `${min || max} / ${period}`;
}

function normalizeJob(raw: JSearchJob): NormalizedJob {
  const normalized = {
    externalId: raw.job_id,
    source: 'jsearch' as const,
    title: raw.job_title,
    company: raw.employer_name ?? 'Unknown',
    location: buildLocation(raw),
    description: raw.job_description ?? '',
    salary: buildSalary(raw),
    url: raw.job_apply_link ?? `https://www.google.com/search?q=${encodeURIComponent(raw.job_title + ' ' + (raw.employer_name ?? ''))}`,
    postedAt: raw.job_posted_at_datetime_utc ?? null,
    remote: raw.job_is_remote ?? false,
  };

  return NormalizedJobSchema.parse(normalized);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch jobs from the JSearch API (RapidAPI) and return them in the
 * normalized NormalizedJob format.
 */
export async function fetchJSearchJobs(
  query: string,
  location: string,
  remote: boolean,
): Promise<NormalizedJob[]> {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    console.error('[JSearch] JSEARCH_API_KEY is not set. Skipping JSearch source.');
    return [];
  }

  const params = new URLSearchParams({
    query: remote ? `${query} remote` : `${query} in ${location}`,
    page: '1',
    num_pages: '1',
    date_posted: 'month',
  });

  if (remote) {
    params.set('remote_jobs_only', 'true');
  }

  const url = `https://jsearch.p.rapidapi.com/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.error(`[JSearch] HTTP ${response.status}: ${response.statusText}`);
      return [];
    }

    const json: unknown = await response.json();
    const parsed = JSearchResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[JSearch] Response validation failed:', parsed.error.flatten());
      return [];
    }

    const jobs: NormalizedJob[] = [];
    for (const raw of parsed.data.data) {
      try {
        jobs.push(normalizeJob(raw));
      } catch (err) {
        console.warn('[JSearch] Skipping invalid job entry:', (err as Error).message);
      }
    }

    console.info(`[JSearch] Fetched ${jobs.length} jobs for query "${query}"`);
    return jobs;
  } catch (err) {
    console.error('[JSearch] Fetch failed:', (err as Error).message);
    return [];
  }
}
