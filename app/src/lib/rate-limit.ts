/**
 * In-memory rate limiter using the token bucket algorithm.
 *
 * Each unique token gets its own bucket that refills over the configured
 * interval. When `check` is called, a token is consumed from the bucket.
 * If the bucket is empty the call rejects with a 429-style error.
 */

export interface RateLimitResult {
  /** Number of requests remaining in the current window */
  remaining: number
  /** Whether the request is allowed */
  allowed: boolean
}

interface TokenBucket {
  tokens: number
  lastRefill: number
}

interface RateLimiterOptions {
  /** Time window in milliseconds for the token bucket to fully refill */
  interval: number
  /** Maximum number of unique tokens (callers) tracked simultaneously */
  uniqueTokenPerInterval: number
}

/**
 * Creates a rate limiter instance.
 *
 * @param options - Configuration for interval and max unique tokens
 * @returns An object with a `check` method
 */
export function rateLimit(options: RateLimiterOptions) {
  const { interval, uniqueTokenPerInterval } = options
  const buckets = new Map<string, TokenBucket>()

  // Periodically clean up expired buckets to prevent memory leaks
  const cleanup = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (now - bucket.lastRefill > interval * 2) {
        buckets.delete(key)
      }
    }
  }, interval)

  // Allow the timer to not prevent Node from exiting
  if (cleanup.unref) {
    cleanup.unref()
  }

  return {
    /**
     * Check whether a request from the given token is allowed.
     *
     * @param limit - Maximum number of requests allowed per interval
     * @param token - A unique identifier for the caller (e.g. IP address, user ID)
     * @returns A promise that resolves with the remaining count or rejects if rate-limited
     */
    check: (limit: number, token: string): Promise<RateLimitResult> => {
      return new Promise<RateLimitResult>((resolve, reject) => {
        const now = Date.now()
        let bucket = buckets.get(token)

        if (!bucket) {
          // Enforce unique token cap: evict oldest entry when full
          if (buckets.size >= uniqueTokenPerInterval) {
            let oldestKey: string | null = null
            let oldestTime = Infinity
            for (const [key, b] of buckets) {
              if (b.lastRefill < oldestTime) {
                oldestTime = b.lastRefill
                oldestKey = key
              }
            }
            if (oldestKey) {
              buckets.delete(oldestKey)
            }
          }

          bucket = { tokens: limit, lastRefill: now }
          buckets.set(token, bucket)
        }

        // Refill tokens based on elapsed time
        const elapsed = now - bucket.lastRefill
        if (elapsed >= interval) {
          bucket.tokens = limit
          bucket.lastRefill = now
        }

        if (bucket.tokens <= 0) {
          reject(
            Object.assign(new Error('Rate limit exceeded'), {
              statusCode: 429,
              remaining: 0,
            })
          )
          return
        }

        bucket.tokens -= 1

        resolve({
          remaining: bucket.tokens,
          allowed: true,
        })
      })
    },
  }
}

export default rateLimit
