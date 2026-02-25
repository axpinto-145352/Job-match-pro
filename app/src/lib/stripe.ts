import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
  typescript: true,
})

export type TierName = 'FREE' | 'PRO' | 'PREMIUM' | 'ENTERPRISE'

export interface TierConfig {
  name: TierName
  priceMonthly: number
  stripePriceId: string | null
}

export const tierConfig: Record<TierName, TierConfig> = {
  FREE: {
    name: 'FREE',
    priceMonthly: 0,
    stripePriceId: null,
  },
  PRO: {
    name: 'PRO',
    priceMonthly: 29,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
  },
  PREMIUM: {
    name: 'PREMIUM',
    priceMonthly: 79,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    priceMonthly: 199,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
  },
}

/**
 * Creates a Stripe Checkout session for a given subscription tier.
 *
 * @param customerId - The Stripe customer ID
 * @param tier - The subscription tier to checkout
 * @param successUrl - URL to redirect on successful payment
 * @param cancelUrl - URL to redirect on cancelled payment
 * @returns The created Stripe Checkout Session
 */
export async function createCheckoutSession(
  customerId: string,
  tier: TierName,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const config = tierConfig[tier]

  if (!config.stripePriceId) {
    throw new Error(`No Stripe price ID configured for tier: ${tier}`)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: config.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        tier: tier,
      },
    },
  })

  return session
}

/**
 * Creates a Stripe Customer Portal session so the user can manage
 * their subscription, payment methods, and invoices.
 *
 * @param customerId - The Stripe customer ID
 * @param returnUrl - URL to redirect back to after the portal session
 * @returns The created Stripe Billing Portal Session
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export default stripe
