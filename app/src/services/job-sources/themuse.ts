import { z } from 'zod';
import { NormalizedJob, NormalizedJobSchema } from '../job-types';

// ---------------------------------------------------------------------------
// The Muse API response schemas
// ---------------------------------------------------------------------------
const MuseLocationSchema = z.object({
  name: z.string().nullable().optional(),
});

const MuseCompanySchema = z.object({
  name: z.string().nullable().optional(),
});

const MuseJobSchema = z.object({
  id: z.number(),
  name: z.string(), // job title
  company: MuseCompanySchema.nullable().optional(),
  locations: z.array(MuseLocationSchema).default([]),
  contents: z.string().nullable().optional(),
  refs: z
    .object({
      landing_page: z.string().url().nullable().optional(),
    })
    .nullable()
    .optional(),
  publication_date: z.string().nullable().optional(),
  categories: z
    .array(z.object({ name: z.string().nullable().optional() }))
    .default([]),
  levels: z
    .array(z.object({ name: z.string().nullable().optional() }))
    .default([]),
});

const MuseResponseSchema = z.object({
  results: z.array(MuseJobSchema).default([]),
  page: z.number().optional(),
  page_count: z.number().optional(),
});

type MuseJob = z.infer<typeof MuseJobSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildLocation(job: MuseJob): string {
  const names = job.locations
    .map((l) => l.name)
    .filter((n): n is string => n != null && n.length > 0);
  return names.length > 0 ? names.join('; ') : 'Unknown';
}

function detectRemote(job: MuseJob): boolean {
  const locationText = job.locations.map((l) => l.name ?? '').join(' ').toLowerCase();
  return (
    locationText.includes('remote') ||
    locationText.includes('flexible') ||
    (job.contents ?? '').toLowerCase().includes('remote')
  );
}

/**
 * Strip HTML tags from The Muse `contents` field to produce a plain-text
 * description.
 */
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

function normalizeJob(raw: MuseJob): NormalizedJob {
  const normalized = {
    externalId: String(raw.id),
    source: 'themuse' as const,
    title: raw.name,
    company: raw.company?.name ?? 'Unknown',
    location: buildLocation(raw),
    description: raw.contents ? stripHtml(raw.contents) : '',
    salary: null, // The Muse does not provide salary data in its public API
    url: raw.refs?.landing_page ?? `https://www.themuse.com/jobs?ref=jobmatchpro`,
    postedAt: raw.publication_date ?? null,
    remote: detectRemote(raw),
  };

  return NormalizedJobSchema.parse(normalized);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch jobs from The Muse API (free, no API key required) and return them
 * in the normalized NormalizedJob format.
 */
export async function fetchMuseJobs(
  query: string,
  location: string,
): Promise<NormalizedJob[]> {
  const params = new URLSearchParams({
    page: '0',
    descending: 'true',
  });

  // The Muse uses a "category" param rather than free-text search; we pass
  // the query string as a category hint and also set `location` if provided.
  if (query) {
    params.set('category', query);
  }
  if (location) {
    params.set('location', location);
  }

  const url = `https://www.themuse.com/api/public/jobs?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.error(`[TheMuse] HTTP ${response.status}: ${response.statusText}`);
      return [];
    }

    const json: unknown = await response.json();
    const parsed = MuseResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[TheMuse] Response validation failed:', parsed.error.flatten());
      return [];
    }

    const jobs: NormalizedJob[] = [];
    for (const raw of parsed.data.results) {
      try {
        jobs.push(normalizeJob(raw));
      } catch (err) {
        console.warn('[TheMuse] Skipping invalid job entry:', (err as Error).message);
      }
    }

    console.info(`[TheMuse] Fetched ${jobs.length} jobs for query "${query}"`);
    return jobs;
  } catch (err) {
    console.error('[TheMuse] Fetch failed:', (err as Error).message);
    return [];
  }
}
