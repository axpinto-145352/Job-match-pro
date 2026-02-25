import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CampaignType =
  | "EMAIL_DRIP"
  | "SOCIAL_POST"
  | "CONTENT_SEO"
  | "REFERRAL"
  | "PRODUCT_HUNT"
  | "RETARGETING";

export type SocialPlatform = "twitter" | "linkedin" | "reddit" | "facebook";

export interface LeadInput {
  id: string;
  email: string;
  name?: string | null;
  source: string;
  status: string;
  score?: number | null;
  notes?: string | null;
  lastContact?: Date | null;
  createdAt: Date;
}

export interface CampaignInput {
  id: string;
  name: string;
  type: CampaignType;
  content: Record<string, unknown>;
}

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  type: CampaignType;
  totalContacts: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
}

export interface LeadAnalysis {
  score: number;
  qualified: boolean;
  reasoning: string;
  suggestedAction: string;
  estimatedConversionProbability: number;
}

export interface EmailSequenceItem {
  day: number;
  subject: string;
  body: string;
  purpose: string;
}

export interface MetricsAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  suggestedABTests: string[];
}

// ---------------------------------------------------------------------------
// Product context injected into every prompt so the AI stays on-brand.
// ---------------------------------------------------------------------------

const JOBMATCH_PRO_CONTEXT = `
You are the AI marketing agent for JobMatch Pro.

About JobMatch Pro:
- JobMatch Pro is a job search SaaS that uses AI to score and rank job listings
  against a user's profile, resume, and preferences.
- Multi-source aggregation: we pull jobs from LinkedIn, Indeed, Glassdoor,
  company career pages, and more into a single unified feed.
- AI scoring: every job gets an AI-generated fit score (0-100) with a plain-
  language explanation of why it's a good or bad match.
- Smart filters: deal-breaker detection, salary range analysis, remote vs.
  on-site classification.
- Google Sheets export for power users.
- Pricing: Starter $29/mo, Pro $79/mo, Premium $199/mo (annual discounts
  available).
- Target audiences: active job seekers, passive candidates, career changers,
  recent graduates, tech professionals.

Brand voice: Confident but empathetic. We understand job searching is stressful
and our tone should feel like a knowledgeable friend who happens to be an expert
career advisor. Avoid hype; focus on concrete value.
`.trim();

// ---------------------------------------------------------------------------
// MarketingAgent
// ---------------------------------------------------------------------------

export class MarketingAgent {
  private client: Anthropic;
  private model: string;

  constructor(model = "claude-sonnet-4-20250514") {
    this.client = new Anthropic();
    this.model = model;
  }

  // -----------------------------------------------------------------------
  // Private helper: call Claude with a system + user prompt.
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
      throw new Error(`MarketingAgent AI call failed: ${message}`);
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
      // Strip potential markdown code fences
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
  // Public methods
  // -----------------------------------------------------------------------

  /**
   * Generate marketing copy for a given campaign type & target audience.
   */
  async generateCampaignContent(
    campaignType: CampaignType,
    targetAudience: string,
    context: Record<string, unknown> = {}
  ): Promise<{ subject: string; headline: string; body: string; cta: string }> {
    const system = `You are an expert SaaS marketing copywriter. Generate campaign
content that converts. Return JSON with keys: subject, headline, body, cta.`;

    const user = `Campaign type: ${campaignType}
Target audience: ${targetAudience}
Additional context: ${JSON.stringify(context)}

Generate compelling marketing copy for this campaign. The body should be 2-4
paragraphs. The CTA should be a single action-oriented sentence.`;

    return this.callClaudeJSON(system, user);
  }

  /**
   * Analyze and score a lead using AI based on their profile & engagement data.
   */
  async analyzeLead(lead: LeadInput): Promise<LeadAnalysis> {
    const system = `You are a lead-scoring expert for a B2C SaaS product. Analyze
the lead and return JSON with keys: score (0-100), qualified (boolean),
reasoning (string), suggestedAction (string),
estimatedConversionProbability (number 0-1).`;

    const user = `Analyze this lead for JobMatch Pro:
- Email: ${lead.email}
- Name: ${lead.name ?? "Unknown"}
- Source: ${lead.source}
- Current status: ${lead.status}
- Current score: ${lead.score ?? "Not scored"}
- Notes: ${lead.notes ?? "None"}
- Last contact: ${lead.lastContact?.toISOString() ?? "Never"}
- Created: ${lead.createdAt.toISOString()}

Evaluate how likely this lead is to convert to a paying subscriber. Consider
the source quality, engagement signals, and time since first touch.`;

    return this.callClaudeJSON(system, user);
  }

