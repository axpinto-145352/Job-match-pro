# JobMatch Pro — Architecture & Deployment Guide

## Overview

JobMatch Pro is a production-ready SaaS application that replaces the fragile n8n + Apify scraper + SerpAPI job search workflow with a self-contained Next.js application using official job board APIs and Claude AI for intelligent matching.

**Business Model**: $50/month subscription per user (7-day free trial included)
**Daily Limit**: 100 AI-scored jobs per user per day (25 during trial)
**Target Margin**: ~75-84% gross margin per user

---

## Architecture

```
                    ┌──────────────────────────────────────────┐
                    │              Next.js App                  │
                    ├──────────────────────────────────────────┤
                    │  Frontend (React)                         │
                    │  ├── Landing Page (with SVG icons, ToS)   │
                    │  ├── Dashboard (search, sort, skeletons)  │
                    │  ├── Profiles (with char limits)          │
                    │  ├── Export (recent sheets dropdown)      │
                    │  ├── Onboarding Wizard                    │
                    │  ├── Toast Notifications                  │
                    │  └── Terms/Privacy Pages                  │
                    ├──────────────────────────────────────────┤
                    │  API Routes (with rate limiting)           │
                    │  ├── /api/auth (NextAuth + Google OAuth)  │
                    │  ├── /api/jobs (GET with search/sort)     │
                    │  ├── /api/jobs/fetch (with trial support) │
                    │  ├── /api/profiles (Zod validated)        │
                    │  ├── /api/billing (Stripe)                │
                    │  ├── /api/export (with history)           │
                    │  ├── /api/health (monitoring)             │
                    │  └── /api/cron/fetch-daily (structured)   │
                    ├──────────────────────────────────────────┤
                    │  Middleware & Libraries                    │
                    │  ├── Rate Limiting (per-IP sliding window)│
                    │  ├── Input Sanitization (prompt injection)│
                    │  ├── PII Scrubbing (before AI calls)     │
                    │  ├── Encryption (AES-256-GCM)            │
                    │  ├── Env Validation (Zod at startup)     │
                    │  └── Constants (centralized config)       │
                    ├──────────────────────────────────────────┤
                    │  Services                                 │
                    │  ├── Job Sources (Zod-validated APIs)     │
                    │  ├── AI Scorer (bias-mitigated, validated)│
                    │  ├── Sheets Export (encrypted tokens)     │
                    │  └── Stripe Billing                       │
                    └──────────────┬───────────────────────────┘
                                   │
                    ┌──────────────┴───────────────────────────┐
                    │         External Services                 │
                    ├───────────────────────────────────────────┤
                    │  JSearch API     │  Adzuna API            │
                    │  The Muse API    │  RemoteOK API          │
                    │  Claude API      │  Stripe                │
                    │  Google OAuth    │  Google Sheets API      │
                    │  PostgreSQL      │                         │
                    └───────────────────────────────────────────┘
```

---

## Security Measures

| Layer | Protection |
|-------|-----------|
| API Routes | Rate limiting (10 req/min mutation, 60 req/min reads) |
| Inputs | Prompt injection defense, PII scrubbing |
| Storage | AES-256-GCM encryption for refresh tokens |
| Transport | HTTPS enforced with HSTS |
| Headers | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| AI Output | Score clamping (0-100), array length limits, string sanitization |
| Auth | Google OAuth with NextAuth, session-based |
| Billing | Stripe webhook signature verification |
| Cron | Bearer token authentication |

---

## What Changed vs. the Old n8n + Scraper Approach

| Aspect | Old (n8n + Scrapers) | New (JobMatch Pro) |
|--------|---------------------|-------------------|
| Job sourcing | Apify scrapers ($50-200/mo) | Official APIs ($0-30/mo) |
| Web search | SerpAPI ($50/mo) | Not needed |
| Orchestration | Self-hosted n8n ($5-40/mo) | Vercel serverless (free-$20/mo) |
| AI scoring | Not implemented | Claude Haiku (~$1.50/user/mo) |
| Storage | Google Sheets only | PostgreSQL + Sheets export |
| Auth/billing | None | NextAuth + Stripe |
| Reliability | Fragile scrapers | Official APIs with contracts |
| Multi-tenant | Single user | Unlimited subscribers |
| Daily limit | Scraper dependent | 100 jobs/day/user (25 trial) |
| Cost per user | $100-300/mo fixed | $3-8/mo variable |
| Security | None | Rate limiting, encryption, sanitization |
| Legal | ToS violations likely | Official APIs + ToS/Privacy pages |

---

## Cost Analysis (Per User Per Month)

| Component | Cost |
|-----------|------|
| JSearch API | $0-3 |
| Adzuna API | $0 |
| The Muse API | $0 |
| RemoteOK API | $0 |
| Claude Haiku (AI scoring) | ~$1.50 |
| Supabase PostgreSQL | $0-2 |
| Vercel hosting | $0-1 |
| Google Sheets API | $0 |
| Stripe fees (2.9% + $0.30) | $1.75 |
| **Total per user** | **$3-8** |
| **Revenue per user** | **$50** |
| **Gross margin** | **$42-47 (84-94%)** |

### Break-Even Analysis

| Users | Revenue | Cost | Profit |
|-------|---------|------|--------|
| 1 | $50 | $28 | $22 |
| 10 | $500 | $105 | $395 |
| 50 | $2,500 | $425 | $2,075 |
| 100 | $5,000 | $800 | $4,200 |

