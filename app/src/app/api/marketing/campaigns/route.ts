import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/prisma"
import authOptions from "@/lib/auth"
import rateLimit from "@/lib/rate-limit"

// ---------------------------------------------------------------------------
// Rate limiter — 10 campaign operations per minute
// ---------------------------------------------------------------------------

const limiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 500,
})

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(200),
  type: z.enum(
    ["EMAIL_DRIP", "SOCIAL_POST", "CONTENT_SEO", "REFERRAL", "PRODUCT_HUNT", "RETARGETING"]
  ),
  targetAudience: z.string().min(1, "Target audience is required").max(500),
})

// ---------------------------------------------------------------------------
// Admin check helper
// ---------------------------------------------------------------------------

async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim())
  return !!user?.email && adminEmails.includes(user.email)
}

// ---------------------------------------------------------------------------
// GET /api/marketing/campaigns — List campaigns
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
    const status = searchParams.get("status") ?? undefined
    const type = searchParams.get("type") ?? undefined

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (type) where.type = type

    const skip = (page - 1) * limit

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          _count: { select: { contacts: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ])

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[API] GET /api/marketing/campaigns error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST /api/marketing/campaigns — Create a new campaign using AI
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Rate limit
    try {
      await limiter.check(10, session.user.id)
    } catch {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Validate body
    const body = await request.json()
    const parsed = createCampaignSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, type, targetAudience } = parsed.data

    // Generate campaign content using AI marketing agent
    const aiContent = await generateCampaignContent(type, targetAudience)

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        type,
        status: "DRAFT",
        content: aiContent as unknown as Prisma.InputJsonValue,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "campaign.created",
        resource: `campaign:${campaign.id}`,
        details: { name, type, targetAudience } as unknown as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error("[API] POST /api/marketing/campaigns error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// AI campaign content generation helper
// ---------------------------------------------------------------------------

async function generateCampaignContent(
  type: string,
  targetAudience: string
): Promise<Record<string, unknown>> {
  // TODO: Integrate with Anthropic Claude API for AI-generated content
  // For now, return a structured placeholder based on campaign type
  const baseContent = {
    targetAudience,
    generatedAt: new Date().toISOString(),
  }

  switch (type) {
    case "EMAIL_DRIP":
      return {
        ...baseContent,
        subject: `Discover smarter job matching — tailored for ${targetAudience}`,
        emails: [
          {
            step: 1,
            subject: "Welcome to JobMatch Pro",
            body: "Placeholder — AI-generated welcome email content",
            delayDays: 0,
          },
          {
            step: 2,
            subject: "Did you know? AI-powered job scoring",
            body: "Placeholder — AI-generated follow-up email content",
            delayDays: 3,
          },
          {
            step: 3,
            subject: "Upgrade your job search today",
            body: "Placeholder — AI-generated conversion email content",
            delayDays: 7,
          },
        ],
      }

    case "SOCIAL_POST":
      return {
        ...baseContent,
        posts: [
          {
            platform: "twitter",
            text: "Placeholder — AI-generated Twitter post",
          },
          {
            platform: "linkedin",
            text: "Placeholder — AI-generated LinkedIn post",
          },
        ],
      }

    case "CONTENT_SEO":
      return {
        ...baseContent,
        title: "Placeholder — AI-generated blog title",
        outline: ["Introduction", "Problem", "Solution", "CTA"],
        keywords: ["job matching", "AI recruitment", "career tools"],
      }

    default:
      return {
        ...baseContent,
        description: `AI-generated ${type} campaign for ${targetAudience}`,
      }
  }
}
