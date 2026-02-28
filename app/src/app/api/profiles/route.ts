import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import authOptions from "@/lib/auth"
import { profileSchema } from "@/lib/validation"
import { PROFILE_LIMITS, Tier } from "@/lib/constants"

// ---------------------------------------------------------------------------
// GET /api/profiles — List user's search profiles
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string

    const profiles = await prisma.searchProfile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(profiles)
  } catch (error) {
    console.error("[API] GET /api/profiles error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST /api/profiles — Create a new search profile
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string

    // Validate request body
    const body = await request.json()
    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Check profile limit based on subscription tier
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })
    const tier: Tier = (subscription?.tier as Tier) ?? "FREE"
    const maxProfiles = PROFILE_LIMITS[tier]

    const currentCount = await prisma.searchProfile.count({
      where: { userId },
    })

    if (currentCount >= maxProfiles) {
      return NextResponse.json(
        {
          error: "Profile limit reached",
          message: `Your ${tier} plan allows a maximum of ${maxProfiles} profile(s). Please upgrade to create more.`,
        },
        { status: 403 }
      )
    }

    // Create the profile
    const profile = await prisma.searchProfile.create({
      data: {
        userId,
        name: parsed.data.name,
        keywords: parsed.data.keywords,
        locations: parsed.data.locations,
        dealBreakers: parsed.data.dealBreakers,
        resumeText: parsed.data.resumeText ?? null,
        minSalary: parsed.data.minSalary ?? null,
        maxSalary: parsed.data.maxSalary ?? null,
        remote: parsed.data.remote,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error("[API] POST /api/profiles error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
