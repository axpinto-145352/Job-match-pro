import { z } from 'zod';
import { NormalizedJob, NormalizedJobSchema } from '../job-types';

// ---------------------------------------------------------------------------
// RemoteOK API response schema
// ---------------------------------------------------------------------------
const RemoteOKJobSchema = z.object({
  id: z.union([z.string(), z.number()]),
  slug: z.string().optional(),
  company: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  tags: z.array(z.string()).default([]),
  url: z.string().nullable().optional(),
  apply_url: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  company_logo: z.string().nullable().optional(),
});

type RemoteOKJob = z.infer<typeof RemoteOKJobSchema>;

// The RemoteOK API returns an array where the first element is a metadata
// object (with a "legal" key) and the rest are job entries.  We parse the
// full array loosely and filter out non-job elements.
const RemoteOKResponseSchema = z.array(z.unknown());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildSalary(job: RemoteOKJob): string | null {
  if (job.salary_min == null && job.salary_max == null) return null;
  const min = job.salary_min != null ? `USD ${job.salary_min.toLocaleString()}` : '';
  const max = job.salary_max != null ? `USD ${job.salary_max.toLocaleString()}` : '';
  if (min && max) return `${min} - ${max} / year`;
  return `${min || max} / year`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function matchesQuery(job: RemoteOKJob, query: string): boolean {
  if (!query) return true;
  const lowerQuery = query.toLowerCase();
  const searchableText = [
    job.position ?? '',
    job.company ?? '',
    job.description ?? '',
    ...job.tags,
  ]
    .join(' ')
    .toLowerCase();
  // Check if any of the query terms appear in the searchable text
  const terms = lowerQuery.split(/\s+/).filter(Boolean);
  return terms.some((term) => searchableText.includes(term));
}

function buildApplyUrl(job: RemoteOKJob): string {
  if (job.apply_url) return job.apply_url;
  if (job.url) return job.url;
  if (job.slug) return `https://remoteok.com/remote-jobs/${job.slug}`;
  return `https://remoteok.com/remote-jobs/${job.id}`;
}

function normalizeJob(raw: RemoteOKJob): NormalizedJob {
  const normalized = {
    externalId: String(raw.id),
    source: 'remoteok' as const,
    title: raw.position ?? 'Unknown Position',
    company: raw.company ?? 'Unknown',
    location: raw.location || 'Remote',
    description: raw.description ? stripHtml(raw.description) : '',
    salary: buildSalary(raw),
    url: buildApplyUrl(raw),
    postedAt: raw.date ?? null,
    remote: true, // All RemoteOK jobs are remote by definition
  };

  return NormalizedJobSchema.parse(normalized);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch jobs from the RemoteOK API (free, no API key required) and return
 * them in the normalized NormalizedJob format.
 *
 * Since RemoteOK does not support server-side query filtering, all jobs are
 * fetched and then filtered client-side against the provided query string.
 */
export async function fetchRemoteOKJobs(
  query: string,
): Promise<NormalizedJob[]> {
  const url = 'https://remoteok.com/api';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // RemoteOK requires a User-Agent header to avoid 403 errors
        'User-Agent': 'JobMatchPro/1.0',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.error(`[RemoteOK] HTTP ${response.status}: ${response.statusText}`);
      return [];
    }

    const json: unknown = await response.json();
    const parsed = RemoteOKResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[RemoteOK] Response validation failed:', parsed.error.flatten());
      return [];
    }

    const jobs: NormalizedJob[] = [];
    for (const item of parsed.data) {
      // Skip the first element which is typically a metadata/legal object
      const jobParsed = RemoteOKJobSchema.safeParse(item);
      if (!jobParsed.success) continue;

      const raw = jobParsed.data;

      // RemoteOK does not support server-side search; filter client-side
      if (!raw.position) continue;
      if (!matchesQuery(raw, query)) continue;

      try {
        jobs.push(normalizeJob(raw));
      } catch (err) {
        console.warn('[RemoteOK] Skipping invalid job entry:', (err as Error).message);
      }
    }

    console.info(`[RemoteOK] Fetched ${jobs.length} jobs for query "${query}"`);
    return jobs;
  } catch (err) {
    console.error('[RemoteOK] Fetch failed:', (err as Error).message);
    return [];
  }
}