  /**
   * Generate a personalized outreach message for a specific lead + campaign.
   */
  async generatePersonalizedOutreach(
    lead: LeadInput,
    campaign: CampaignInput
  ): Promise<{ subject: string; body: string; tone: string }> {
    const system = `You are an expert at writing personalized 1-to-1 marketing
emails that feel human and relevant. Return JSON with keys: subject, body, tone.`;

    const user = `Generate a personalized outreach message.

Lead info:
- Name: ${lead.name ?? "there"}
- Email: ${lead.email}
- Source: ${lead.source} (how they found us)
- Status: ${lead.status}
- Score: ${lead.score ?? "unscored"}
- Notes: ${lead.notes ?? "None"}

Campaign: "${campaign.name}" (type: ${campaign.type})
Campaign content context: ${JSON.stringify(campaign.content)}

Write an email that feels personal, references how they found JobMatch Pro,
and nudges them toward the next step in the funnel. Keep it under 200 words.`;

    return this.callClaudeJSON(system, user);
  }

  /**
   * Generate a social media post tuned for a specific platform.
   */
  async generateSocialPost(
    platform: SocialPlatform,
    topic: string
  ): Promise<string> {
    const platformGuidelines: Record<SocialPlatform, string> = {
      twitter:
        "Max 280 chars per tweet. Punchy, conversational. Use 1-2 relevant hashtags.",
      linkedin:
        "Professional tone, 150-300 words. Use line breaks for readability. Start with a hook.",
      reddit:
        "Authentic, community-first tone. Never sound promotional. Add genuine value. No emojis.",
      facebook:
        "Conversational, 50-150 words. Question hooks work well. Encourage comments.",
    };

    const system = `You are a social media expert. Write a post for ${platform}.
Guidelines: ${platformGuidelines[platform]}
Return ONLY the post text, ready to publish.`;

    const user = `Write a ${platform} post about: ${topic}

The post should promote JobMatch Pro naturally without being overly salesy.
Focus on the value proposition and the pain point it solves.`;

    return this.callClaude(system, user, 1024);
  }

  /**
   * Generate a full blog post with SEO considerations.
   */
  async generateBlogPost(
    topic: string,
    keywords: string[]
  ): Promise<{
    title: string;
    metaDescription: string;
    body: string;
    slug: string;
  }> {
    const system = `You are an expert SEO content writer for a job-search SaaS blog.
Return JSON with keys: title, metaDescription (under 160 chars), body (markdown,
1500-2500 words), slug (URL-friendly).`;

    const user = `Write a comprehensive blog post.
Topic: ${topic}
Target keywords: ${keywords.join(", ")}

The article should naturally mention JobMatch Pro where relevant but primarily
provide genuine value to job seekers. Include practical tips, data points where
possible, and a clear structure with H2/H3 headings.`;

    return this.callClaudeJSON(system, user, 4096);
  }

  /**
   * Analyze campaign metrics and produce actionable optimization suggestions.
   */
  async analyzeMetrics(campaignMetrics: CampaignMetrics): Promise<MetricsAnalysis> {
    const system = `You are a data-driven marketing analyst. Analyze campaign
performance metrics and provide actionable insights. Return JSON with keys:
summary (string), strengths (string[]), weaknesses (string[]),
recommendations (string[]), suggestedABTests (string[]).`;

    const user = `Analyze these campaign metrics for JobMatch Pro:
- Campaign: "${campaignMetrics.campaignName}" (${campaignMetrics.type})
- Total contacts: ${campaignMetrics.totalContacts}
- Sent: ${campaignMetrics.sent}
- Opened: ${campaignMetrics.opened} (${(campaignMetrics.openRate * 100).toFixed(1)}%)
- Clicked: ${campaignMetrics.clicked} (${(campaignMetrics.clickRate * 100).toFixed(1)}%)
- Replied: ${campaignMetrics.replied} (${(campaignMetrics.replyRate * 100).toFixed(1)}%)

Industry benchmarks for SaaS email:
- Open rate: 20-25%
- Click rate: 2-5%
- Reply rate: 1-3%

Provide a thorough analysis with specific, actionable recommendations.`;

    return this.callClaudeJSON(system, user);
  }

  /**
   * Generate a multi-step drip email sequence for a lead segment.
   */
  async generateEmailSequence(
    segmentName: string,
    sequenceLength: number
  ): Promise<EmailSequenceItem[]> {
    const system = `You are an email marketing expert specializing in SaaS drip
campaigns. Return a JSON array of email objects with keys: day (number),
subject (string), body (string, HTML-formatted email body), purpose (string
describing the strategic goal of this email).`;

    const user = `Create a ${sequenceLength}-email drip sequence for the
"${segmentName}" segment of JobMatch Pro leads.

The sequence should gradually move leads through the funnel:
1. Welcome / value introduction
2. Education about features
3. Social proof / success stories
4. Soft CTA / free trial nudge
5. Urgency / special offer (if applicable)

Each email should build on the previous one. Use the JobMatch Pro value
propositions: AI job scoring, multi-source aggregation, time savings,
better job matches. Pricing starts at $29/mo.

Space the emails appropriately (not too aggressive).`;

    return this.callClaudeJSON(system, user, 4096);
  }
}
