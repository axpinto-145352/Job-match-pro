import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import authOptions from "@/lib/auth"
import { createCustomerPortalSession } from "@/lib/stripe"

// ---------------------------------------------------------------------------
// POST /api/billing/portal — Create a Stripe customer portal session
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string

    // Look up subscription for the Stripe customer ID
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe to a plan first." },
        { status: 400 }
      )
    }

    const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const portalSession = await createCustomerPortalSession(
      subscription.stripeCustomerId,
      `${origin}/dashboard`
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("[API] POST /api/billing/portal error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
