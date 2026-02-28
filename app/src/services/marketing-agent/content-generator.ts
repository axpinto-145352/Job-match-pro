import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LandingPageCopy {
  variant: string;
  headline: string;
  subheadline: string;
  heroBody: string;
  features: Array<{ title: string; description: string }>;
  socialProof: string;
  cta: string;
  ctaSubtext: string;
}

export interface ProductHuntLaunch {
  tagline: string;
  description: string;
  firstComment: string;
  topics: string[];
}

export interface RedditPost {
  title: string;
  body: string;
  subreddit: string;
}

export interface LinkedInPost {
  body: string;
  hashtags: string[];
}

export interface TwitterThread {
  tweets: string[];
}

export interface EmailTemplate {
  subject: string;
  preheader: string;
  body: string;
  cta: string;
}

export type EmailTemplateType =
  | "welcome"
  | "trial_ending"
  | "feature_announcement"
  | "churn_prevention";

export interface SEOArticle {
  title: string;
  metaDescription: string;
  slug: string;
  body: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  estimatedWordCount: number;
}

// ---------------------------------------------------------------------------
// Product context for marketing content generation
// ---------------------------------------------------------------------------

const JOBMATCH_PRO_CONTEXT = `
You are the AI content engine for JobMatch Pro.

About JobMatch Pro:
- A job search SaaS that uses AI to score and rank job listings against a
  user's profile, resume, and preferences.
- Multi-source aggregation: pulls jobs from LinkedIn, Indeed, Glassdoor,
  company career pages, and more into a single unified feed.
- AI scoring: every job gets an AI-generated fit score (0-100) with a
  plain-language explanation of why it's a good or bad match.
- Smart filters: deal-breaker detection, salary range analysis, remote vs.
  on-site classification.
- Google Sheets export for power users.
- Pricing: Starter $29/mo, Pro $79/mo, Premium $199/mo (annual discounts).
- Target audiences: active job seekers, passive candidates, career changers,
  recent graduates, tech professionals.

Brand voice: Confident but empathetic. We understand job searching is
stressful and our tone should feel like a knowledgeable friend who happens
to be an expert career advisor. Avoid hype; focus on concrete value.

Key value props:
1. Stop wasting hours scrolling through irrelevant jobs
2. AI tells you WHY a job is (or isn't) a good fit
3. One dashboard instead of 10 browser tabs
4. Never miss a great opportunity across any job board
`.trim();

// ---------------------------------------------------------------------------
// ContentGenerator
// ---------------------------------------------------------------------------

export class ContentGenerator {
  private client: Anthropic;
  private model: string;

  constructor(model = "claude-sonnet-4-20250514") {
    this.client = new Anthropic();
    this.model = model;
  }

  // -----------------------------------------------------------------------
  // Private helper
  // -----------------------------------------------------------------------

