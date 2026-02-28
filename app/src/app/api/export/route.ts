import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { google } from "googleapis"
import prisma from "@/lib/prisma"
import authOptions from "@/lib/auth"
import rateLimit from "@/lib/rate-limit"

// ---------------------------------------------------------------------------
// Rate limiter — 10 exports per minute per user
// ---------------------------------------------------------------------------

const limiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 500,
})

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const exportSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  sheetName: z.string().min(1).max(100).default("JobMatch Export"),
  filters: z
    .object({
      status: z.enum(["NEW", "SAVED", "APPLIED", "ARCHIVED"]).optional(),
      minScore: z.number().int().min(0).max(100).optional(),
      maxScore: z.number().int().min(0).max(100).optional(),
    })
    .optional(),
})

// ---------------------------------------------------------------------------
// Tiers that are allowed to export
// ---------------------------------------------------------------------------

const EXPORT_ALLOWED_TIERS = new Set(["PRO", "PREMIUM", "ENTERPRISE"])

// ---------------------------------------------------------------------------
// POST /api/export — Export jobs to Google Sheets
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string

    // Rate limit
    try {
      await limiter.check(10, userId)
    } catch {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Check subscription tier
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    const tier = subscription?.tier ?? "FREE"
    if (!EXPORT_ALLOWED_TIERS.has(tier)) {
      return NextResponse.json(
        {
          error: "Export requires a PRO or higher subscription.",
          tier,
        },
        { status: 403 }
      )
    }

    // Validate body
    const body = await request.json()
    const parsed = exportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { spreadsheetId, sheetName, filters } = parsed.data

    // Build where clause for job query
    const where: Record<string, unknown> = { userId }
    if (filters?.status) {
      where.status = filters.status
    }
    if (filters?.minScore !== undefined || filters?.maxScore !== undefined) {
      where.aiScore = {
        ...(filters.minScore !== undefined ? { gte: filters.minScore } : {}),
        ...(filters.maxScore !== undefined ? { lte: filters.maxScore } : {}),
      }
    }

    // Fetch jobs to export
    const userJobs = await prisma.userJob.findMany({
      where,
      include: { job: true, profile: { select: { name: true } } },
      orderBy: { aiScore: "desc" },
      take: 1000, // cap at 1000 rows
    })

    if (userJobs.length === 0) {
      return NextResponse.json(
        { error: "No jobs found matching the given filters." },
        { status: 404 }
      )
    }

    // Build Google Sheets API client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Prepare rows
    const headerRow = [
      "Title",
      "Company",
      "Location",
      "AI Score",
      "AI Reason",
      "Status",
      "Flagged",
      "Profile",
      "Source",
      "Salary",
      "Remote",
      "URL",
      "Posted At",
      "Saved At",
    ]

    const dataRows = userJobs.map((uj) => [
      uj.job.title,
      uj.job.company,
      uj.job.location ?? "",
      uj.aiScore?.toString() ?? "",
      uj.aiReason ?? "",
      uj.status,
      uj.flagged ? "Yes" : "No",
      uj.profile?.name ?? "",
      uj.job.source,
      uj.job.salary ?? "",
      uj.job.remote ? "Yes" : "No",
      uj.job.url,
      uj.job.postedAt?.toISOString() ?? "",
      uj.createdAt.toISOString(),
    ])

    // Write to Google Sheets
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [headerRow, ...dataRows],
      },
    })

    // Record the export
    await prisma.sheetExport.create({
      data: {
        userId,
        spreadsheetId,
        sheetName,
        jobCount: userJobs.length,
      },
    })

    return NextResponse.json({
      success: true,
      jobCount: userJobs.length,
      spreadsheetId,
      sheetName,
    })
  } catch (error) {
    console.error("[API] POST /api/export error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
