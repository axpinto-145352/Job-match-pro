import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import prisma from "@/lib/prisma"
import authOptions from "@/lib/auth"
import rateLimit from "@/lib/rate-limit"

// ---------------------------------------------------------------------------
// Rate limiter — 20 lead captures per minute per IP
// ---------------------------------------------------------------------------

const limiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 500,
})

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const leadSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().max(100).optional(),
  source: z.string().min(1).max(100),
})

const VALID_LEAD_STATUSES = ["NEW", "CONTACTED", "ENGAGED", "QUALIFIED", "CONVERTED", "CHURNED"] as const

// ---------------------------------------------------------------------------
// GET /api/leads — List leads (admin only)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    // Admin check — in production, use a role field or admin list
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim())
    if (!user?.email || !adminEmails.includes(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse query params for pagination & filtering
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)))
    const statusParam = searchParams.get("status")
    const sourceParam = searchParams.get("source")

    const where: Record<string, unknown> = {}
    if (statusParam && (VALID_LEAD_STATUSES as readonly string[]).includes(statusParam)) {
      where.status = statusParam
    }
    if (sourceParam && sourceParam.length <= 100) {
      where.source = sourceParam
    }

    const skip = (page - 1) * limit

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ])

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[API] GET /api/leads error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST /api/leads — Capture a new lead (public endpoint)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown"

    try {
      await limiter.check(20, ip)
    } catch {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Validate body
    const body = await request.json()
    const parsed = leadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, name, source } = parsed.data

    // Upsert lead — don't fail if email already exists
    const lead = await prisma.lead.upsert({
      where: { email },
      update: {
        name: name ?? undefined,
        source,
        updatedAt: new Date(),
      },
      create: {
        email,
        name: name ?? null,
        source,
        status: "NEW",
      },
    })

    // Log for audit
    await prisma.auditLog.create({
      data: {
        action: "lead.captured",
        resource: `lead:${lead.id}`,
        details: { email, source },
        ip,
      },
    })

    return NextResponse.json(
      { success: true, message: "Thank you for your interest!" },
      { status: 201 }
    )
  } catch (error) {
    console.error("[API] POST /api/leads error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