---

## Job Sources

### 1. JSearch (RapidAPI)
- **Coverage**: LinkedIn, Indeed, Glassdoor, ZipRecruiter
- **Pricing**: Free (500 req/mo) → $30/mo (10K) → $100/mo (100K)
- **Response validation**: Zod schema (`jsearchResponseSchema`)

### 2. Adzuna API
- **Coverage**: 13 countries, salary data
- **Pricing**: Free (250 req/mo)
- **Response validation**: Zod schema (`adzunaResponseSchema`)
- **Salary normalization**: Annual USD conversion

### 3. The Muse API
- **Coverage**: Curated tech/startup roles
- **Pricing**: Free (~500 req/hour)
- **Response validation**: Zod schema (`theMuseResponseSchema`)

### 4. RemoteOK API
- **Coverage**: Remote-only jobs
- **Pricing**: Free JSON endpoint
- **Response validation**: Zod schema (`remoteOKItemSchema`)

---

## AI Scoring System

- **Model**: Configurable via `AI_SCORING_MODEL` env var (defaults to Claude Haiku)
- **Batch size**: 5 jobs per API call
- **Cost**: ~$0.0005 per job (~$1.50/user/month)
- **Bias mitigation**: Explicit instructions to score on objective criteria only
- **Input sanitization**: Prompt injection patterns stripped, PII scrubbed
- **Output validation**: Scores clamped 0-100, arrays limited to 5 items, strings truncated
- **Hallucination guard**: Flags salary claims when no salary data exists

### Score Bands

| Range | Label | Badge Color |
|-------|-------|-------------|
| 90-100 | Exceptional Match | Green |
| 75-89 | Strong Match | Green |
| 60-74 | Moderate Match | Yellow |
| 40-59 | Weak Match | Orange |
| 0-39 | Poor Match | Red |

---

## File Structure

```
prisma/
  schema.prisma           # Database schema (PostgreSQL)

src/
  lib/
    auth.ts               # NextAuth config + encrypted token helpers
    prisma.ts             # Prisma client singleton
    constants.ts          # Centralized status values, limits, score bands
    env.ts                # Zod environment variable validation
    rate-limit.ts         # In-memory sliding window rate limiter
    encryption.ts         # AES-256-GCM field-level encryption
    sanitize.ts           # Prompt injection defense + PII scrubbing
    api-schemas.ts        # Zod schemas for external API responses + salary normalization

  services/
    job-sources.ts        # 4-source job aggregation with Zod validation + reconciliation logging
    ai-scorer.ts          # Claude AI scoring with bias mitigation + output validation
    sheets-export.ts      # Google Sheets export with encrypted tokens
    stripe.ts             # Stripe billing ($50/month)

  components/
    SessionProvider.tsx   # NextAuth session wrapper
    DashboardNav.tsx      # Navigation bar
    JobCard.tsx           # Job display with AI disclosure labels + flag button
    Toast.tsx             # Toast notification system (replaces alert())
    LoadingSkeleton.tsx   # Loading skeleton components

  app/
    layout.tsx            # Root layout
    page.tsx              # Landing page (SVG icons, free trial CTA, AI disclosure)
    login/page.tsx        # Login page
    terms/page.tsx        # Terms of Service
    privacy/page.tsx      # Privacy Policy
    globals.css           # Tailwind styles + toast animation
    (dashboard)/
      layout.tsx          # Dashboard layout (auth guard, toast provider)
      dashboard/
        page.tsx          # Job feed (search, sort, filters, skeletons, onboarding)
        profiles/page.tsx # Profile management (char limits, trial limits)
        export/page.tsx   # Sheets export (recent sheets dropdown)
        subscribe/page.tsx # Subscription page (trial info)
    api/
      auth/[...nextauth]/ # NextAuth routes
      jobs/route.ts       # GET (search/sort) + PATCH (Zod validated)
      jobs/fetch/route.ts # POST (rate limited, trial support)
      profiles/route.ts   # GET + POST (rate limited, Zod validated)
      profiles/[id]/route.ts  # PUT + DELETE
      billing/route.ts    # Stripe checkout + portal
      billing/webhook/route.ts  # Stripe webhooks
      export/route.ts     # POST + GET (export history)
      health/route.ts     # Health check endpoint
      cron/fetch-daily/route.ts  # Cron with structured logging + job expiry

Configuration:
  .env.example            # All required env vars documented
  next.config.js          # Security headers (CSP, HSTS, etc.)
  vercel.json             # Cron schedule (6 AM UTC daily)
  package.json            # Dependencies
  tailwind.config.ts      # Custom brand colors
  tsconfig.json           # TypeScript config
```

---

## Scaling Considerations

### 10-50 Users
- Free API tiers sufficient (~$30-50/mo infrastructure)
- In-memory rate limiting works fine

### 50-200 Users
- Supabase Pro, Vercel Pro, JSearch Pro (~$145-200/mo)
- Consider Redis for rate limiting and job caching
- Consider splitting cron into per-user invocations

### 200+ Users
- Dedicated PostgreSQL, Redis caching layer
- Queue system (Inngest/Trigger.dev) for job fetching
- Consider additional job API sources
- ~$300-500/mo infrastructure
