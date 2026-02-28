import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import prisma from "@/lib/prisma"
import authOptions from "@/lib/auth"

// ---------------------------------------------------------------------------
// Query parameter validation
// ---------------------------------------------------------------------------

const querySchema = z.object({
  status: z.enum(["NEW", "SAVED", "APPLIED", "ARCHIVED"]).optional(),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  maxScore: z.coerce.number().int().min(0).max(100).optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(["score_asc", "score_desc", "date_asc", "date_desc"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

// ---------------------------------------------------------------------------
// GET /api/jobs — List user's jobs with filtering & pagination
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const rawParams: Record<string, string> = {}
    for (const [key, value] of searchParams.entries()) {
      rawParams[key] = value
    }

    const parsed = querySchema.safeParse(rawParams)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { status, minScore, maxScore, search, sort, page, limit } = parsed.data

    // Build where clause
    const where: Record<string, unknown> = { userId }

    if (status) {
      where.status = status
    }

    if (minScore !== undefined || maxScore !== undefined) {
      where.aiScore = {
        ...(minScore !== undefined ? { gte: minScore } : {}),
        ...(maxScore !== undefined ? { lte: maxScore } : {}),
      }
    }

    if (search) {
      where.job = {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { company: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    // Build orderBy
    let orderBy: Record<string, string>[] = [{ createdAt: "desc" }]
    if (sort) {
      switch (sort) {
        case "score_asc":
          orderBy = [{ aiScore: "asc" }]
          break
        case "score_desc":
          orderBy = [{ aiScore: "desc" }]
          break
        case "date_asc":
          orderBy = [{ createdAt: "asc" }]
          break
        case "date_desc":
          orderBy = [{ createdAt: "desc" }]
          break
      }
    }

    // Fetch paginated results
    const skip = (page - 1) * limit

    const [jobs, total] = await Promise.all([
      prisma.userJob.findMany({
        where,
        include: {
          job: true,
          profile: { select: { id: true, name: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.userJob.count({ where }),
    ])

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[API] GET /api/jobs error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