  private async callClaude(
    systemPrompt: string,
    userPrompt: string,
    maxTokens = 2048
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: `${JOBMATCH_PRO_CONTEXT}\n\n${systemPrompt}`,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text content in Claude response");
      }
      return textBlock.text;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error calling Claude";
      throw new Error(`ContentGenerator AI call failed: ${message}`);
    }
  }

  private async callClaudeJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    maxTokens = 2048
  ): Promise<T> {
    const raw = await this.callClaude(
      `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown fences, no explanation outside the JSON object.`,
      userPrompt,
      maxTokens
    );

    try {
      const cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      return JSON.parse(cleaned) as T;
    } catch {
      throw new Error(
        `Failed to parse Claude JSON response: ${raw.slice(0, 200)}`
      );
    }
  }

  // -----------------------------------------------------------------------
  // generateLandingPageCopy
  // -----------------------------------------------------------------------

  /**
   * Generate landing page copy for A/B testing. Each variant gets a
   * distinct angle while staying on-brand.
   */
  async generateLandingPageCopy(variant: string): Promise<LandingPageCopy> {
    const system = `You are a world-class SaaS landing page copywriter. Generate
high-converting landing page copy. Return JSON with keys:
variant (string), headline (string), subheadline (string), heroBody (string),
features (array of {title, description}), socialProof (string),
cta (string), ctaSubtext (string).`;

    const variantAngles: Record<string, string> = {
      A: "Focus on time savings. Lead with the pain of spending hours on job boards.",
      B: "Focus on AI intelligence. Lead with the idea that AI understands your career better than keyword search.",
      C: "Focus on comprehensiveness. Lead with never missing a job across any platform.",
      D: "Focus on career change. Lead with the anxiety of switching careers and how AI can guide you.",
    };

    const angle =
      variantAngles[variant] ??
      `Variant "${variant}": Create a unique angle that differentiates from standard job-search messaging.`;

    const user = `Generate landing page copy for variant "${variant}".

Creative angle: ${angle}

Requirements:
- Headline: max 10 words, punchy, benefit-driven
- Subheadline: 1-2 sentences expanding on the headline
- Hero body: 2-3 sentences explaining the core value
- Features: exactly 4 features with title (3-5 words) and description (1-2 sentences)
- Social proof: a realistic-sounding testimonial quote with name and title
- CTA: action-oriented button text (3-5 words)
- CTA subtext: one line below the button (e.g. "No credit card required")`;

    return this.callClaudeJSON(system, user);
  }

  // -----------------------------------------------------------------------
  // generateProductHuntLaunch
  // -----------------------------------------------------------------------

  /**
   * Generate a complete Product Hunt launch package: tagline, description,
   * first comment (the "maker comment"), and suggested topics.
   */
  async generateProductHuntLaunch(): Promise<ProductHuntLaunch> {
    const system = `You are an expert at Product Hunt launches. You know what gets
upvotes and engagement on PH. Return JSON with keys:
tagline (string, max 60 chars), description (string, 2-3 paragraphs),
firstComment (string, the maker's first comment, personal and authentic),
topics (string[], 3-5 PH topics/tags).`;

    const user = `Create a complete Product Hunt launch for JobMatch Pro.

Context on what works on PH:
- Taglines should be clever but clear -- avoid jargon
- Descriptions should lead with the problem, then the solution
- The first comment should be personal, tell the origin story, and be
  vulnerable/authentic about why you built it
- Topics should match PH's existing categories

The origin story angle: The founders were frustrated job seekers who
spent 3+ hours/day on multiple job boards, copying listings into
spreadsheets, trying to figure out which roles were actually a good fit.
They built JobMatch Pro to solve their own problem first.`;

    return this.callClaudeJSON(system, user);
  }

  // -----------------------------------------------------------------------
  // generateRedditPost
  // -----------------------------------------------------------------------

  /**
   * Generate an authentic Reddit-style post for a given subreddit. The post
   * should provide genuine value and not read like marketing.
   */
  async generateRedditPost(subreddit: string): Promise<RedditPost> {
    const system = `You are an experienced Reddit user who knows how to write posts
that get upvoted and spark genuine discussion. You understand Reddit's strong
aversion to self-promotion. Return JSON with keys: title (string),
body (string, markdown), subreddit (string).`;

    const subredditGuidelines: Record<string, string> = {
      "r/jobs": `This subreddit is for general job-seeking advice. Posts should help
people with their job search. Focus on practical tips and mention AI tools
only as one of many strategies.`,
      "r/cscareerquestions": `Tech-focused career subreddit. Readers are software
engineers and CS students. They value technical depth and are very
skeptical of marketing. Frame content around data and engineering career
advice.`,
      "r/careerguidance": `General career advice subreddit. Readers want actionable
advice for career decisions. Share frameworks for evaluating job
opportunities.`,
      "r/resumes": `Resume-focused subreddit. Content should relate to how
job-matching technology can complement a strong resume.`,
    };

    const guidelines =
      subredditGuidelines[subreddit] ??
      `Write a post appropriate for ${subreddit}. Research the subreddit's tone and rules.`;

    const user = `Write a Reddit post for ${subreddit}.

Subreddit guidelines: ${guidelines}

Critical rules:
- NEVER directly promote JobMatch Pro. This should read as a genuine
  community member sharing advice/experience.
- Provide real, actionable value that stands on its own
- Use casual Reddit tone (lowercase ok, can use "tbh", "imo", etc.)
- No emojis
- If mentioning any tool, do so naturally as one option among several
- The post should spark discussion (end with a question if natural)
- Title should be engaging but not clickbaity`;

    return this.callClaudeJSON(system, user);
  }

  // -----------------------------------------------------------------------
  // generateLinkedInPost
  // -----------------------------------------------------------------------

  /**
   * Generate a professional LinkedIn post with appropriate formatting and
   * hashtags.
   */
  async generateLinkedInPost(topic: string): Promise<LinkedInPost> {
    const system = `You are a LinkedIn content strategist who creates posts that
drive engagement without being cringe. Return JSON with keys:
body (string, the post text with line breaks), hashtags (string[]).`;

    const user = `Write a LinkedIn post about: ${topic}

LinkedIn best practices:
- Start with a compelling hook (first 2 lines are visible before "see more")
- Use short paragraphs and line breaks for readability
- 150-300 words is the sweet spot
- Include a clear point of view or insight
- End with a question or call to engage
- 3-5 relevant hashtags
- Professional but personable tone
- Can reference JobMatch Pro naturally if relevant, but the post should
  primarily provide value through insight or storytelling
- Avoid starting with "I'm excited to announce" or similar cliches`;

    return this.callClaudeJSON(system, user);
  }

  // -----------------------------------------------------------------------
  // generateTwitterThread
  // -----------------------------------------------------------------------

  /**
   * Generate a Twitter/X thread on a topic. Each tweet respects the 280-
   * character limit.
   */
  async generateTwitterThread(topic: string): Promise<TwitterThread> {
    const system = `You are a Twitter/X thread writer who creates viral, educational
threads. Return JSON with key: tweets (string[], each max 280 characters).`;

    const user = `Create a Twitter/X thread about: ${topic}

Thread best practices:
- 5-10 tweets in the thread
- Tweet 1 (hook): Make people want to read the rest. Use "Thread:" or
  a compelling statement.
- Each tweet should stand on its own but flow as a narrative
- Use short, punchy sentences
- Include 1-2 data points or surprising facts if possible
- Final tweet: summarize + soft CTA (follow, bookmark, share)
- Can mention @JobMatchPro once in the thread, but keep it natural
- Each tweet MUST be 280 characters or fewer
- Number each tweet (1/, 2/, etc.)`;

    return this.callClaudeJSON(system, user);
  }

  // -----------------------------------------------------------------------
  // generateEmailTemplate
  // -----------------------------------------------------------------------

  /**
   * Generate an email template for a specific lifecycle stage: welcome,
   * trial ending, feature announcement, or churn prevention.
   */
  async generateEmailTemplate(type: EmailTemplateType): Promise<EmailTemplate> {
    const system = `You are an email marketing expert for SaaS products. Write
emails that are personal, valuable, and drive action without being pushy.
Return JSON with keys: subject (string), preheader (string, max 100 chars),
body (string, HTML-formatted email body), cta (string, button text).`;

    const templateBriefs: Record<EmailTemplateType, string> = {
      welcome: `Write a welcome email for a new JobMatch Pro signup. Make them
feel excited about getting started. Highlight 2-3 quick wins they can
achieve today. Tone: warm, helpful, not overwhelming. Include a clear
first step (e.g. "Upload your resume to get AI-scored matches in minutes").`,

      trial_ending: `Write a trial-ending email (trial ends in 3 days). The user
has been using JobMatch Pro's free trial. Don't be desperate -- remind
them of the value they've gotten (reference hypothetical usage data).
Pricing starts at $29/mo. Emphasize what they'd lose, not what they'd
gain. Include a special offer if they upgrade now.`,

      feature_announcement: `Write a feature announcement email about a new
feature: "Smart Apply Tracker" -- users can now track their applications
directly in JobMatch Pro and get AI-powered follow-up reminders. Frame
it as solving a real pain point. Include a teaser of what's coming next.`,

      churn_prevention: `Write a churn prevention email for a user who hasn't
logged in for 2 weeks. Don't guilt-trip them. Acknowledge they might be
busy or have found a job. Offer to help re-engage with a specific
action. Include a "We'd love your feedback" angle as a soft re-engagement
tactic. Mention they can pause their subscription instead of canceling.`,
    };

    const user = `Generate a "${type}" email template.

Brief: ${templateBriefs[type]}

General email guidelines:
- Subject line: 40-60 chars, no ALL CAPS, no spam trigger words
- Preheader: complements the subject line, max 100 chars
- Body: well-structured HTML with clear hierarchy
- Use the recipient's first name where appropriate (use {{firstName}} placeholder)
- CTA button text: action-oriented, 2-5 words
- Keep total email under 300 words
- Include an unsubscribe note at the bottom`;

    return this.callClaudeJSON(system, user);
  }

  // -----------------------------------------------------------------------
  // generateSEOArticle
  // -----------------------------------------------------------------------

  /**
   * Generate a long-form SEO-optimized article targeting a specific keyword.
   */
  async generateSEOArticle(
    keyword: string,
    targetWordCount: number
  ): Promise<SEOArticle> {
    const system = `You are an expert SEO content writer specializing in career
and job search content. Write comprehensive, authoritative articles that
rank well and provide genuine value. Return JSON with keys:
title (string), metaDescription (string, max 160 chars),
slug (string, URL-friendly), body (string, full article in markdown),
targetKeyword (string), secondaryKeywords (string[]),
estimatedWordCount (number).`;

    const user = `Write an SEO-optimized article targeting the keyword: "${keyword}"

Target word count: ${targetWordCount} words (aim for +/- 10%)

SEO requirements:
- Title: include the target keyword, 50-60 chars
- Meta description: include keyword naturally, max 160 chars, compelling
- H2 and H3 structure for readability and featured snippets
- Target keyword density: 1-2% (natural usage, never forced)
- Include related/secondary keywords throughout
- Use short paragraphs (2-4 sentences)
- Include bullet points and numbered lists where appropriate
- Add a FAQ section at the end (3-5 questions targeting "People Also Ask")
- Naturally mention JobMatch Pro in 1-2 places where relevant, but the
  article should provide standalone value for job seekers
- Include actionable tips and specific advice
- Write at a 7th-8th grade reading level for accessibility
- Internal link placeholders: use [LINK: anchor text](internal) where a
  related article link would be appropriate`;

    return this.callClaudeJSON(system, user, 8192);
  }
}
