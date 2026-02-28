import { NormalizedJob } from '../job-types';
import { fetchJSearchJobs } from './jsearch';
import { fetchAdzunaJobs } from './adzuna';
import { fetchMuseJobs } from './themuse';
import { fetchRemoteOKJobs } from './remoteok';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FetchAllJobsResult {
  jobs: NormalizedJob[];
  errors: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a deduplication key from a job's title and company name.
 * Normalizes whitespace and casing so that "Software Engineer" at "Acme Corp"
 * and "software engineer" at "ACME CORP" are treated as duplicates.
 */
function dedupeKey(job: NormalizedJob): string {
  const title = job.title.toLowerCase().replace(/\s+/g, ' ').trim();
  const company = job.company.toLowerCase().replace(/\s+/g, ' ').trim();
  return `${title}::${company}`;
}

/**
 * Remove duplicate jobs based on title + company. When duplicates exist the
 * first occurrence (i.e. the one from the source that responded earliest)
 * is kept.
 */
function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>();
  const unique: NormalizedJob[] = [];

  for (const job of jobs) {
    const key = dedupeKey(job);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(job);
    }
  }

  return unique;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch jobs from all configured sources in parallel, deduplicate by
 * title + company, and return the combined list.
 *
 * Uses `Promise.allSettled` so that a failure in one source does not prevent
 * results from the others.  Any source-level errors are collected and returned
 * in the `errors` array for observability.
 */
export async function fetchAllJobs(
  query: string,
  location: string,
  remote: boolean,
): Promise<FetchAllJobsResult> {
  const sourceLabels = ['JSearch', 'Adzuna', 'TheMuse', 'RemoteOK'] as const;

  const results = await Promise.allSettled([
    fetchJSearchJobs(query, location, remote),
    fetchAdzunaJobs(query, location),
    fetchMuseJobs(query, location),
    fetchRemoteOKJobs(query),
  ]);

  const allJobs: NormalizedJob[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    const label = sourceLabels[index];
    if (result.status === 'fulfilled') {
      console.info(`[Aggregator] ${label} returned ${result.value.length} jobs`);
      allJobs.push(...result.value);
    } else {
      const message = `[Aggregator] ${label} failed: ${result.reason}`;
      console.error(message);
      errors.push(message);
    }
  });

  const deduplicated = deduplicateJobs(allJobs);

  console.info(
    `[Aggregator] Total: ${allJobs.length} raw -> ${deduplicated.length} after deduplication`,
  );

  return { jobs: deduplicated, errors };
}

// Re-export individual source functions for direct use
export { fetchJSearchJobs } from './jsearch';
export { fetchAdzunaJobs } from './adzuna';
export { fetchMuseJobs } from './themuse';
export { fetchRemoteOKJobs } from './remoteok';
