import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/prisma"
import authOptions from "@/lib/auth"
import rateLimit from "@/lib/rate-limit"

// ---------------------------------------------------------------------------
// Rate limiter — 20 generation requests per minute
// ---------------------------------------------------------------------------

const limiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 500,
})

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const generateSchema = z.object({
  type: z.enum(["social", "email", "blog", "seo"]),
  params: z.record(z.string(), z.unknown()).optional().default({}),
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
// POST /api/marketing/generate — Generate marketing content using AI
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
      await limiter.check(20, session.user.id)
    } catch {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Validate body
    const body = await request.json()
    const parsed = generateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { type, params } = parsed.data

    // Generate content based on type
    const content = await generateContent(type, params)

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "marketing.content_generated",
        resource: `marketing:${type}`,
        details: { type, params } as unknown as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json({
      type,
      content,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] POST /api/marketing/generate error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// Content generation by type
// ---------------------------------------------------------------------------

async function generateContent(
  type: string,
  params: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // TODO: Integrate with Anthropic Claude API for real AI generation
  // For now, return structured placeholder content

  const topic = (params.topic as string) ?? "JobMatch Pro"
  const audience = (params.audience as string) ?? "job seekers"
  const tone = (params.tone as string) ?? "professional"

  switch (type) {
    case "social": {
      const platform = (params.platform as string) ?? "twitter"
      return {
        platform,
        posts: [
          {
            text: `Tired of scrolling through irrelevant job listings? ${topic} uses AI to match you with roles that actually fit your skills. Try it free today!`,
            hashtags: ["#JobSearch", "#AIRecruitment", "#CareerTools"],
            characterCount: 150,
          },
          {
            text: `Your dream job is out there — let AI help you find it. ${topic} scores every listing against your resume so you never miss a perfect match.`,
            hashtags: ["#JobMatch", "#TechCareers", "#AIJobs"],
            characterCount: 145,
          },
          {
            text: `Stop applying everywhere. Start applying smarter. ${topic} — AI-powered job matching for ${audience}.`,
            hashtags: ["#SmartJobSearch", "#AI", "#Careers"],
            characterCount: 110,
          },
        ],
        metadata: { tone, audience, platform },
      }
    }

    case "email": {
      const emailType = (params.emailType as string) ?? "promotional"
      return {
        emailType,
        subject: `Find your next role faster with AI-powered job matching`,
        preheader: `${topic} analyzes thousands of listings so you don't have to.`,
        body: {
          greeting: `Hi there,`,
          intro: `We know how exhausting the job search can be. That's why we built ${topic} — an AI-powered platform that scores job listings against your resume and preferences.`,
          features: [
            "AI-powered job scoring (0-100 match score)",
            "Multi-source aggregation (LinkedIn, Indeed, and more)",
            "Custom search profiles with deal-breaker detection",
            "One-click Google Sheets export",
          ],
          cta: {
            text: "Start Your Free Trial",
            url: "https://jobmatchpro.com/signup",
          },
          closing: `Happy job hunting!\nThe ${topic} Team`,
        },
        metadata: { tone, audience, emailType },
      }
    }

    case "blog": {
      const blogTopic = (params.blogTopic as string) ?? "AI in job searching"
      return {
        title: `How AI Is Revolutionizing the Job Search in 2026`,
        slug: "ai-revolutionizing-job-search-2026",
        excerpt: `Discover how platforms like ${topic} use artificial intelligence to match candidates with their ideal roles — saving hours of manual searching.`,
        outline: [
          {
            heading: "The Problem with Traditional Job Boards",
            points: [
              "Information overload",
              "Keyword-based search limitations",
              "Time wasted on irrelevant listings",
            ],
          },
          {
            heading: "How AI Changes the Game",
            points: [
              "Semantic matching vs keyword matching",
              "Resume-aware scoring",
              "Deal-breaker detection",
            ],
          },
          {
            heading: `Introducing ${topic}`,
            points: [
              "Multi-source job aggregation",
              "AI scoring engine",
              "Customizable search profiles",
            ],
          },
          {
            heading: "Getting Started",
            points: [
              "Create your profile",
              "Upload your resume",
              "Let AI do the heavy lifting",
            ],
          },
        ],
        seoKeywords: [
          "AI job search",
          "job matching AI",
          "best job search tools 2026",
          blogTopic,
        ],
        estimatedWordCount: 1500,
        metadata: { tone, audience, blogTopic },
      }
    }

    case "seo": {
      const targetKeyword = (params.keyword as string) ?? "AI job matching"
      return {
        targetKeyword,
        metaTitle: `${topic} — AI-Powered Job Matching Platform | Find Your Perfect Role`,
        metaDescription: `${topic} uses artificial intelligence to score and rank job listings against your resume. Save hours of searching — let AI find your next career move.`,
        h1: `AI-Powered Job Matching for ${audience}`,
        suggestedH2s: [
          "How AI Job Matching Works",
          "Why Traditional Job Boards Fall Short",
          `${topic} Features`,
          "Pricing Plans",
          "Get Started Free",
        ],
        keywords: {
          primary: targetKeyword,
          secondary: [
            "job search AI",
            "resume matching",
            "automated job search",
            "career matching platform",
          ],
          longTail: [
            "best AI tool for job searching",
            "how to use AI to find a job",
            "automated job matching platform",
          ],
        },
        structuredData: {
          "@type": "SoftwareApplication",
          name: topic,
          applicationCategory: "BusinessApplication",
          description: `AI-powered job matching platform for ${audience}`,
        },
        metadata: { tone, audience, targetKeyword },
      }
    }

    default:
      return {
        message: `Content generation for type "${type}" is not yet implemented.`,
      }
  }
}
