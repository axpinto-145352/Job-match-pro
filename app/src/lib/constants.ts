/**
 * Application-wide constants for JobMatch Pro.
 */

export const APP_NAME = 'JobMatch Pro' as const

// ---------------------------------------------------------------------------
// Subscription Tiers
// ---------------------------------------------------------------------------

export type Tier = 'FREE' | 'PRO' | 'PREMIUM' | 'ENTERPRISE'

/**
 * Maximum number of job matches returned per day for each tier.
 * `Infinity` represents unlimited usage.
 */
export const TIER_LIMITS: Record<Tier, number> = {
  FREE: 10,
  PRO: 100,
  PREMIUM: 500,
  ENTERPRISE: Infinity,
} as const

/**
 * Maximum number of search profiles a user can create for each tier.
 * `Infinity` represents unlimited profiles.
 */
export const PROFILE_LIMITS: Record<Tier, number> = {
  FREE: 1,
  PRO: 5,
  PREMIUM: 20,
  ENTERPRISE: Infinity,
} as const

// ---------------------------------------------------------------------------
// Pricing Page Configuration
// ---------------------------------------------------------------------------

export interface TierPrice {
  name: string
  tier: Tier
  description: string
  priceMonthly: number
  features: string[]
}

export const TIER_PRICES: TierPrice[] = [
  {
    name: 'Free',
    tier: 'FREE',
    description: 'Get started with basic job matching to explore opportunities.',
    priceMonthly: 0,
    features: [
      'Up to 10 job matches per day',
      '1 search profile',
      'Basic AI matching',
      'Email notifications',
    ],
  },
  {
    name: 'Pro',
    tier: 'PRO',
    description: 'Supercharge your job search with advanced matching and more profiles.',
    priceMonthly: 29,
    features: [
      'Up to 100 job matches per day',
      '5 search profiles',
      'Advanced AI matching',
      'Priority email notifications',
      'Google Sheets export',
      'Resume keyword analysis',
    ],
  },
  {
    name: 'Premium',
    tier: 'PREMIUM',
    description: 'For serious job seekers who want the competitive edge.',
    priceMonthly: 79,
    features: [
      'Up to 500 job matches per day',
      '20 search profiles',
      'Premium AI matching with deal-breaker filtering',
      'Real-time notifications',
      'Google Sheets export',
      'Resume keyword analysis',
      'Salary insights',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    tier: 'ENTERPRISE',
    description: 'Unlimited access for recruiters and staffing agencies.',
    priceMonthly: 199,
    features: [
      'Unlimited job matches per day',
      'Unlimited search profiles',
      'Enterprise AI matching with custom models',
      'Real-time notifications',
      'Google Sheets export',
      'Resume keyword analysis',
      'Salary insights',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
    ],
  },
] as const
