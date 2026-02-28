import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Daily job limits by tier
// ---------------------------------------------------------------------------

const DAILY_JOB_LIMITS: Record<string, number> = {
  FREE: 5,
  PRO: 50,
  PREMIUM: 200,
  ENTERPRISE: 1000,
}

// ---------------------------------------------------------------------------
// Job fetching & scoring helpers (placeholder implementations)
// ---------------------------------------------------------------------------

interface FetchedJob {
  externalId: string
  source: string
  title: string
  company: string
  location: string | null
  description: string
  salary: string | null
  url: string
  postedAt: Date | null
  remote: boolean
}

interface ScoredJob extends FetchedJob {
  aiScore: number
  aiReason: string
}

/**
 * Fetch jobs from external sources based on a search profile.
 * In production, this calls LinkedIn, Indeed, Glassdoor, etc.
 */
async function fetchJobsForProfile(profile: {
  keywords: string[]
  locations: string[]
  remote: boolean
}): Promise<FetchedJob[]> {
  // TODO: Implement actual job source integrations
  // This would call APIs like LinkedIn, Indeed, Glassdoor, etc.
  console.log(
    `[Cron] Fetching jobs for keywords=${profile.keywords.join(",")}, locations=${profile.locations.join(",")}, remote=${profile.remote}`
  )
  return []
}

/**
 * Score a job against a search profile using AI.
 */
async function scoreJobWithAI(
  job: FetchedJob,
  _profile: {
    resumeText: string | null
    keywords: string[]
    dealBreakers: string[]
    minSalary: number | null
    maxSalary: number | null
  }
): Promise<{ score: number; reason: string }> {
  // TODO: Integrate with ai-scoring service for production
  console.log(
    `[Cron] Scoring job "${job.title}" at "${job.company}" against profile`
  )
  return { score: 50, reason: "Placeholder score — AI scoring not yet implemented" }
}

// ---------------------------------------------------------------------------
// GET /api/cron/fetch-jobs — Cron endpoint to fetch new jobs
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[Cron] Starting job fetch cycle...")

    // Fetch all active profiles with their user subscriptions
    const profiles = await prisma.searchProfile.findMany({
      where: { isActive: true },
      include: {
        user: {
          include: {
            subscription: true,
          },
        },
      },
    })

    console.log(`[Cron] Found ${profiles.length} active profile(s)`)

    let totalJobsFetched = 0
    let totalJobsSaved = 0
    const errors: string[] = []

    for (const profile of profiles) {
      try {
        const userId = profile.userId
        const subscription = profile.user.subscription
        const tier = subscription?.tier ?? "FREE"
        const dailyLimit = DAILY_JOB_LIMITS[tier] ?? DAILY_JOB_LIMITS.FREE

        // Check & reset daily usage counter
        const now = new Date()
        let jobsUsedToday = subscription?.jobsUsedToday ?? 0
        const jobsResetAt = subscription?.jobsResetAt ?? new Date(0)

        // Reset counter if the last reset was before today
        if (
          jobsResetAt.toDateString() !== now.toDateString()
        ) {
          jobsUsedToday = 0
          if (subscription) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { jobsUsedToday: 0, jobsResetAt: now },
            })
          }
        }

        // Skip if daily limit reached
        if (jobsUsedToday >= dailyLimit) {
          console.log(
            `[Cron] User ${userId} reached daily limit (${dailyLimit}) for tier ${tier}, skipping profile ${profile.id}`
          )
          continue
        }

        const remainingQuota = dailyLimit - jobsUsedToday

        // Fetch jobs from external sources
        const fetchedJobs = await fetchJobsForProfile({
          keywords: profile.keywords,
          locations: profile.locations,
          remote: profile.remote,
        })

        totalJobsFetched += fetchedJobs.length

        // Limit jobs to remaining quota
        const jobsToProcess = fetchedJobs.slice(0, remainingQuota)

        // Score each job with AI and save to DB
        const scoredJobs: ScoredJob[] = []
        for (const job of jobsToProcess) {
          const { score, reason } = await scoreJobWithAI(job, {
            resumeText: profile.resumeText,
            keywords: profile.keywords,
            dealBreakers: profile.dealBreakers,
            minSalary: profile.minSalary,
            maxSalary: profile.maxSalary,
          })

          scoredJobs.push({ ...job, aiScore: score, aiReason: reason })
        }

        // Upsert jobs and create user-job associations
        let savedCount = 0
        for (const sj of scoredJobs) {
          try {
            // Upsert the job record
            const job = await prisma.job.upsert({
              where: { externalId: sj.externalId },
              update: {
                title: sj.title,
                company: sj.company,
                location: sj.location,
                description: sj.description,
                salary: sj.salary,
                url: sj.url,
                postedAt: sj.postedAt,
                remote: sj.remote,
              },
              create: {
                externalId: sj.externalId,
                source: sj.source,
                title: sj.title,
                company: sj.company,
                location: sj.location,
                description: sj.description,
                salary: sj.salary,
                url: sj.url,
                postedAt: sj.postedAt,
                remote: sj.remote,
              },
            })

            // Create user-job association (skip if duplicate)
            await prisma.userJob.upsert({
              where: {
                userId_jobId: { userId, jobId: job.id },
              },
              update: {
                aiScore: sj.aiScore,
                aiReason: sj.aiReason,
                profileId: profile.id,
              },
              create: {
                userId,
                jobId: job.id,
                profileId: profile.id,
                aiScore: sj.aiScore,
                aiReason: sj.aiReason,
                status: "NEW",
              },
            })

            savedCount++
          } catch (jobError) {
            console.error(
              `[Cron] Failed to save job ${sj.externalId}:`,
              jobError
            )
          }
        }

        totalJobsSaved += savedCount

        // Update daily usage counter
        if (subscription && savedCount > 0) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              jobsUsedToday: { increment: savedCount },
            },
          })
        }

        console.log(
          `[Cron] Profile ${profile.id}: fetched=${fetchedJobs.length}, saved=${savedCount}`
        )
      } catch (profileError) {
        const message =
          profileError instanceof Error
            ? profileError.message
            : String(profileError)
        console.error(
          `[Cron] Error processing profile ${profile.id}:`,
          profileError
        )
        errors.push(`Profile ${profile.id}: ${message}`)
      }
    }

    console.log(
      `[Cron] Cycle complete — fetched=${totalJobsFetched}, saved=${totalJobsSaved}, errors=${errors.length}`
    )

    return NextResponse.json({
      success: true,
      profilesProcessed: profiles.length,
      totalJobsFetched,
      totalJobsSaved,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("[API] GET /api/cron/fetch-jobs error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
