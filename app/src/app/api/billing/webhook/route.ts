import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import prisma from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Stripe client
// ---------------------------------------------------------------------------

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a Stripe price ID back to a subscription tier.
 */
function tierFromPriceId(priceId: string): "PRO" | "PREMIUM" | "ENTERPRISE" | null {
  const map: Record<string, "PRO" | "PREMIUM" | "ENTERPRISE"> = {
    [process.env.STRIPE_PRICE_PRO!]: "PRO",
    [process.env.STRIPE_PRICE_PREMIUM!]: "PREMIUM",
    [process.env.STRIPE_PRICE_ENTERPRISE!]: "ENTERPRISE",
  }
  return map[priceId] ?? null
}

/**
 * Map Stripe subscription status to our internal SubscriptionStatus enum.
 */
function mapStripeStatus(
  status: string
): "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED" | "TRIALING" {
  switch (status) {
    case "active":
      return "ACTIVE"
    case "trialing":
      return "TRIALING"
    case "past_due":
      return "PAST_DUE"
    case "canceled":
    case "unpaid":
      return "CANCELED"
    case "incomplete_expired":
      return "EXPIRED"
    default:
      return "ACTIVE"
  }
}

// ---------------------------------------------------------------------------
// POST /api/billing/webhook — Handle Stripe webhook events
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      )
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("[Webhook] Signature verification failed:", error)
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      // -----------------------------------------------------------------
      // Checkout completed — new subscription created
      // -----------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== "subscription" || !session.customer || !session.subscription) {
          break
        }

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id

        // Fetch the full subscription to get price info
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = stripeSub.items.data[0]?.price?.id ?? ""
        const tier = tierFromPriceId(priceId) ?? "PRO"

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            tier,
            status: "ACTIVE",
            currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        })

        console.log(
          `[Webhook] checkout.session.completed — customer=${customerId} tier=${tier}`
        )
        break
      }

      // -----------------------------------------------------------------
      // Subscription updated (upgrade, downgrade, renewal)
      // -----------------------------------------------------------------
      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription
        const customerId =
          typeof stripeSub.customer === "string"
            ? stripeSub.customer
            : stripeSub.customer.id

        const priceId = stripeSub.items.data[0]?.price?.id ?? ""
        const tier = tierFromPriceId(priceId)
        const status = mapStripeStatus(stripeSub.status)

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripePriceId: priceId,
            ...(tier ? { tier } : {}),
            status,
            currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        })

        console.log(
          `[Webhook] customer.subscription.updated — customer=${customerId} status=${status}`
        )
        break
      }

      // -----------------------------------------------------------------
      // Subscription deleted (canceled & expired)
      // -----------------------------------------------------------------
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription
        const customerId =
          typeof stripeSub.customer === "string"
            ? stripeSub.customer
            : stripeSub.customer.id

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            tier: "FREE",
            status: "CANCELED",
            cancelAtPeriodEnd: false,
          },
        })

        console.log(
          `[Webhook] customer.subscription.deleted — customer=${customerId} reverted to FREE`
        )
        break
      }

      // -----------------------------------------------------------------
      // Invoice payment succeeded
      // -----------------------------------------------------------------
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id

        if (!customerId) break

        // If this is a subscription invoice, update the period end
        if ((invoice as any).subscription) {
          const subscriptionId =
            typeof (invoice as any).subscription === "string"
              ? (invoice as any).subscription
              : (invoice as any).subscription.id

          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)

          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              status: "ACTIVE",
              currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
            },
          })
        }

        console.log(
          `[Webhook] invoice.payment_succeeded — customer=${customerId}`
        )
        break
      }

      // -----------------------------------------------------------------
      // Invoice payment failed
      // -----------------------------------------------------------------
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id

        if (!customerId) break

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: "PAST_DUE",
          },
        })

        console.log(
          `[Webhook] invoice.payment_failed — customer=${customerId} marked PAST_DUE`
        )
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`[Webhook] Error processing ${event.type}:`, error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
