import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import prisma from "@/lib/prisma"
import authOptions from "@/lib/auth"
import { stripe, createCheckoutSession, TierName } from "@/lib/stripe"
import rateLimit from "@/lib/rate-limit"

// ---------------------------------------------------------------------------
// Rate limiter — 5 checkout attempts per minute per user
// ---------------------------------------------------------------------------

const limiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 500,
})

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const checkoutSchema = z.object({
  tier: z.enum(["PRO", "PREMIUM", "ENTERPRISE"]),
})

// ---------------------------------------------------------------------------
// POST /api/billing/checkout — Create a Stripe checkout session
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
      await limiter.check(5, userId)
    } catch {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Validate body
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const tier = parsed.data.tier as TierName

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    let stripeCustomerId = subscription?.stripeCustomerId

    if (!stripeCustomerId) {
      // Create a Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
        metadata: { userId },
      })
      stripeCustomerId = customer.id

      // Upsert subscription record with customer ID
      subscription = await prisma.subscription.upsert({
        where: { userId },
        update: { stripeCustomerId },
        create: {
          userId,
          stripeCustomerId,
          tier: "FREE",
          status: "TRIALING",
        },
      })
    }

    // Create checkout session
    const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const checkoutSession = await createCheckoutSession(
      stripeCustomerId,
      tier,
      `${origin}/dashboard?checkout=success`,
      `${origin}/pricing?checkout=canceled`
    )

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("[API] POST /api/billing/checkout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
