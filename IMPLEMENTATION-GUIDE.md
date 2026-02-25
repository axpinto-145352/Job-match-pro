# JobMatch Pro — Implementation, Marketing & Monetization Guide

## Table of Contents

1. [Build Phase](#1-build-phase)
2. [Pre-Launch Checklist](#2-pre-launch-checklist)
3. [Launch Strategy](#3-launch-strategy)
4. [Marketing Playbook](#4-marketing-playbook)
5. [Monetization Strategy](#5-monetization-strategy)
6. [Growth & Scaling](#6-growth--scaling)
7. [Operational Runbook](#7-operational-runbook)
8. [Financial Projections](#8-financial-projections)

---

## 1. Build Phase

### Phase 1: Foundation (Week 1-2)

#### Step 1: Environment Setup
```bash
# Clone and install
git clone <repo-url>
cd job-search-saas
npm install

# Generate Prisma client
npx prisma generate
```

#### Step 2: Database Setup
1. Create a Supabase project at supabase.com (free tier)
2. Copy the PostgreSQL connection string
3. Create `.env.local` from `.env.example`
4. Run database schema push:
```bash
npx prisma db push
```

#### Step 3: Authentication Setup
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`
5. Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`

#### Step 4: AI Setup
1. Create an Anthropic API account at console.anthropic.com
2. Generate an API key
3. Add `ANTHROPIC_API_KEY` to `.env.local`
4. Set `AI_SCORING_MODEL` (optional, defaults to `claude-haiku-4-20250414`)

#### Step 5: Job API Keys
1. **JSearch** (required): Sign up at rapidapi.com, subscribe to JSearch API
2. **Adzuna** (optional): Get app_id and app_key at developer.adzuna.com
3. **The Muse** (optional): Free, no key needed
4. **RemoteOK** (optional): Free JSON endpoint, no key needed

#### Step 6: Stripe Setup
1. Create Stripe account at stripe.com
2. Create a product: "JobMatch Pro" at $50/month
3. Copy the Price ID → `STRIPE_PRICE_ID`
4. Get API keys → `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Set up webhook endpoint: `https://yourdomain.com/api/billing/webhook`
6. Listen for events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
7. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

#### Step 7: Local Development
```bash
npm run dev
# Visit http://localhost:3000
```

### Phase 2: Security Hardening (Week 2-3)

All security measures are already implemented in the codebase:

- **Rate limiting**: In-memory sliding window (60/min reads, 10/min mutations)
- **Input sanitization**: Prompt injection defense in `src/lib/sanitize.ts`
- **PII scrubbing**: Email, phone, SSN patterns removed before AI calls
- **Encryption**: AES-256-GCM for Google refresh tokens via `src/lib/encryption.ts`
- **Security headers**: CSP, HSTS, X-Frame-Options in `next.config.js`
- **AI output validation**: Score clamping (0-100), array limits, string truncation
- **Environment validation**: Zod schema validates all env vars at startup

**Generate encryption key:**
```bash
openssl rand -hex 32
# Add as ENCRYPTION_KEY in .env
```

### Phase 3: Testing (Week 3-4)

#### Manual Testing Checklist
- [ ] Sign in with Google OAuth
- [ ] Create search profile with all fields
- [ ] Fetch jobs (verify all 4 sources work)
- [ ] Verify AI scoring returns valid scores
- [ ] Check job card displays all data correctly
- [ ] Test status changes (new → saved → applied)
- [ ] Test Google Sheets export
- [ ] Test Stripe checkout flow
- [ ] Test subscription verification
- [ ] Test free trial flow (7-day window)
- [ ] Verify rate limiting (hit endpoints rapidly)
- [ ] Test with very long resume text
- [ ] Test with special characters in keywords
- [ ] Verify GDPR data export downloads JSON
- [ ] Verify GDPR data deletion works
- [ ] Test mobile responsive on iOS/Android

### Phase 4: Deployment (Week 4)

#### Deploy to Vercel
1. Connect GitHub repo to Vercel
2. Add all environment variables in Vercel dashboard
3. Set Node.js version to 18+
4. Deploy
5. Set custom domain

#### Post-Deploy Verification
- [ ] Landing page loads correctly
- [ ] Google OAuth redirects work
- [ ] Health endpoint returns 200: `GET /api/health`
- [ ] Stripe webhook receives events (check Stripe dashboard)
- [ ] Cron job fires at 6 AM UTC (check Vercel logs)
- [ ] Security headers present (check securityheaders.com)

---

## 2. Pre-Launch Checklist

### Critical (Must-do)
- [ ] Terms of Service page live at `/terms`
- [ ] Privacy Policy page live at `/privacy`
- [ ] AI disclosure visible on landing page and in job feed
- [ ] Stripe checkout working in live mode
- [ ] At least 1 job API source returning results
- [ ] Google OAuth working with production redirect URI
- [ ] CRON_SECRET set for daily fetch endpoint
- [ ] Error logging working (check Vercel logs)

### Recommended
- [ ] Set up Stripe tax collection for your state
- [ ] Google OAuth consent screen approved (if >100 users)
- [ ] Custom domain with HTTPS
- [ ] Set up Vercel analytics for traffic monitoring
- [ ] Create a support email (support@yourdomain.com)

---

## 3. Launch Strategy

### Pre-Launch (2 Weeks Before)

1. **Beta testing**: Recruit 3-5 job seekers for beta
   - Offer 30-day free access in exchange for feedback
   - Track: time to first job fetch, score accuracy, export usage
   - Collect testimonials for marketing

2. **Landing page optimization**:
   - Ensure CTA is above the fold
   - Test page load speed (<3s)
   - Verify mobile responsiveness

### Launch Day

1. **Soft launch**: Share with personal network
   - LinkedIn post about the product
   - Direct message to 20-30 job seekers
   - Post in relevant Slack/Discord communities

2. **Content marketing**: Publish launch blog post
   - "Why I Built an AI Job Search Assistant"
   - Share the problem (manual job board scrolling)
   - Show the solution (AI-scored jobs from 7+ sources)

### Post-Launch (Week 1-4)

1. Monitor daily:
   - New sign-ups
   - Trial-to-paid conversion rate
   - Job fetch success rate
   - AI scoring accuracy (via flag button)
   - Customer support requests

2. Quick wins based on feedback:
   - Fix any UX friction points
   - Add missing job sources if requested
   - Tune AI scoring prompt based on flags

---

## 4. Marketing Playbook

### Channel 1: LinkedIn (Primary)

**Why**: Job seekers actively use LinkedIn. Direct overlap with target audience.

**Strategy**:
- Post 3x/week about job search tips
- Share product updates and features
- Engage with job search content creators
- Run LinkedIn ads targeting "currently looking for work"

**Content pillars**:
1. Job search productivity tips
2. AI in hiring/job search
3. Product updates and features
4. User success stories

**Example posts**:
- "I stopped scrolling 5 job boards every morning. Here's what I do instead."
- "AI scored 100 jobs for me while I slept. Here's what it found."
- "The job search hack nobody talks about: let AI read job descriptions for you."

### Channel 2: Reddit

**Target subreddits**:
- r/jobs (3M+ members)
- r/jobsearch
- r/careerguidance
- r/cscareerquestions
- r/remotework
- r/resumes

**Strategy**: Provide genuine value first, mention product naturally.
- Answer job search questions
- Share tips from your data (anonymized)
- Post product launch as "Show and tell" in relevant communities

### Channel 3: SEO / Content Marketing

**Target keywords**:
- "AI job search tool"
- "job board aggregator"
- "automated job search"
- "AI job matching"
- "best job search tools 2026"
- "how to automate job search"

**Blog posts**:
1. "The Complete Guide to AI-Powered Job Searching"
2. "How to Score Your Job Matches Using AI"
3. "Job Board Aggregators vs. Manual Search: A Data Comparison"
4. "Why Job Descriptions Lie (And How AI Can Help)"

### Channel 4: Product Hunt

**Strategy**:
- Prepare assets: logo, screenshots, demo video
- Write compelling tagline and description
- Schedule launch for a Tuesday or Wednesday
- Activate network for upvotes on launch day
- Target "Product of the Day" badge

### Channel 5: Partnerships

**Potential partners**:
- Resume writing services (mutual referrals)
- Career coaches (affiliate or integration)
- Bootcamps (offer to graduates)
- Veteran employment services (aligned with VV brand)

### Paid Advertising (After PMF)

**Google Ads**:
- Target: "AI job search", "automated job search", "job matching tool"
- Budget: Start at $10-20/day
- Optimize for trial sign-ups

**LinkedIn Ads**:
- Target: Job seekers, career changers, recently laid off
- Format: Sponsored content (short demo video)
- Budget: Start at $20-30/day

### Email Marketing

**Sequences**:
1. **Welcome** (Day 0): Account created, here's how to get started
2. **Onboarding** (Day 1): Create your first profile, paste your resume
3. **First results** (Day 2): Your first AI-scored jobs are ready
4. **Value reminder** (Day 4): You've matched X jobs, here are your top scores
5. **Upgrade nudge** (Day 6): Trial ending tomorrow, here's what you'll miss
6. **Post-trial** (Day 8): 50% off first month if you subscribe today

---

## 5. Monetization Strategy

### Current Model: $50/month SaaS

| Metric | Value |
|--------|-------|
| Price | $50/month |
| Variable cost per user | $3-8/month |
| Gross margin | 84-94% |
| Break-even | 1 user |

### Pricing Tiers (Future)

#### Free Tier (Lead Generation)
- 10 jobs/day, 1 profile
- No AI scoring (just aggregation)
- No export
- **Goal**: Drive trial sign-ups

#### Pro ($50/month) — Current
- 100 jobs/day, 5 profiles
- Full AI scoring with Claude
- Google Sheets export
- Daily auto-fetch
- GDPR data controls

#### Premium ($99/month) — Future
- 250 jobs/day, 10 profiles
- Premium AI scoring (Claude Sonnet)
- Email digest for high-score matches
- Priority API access
- Slack/webhook notifications
- Resume optimization suggestions
- API access

#### Enterprise ($199/month) — Future
- Unlimited jobs, unlimited profiles
- Team features (shared profiles)
- Custom job sources
- Dedicated support
- Custom AI model tuning

### Revenue Projections

| Month | Users | MRR | Monthly Cost | Profit |
|-------|-------|-----|-------------|--------|
| 1 | 5 | $250 | $65 | $185 |
| 3 | 20 | $1,000 | $185 | $815 |
| 6 | 50 | $2,500 | $425 | $2,075 |
| 12 | 100 | $5,000 | $800 | $4,200 |
| 18 | 200 | $10,000 | $1,400 | $8,600 |
| 24 | 500 | $25,000 | $3,200 | $21,800 |

### Additional Revenue Streams

1. **Affiliate revenue**: Partner with resume services, career coaches. Earn $5-20 per referral.
2. **Data insights**: Aggregate anonymized job market data for reports (salary trends, demand by role).
3. **White-label**: License the platform to career services, bootcamps, staffing agencies.
4. **Premium job placements**: Allow employers to boost visibility in user feeds (carefully, maintaining trust).

---

## 6. Growth & Scaling

### Technical Scaling Path

| Users | Infrastructure | Monthly Cost |
|-------|---------------|-------------|
| 1-50 | Vercel free/hobby, Supabase free | $0-30 |
| 50-200 | Vercel Pro, Supabase Pro, JSearch Pro | $145-200 |
| 200-500 | + Redis caching, background jobs (Inngest) | $300-500 |
| 500+ | Dedicated PostgreSQL, queue system, CDN | $500-1,000 |

### Key Scaling Milestones

**50 users**: Upgrade from free API tiers. Monitor job API quotas.

**100 users**: Implement Redis for rate limiting and job caching. Add background job processing for cron.

**200 users**: Split cron into per-user invocations. Add job deduplication cache.

**500+ users**: Consider additional job API sources. Implement fuzzy deduplication. Add CDN for static assets.

### Feature Roadmap

**Quarter 1 (Post-Launch)**:
- Email digest for high-score matches
- Chrome extension for one-click save from job boards
- Resume optimization suggestions
- Improved onboarding flow

**Quarter 2**:
- Slack/Discord notifications
- Team features (shared profiles)
- Interview preparation tips based on job requirements
- Salary negotiation insights from market data

**Quarter 3**:
- Mobile app (React Native)
- Browser extension for auto-apply
- Integration with ATS systems
- Advanced analytics and reporting

**Quarter 4**:
- Enterprise tier with team management
- API for third-party integrations
- White-label offering
- International expansion (multi-language support)

---

## 7. Operational Runbook

### Daily Operations
- Check Vercel logs for errors
- Monitor cron job success (6 AM UTC)
- Review Stripe dashboard for failed payments
- Check API quota usage (JSearch, Claude)

### Weekly Operations
- Review user growth metrics
- Check AI scoring accuracy (review flagged scores)
- Monitor variable costs vs. revenue
- Respond to support requests

### Monthly Operations
- Review and optimize AI scoring prompt
- Check job source API changes/deprecations
- Review and update Terms of Service if needed
- Reconcile Stripe revenue with bank deposits
- Review analytics for product insights

### Incident Response

**Job fetch failures**:
1. Check health endpoint: `GET /api/health`
2. Verify API keys are valid
3. Check individual source availability
4. Review Vercel function logs

**AI scoring failures**:
1. Check Anthropic API status
2. Verify API key and billing
3. Check for prompt injection attempts in logs
4. Fallback: jobs still display, just without scores

**Stripe webhook failures**:
1. Check Stripe webhook logs
2. Verify webhook secret matches
3. Check Vercel function logs for errors
4. Manual recovery: update user subscription status in database

### Monitoring Checklist

| What | How | Frequency |
|------|-----|-----------|
| API health | `GET /api/health` | Every 5 min (via UptimeRobot) |
| Cron success | Vercel logs | Daily |
| Error rate | Vercel analytics | Daily |
| API costs | Anthropic dashboard | Weekly |
| Job source quotas | API dashboards | Weekly |
| User growth | Database query | Weekly |
| Revenue | Stripe dashboard | Weekly |

---

## 8. Financial Projections

### Year 1 P&L (Conservative)

| Month | Users | Revenue | Variable Cost | Fixed Cost | Net |
|-------|-------|---------|--------------|------------|-----|
| 1 | 3 | $150 | $24 | $0 | $126 |
| 2 | 8 | $400 | $56 | $0 | $344 |
| 3 | 15 | $750 | $105 | $0 | $645 |
| 4 | 22 | $1,100 | $154 | $30 | $916 |
| 5 | 30 | $1,500 | $210 | $30 | $1,260 |
| 6 | 40 | $2,000 | $280 | $30 | $1,690 |
| 7 | 50 | $2,500 | $350 | $145 | $2,005 |
| 8 | 60 | $3,000 | $420 | $145 | $2,435 |
| 9 | 72 | $3,600 | $504 | $145 | $2,951 |
| 10 | 85 | $4,250 | $595 | $145 | $3,510 |
| 11 | 95 | $4,750 | $665 | $145 | $3,940 |
| 12 | 100 | $5,000 | $700 | $200 | $4,100 |
| **Total** | | **$29,000** | **$4,063** | **$1,015** | **$23,922** |

### Key Assumptions
- 5% monthly churn rate
- 15% trial-to-paid conversion rate
- $7 average variable cost per user
- Fixed costs: infrastructure only (no marketing spend)
- No paid advertising in Year 1

### Break-Even Analysis
- **Per-user break-even**: $8/month cost, $50/month revenue → profitable from user 1
- **Monthly break-even**: 1 paying user covers all variable costs
- **Infrastructure break-even**: 3-4 users covers Vercel/Supabase pro tiers

### Unit Economics

| Metric | Value |
|--------|-------|
| Customer Acquisition Cost (organic) | $0-5 |
| Customer Lifetime Value (12 months, 5% churn) | $416 |
| LTV:CAC Ratio | 83:1 (organic) |
| Payback Period | <1 month |
| Gross Margin | 84-94% |
| Net Margin (excl. labor) | 75-85% |

---

## Quick Reference: Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<openssl rand -base64 32>
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
ANTHROPIC_API_KEY=
AI_SCORING_MODEL=claude-haiku-4-20250414

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Job APIs
JSEARCH_API_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=

# Security
CRON_SECRET=<openssl rand -hex 16>
ENCRYPTION_KEY=<openssl rand -hex 32>
```
