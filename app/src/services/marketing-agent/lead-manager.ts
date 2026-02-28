import prisma from "@/lib/prisma";
import { MarketingAgent } from "./agent";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "ENGAGED"
  | "QUALIFIED"
  | "CONVERTED"
  | "CHURNED";

export interface LeadTimelineEntry {
  type: "created" | "status_change" | "score_update" | "note" | "campaign_sent" | "campaign_opened" | "campaign_clicked" | "campaign_replied";
  timestamp: Date;
  details: string;
}

// ---------------------------------------------------------------------------
// Pipeline stage progression order
// ---------------------------------------------------------------------------

const PIPELINE_ORDER: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "ENGAGED",
  "QUALIFIED",
  "CONVERTED",
];

// ---------------------------------------------------------------------------
// LeadManager
// ---------------------------------------------------------------------------

export class LeadManager {
  private agent: MarketingAgent;

  constructor() {
    this.agent = new MarketingAgent();
  }

  // -------------------------------------------------------------------------
  // captureLead
  // -------------------------------------------------------------------------

  /**
   * Capture a new lead into the database. If a lead with the same email
   * already exists, the existing record is returned instead.
   */
  async captureLead(email: string, name: string | null, source: string) {
    try {
      // Check for existing lead by email
      const existing = await prisma.lead.findUnique({
        where: { email },
      });

      if (existing) {
        console.info(
          `[LeadManager] Lead with email "${email}" already exists (${existing.id}). Returning existing record.`
        );
        return existing;
      }

      const lead = await prisma.lead.create({
        data: {
          email,
          name,
          source,
          status: "NEW",
        },
      });

      console.info(
        `[LeadManager] Captured new lead "${name ?? email}" from "${source}" (${lead.id})`
      );
      return lead;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to capture lead "${email}": ${message}`);
    }
  }

  // -------------------------------------------------------------------------
  // scoreLead
  // -------------------------------------------------------------------------

  /**
   * Use the AI marketing agent to analyze a lead and assign a score (0-100).
   * The score, qualification status, and reasoning are saved to the lead's
   * record.
   */
  async scoreLead(leadId: string) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        campaignContacts: {
          include: { campaign: true },
        },
      },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    // Build engagement context for the AI
    const campaignHistory = lead.campaignContacts
      .map((cc) => {
        const actions: string[] = [];
        if (cc.sentAt) actions.push("sent");
        if (cc.openedAt) actions.push("opened");
        if (cc.clickedAt) actions.push("clicked");
        if (cc.repliedAt) actions.push("replied");
        return `Campaign "${cc.campaign.name}": ${actions.join(", ") || "pending"}`;
      })
      .join("; ");

    const enrichedNotes = [
      lead.notes ?? "",
      campaignHistory ? `Campaign engagement: ${campaignHistory}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const analysis = await this.agent.analyzeLead({
      id: lead.id,
      email: lead.email,
      name: lead.name,
      source: lead.source,
      status: lead.status,
      score: lead.score,
      notes: enrichedNotes || null,
      lastContact: lead.lastContact,
      createdAt: lead.createdAt,
    });

    // Persist the AI-generated score and notes
    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: {
        score: analysis.score,
        notes: [
          lead.notes ?? "",
          `[AI Score ${new Date().toISOString()}] Score: ${analysis.score}/100. ` +
            `Qualified: ${analysis.qualified}. ` +
            `Reasoning: ${analysis.reasoning}. ` +
            `Suggested action: ${analysis.suggestedAction}. ` +
            `Est. conversion probability: ${(analysis.estimatedConversionProbability * 100).toFixed(0)}%.`,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    });

    console.info(
      `[LeadManager] Scored lead "${lead.name ?? lead.email}": ${analysis.score}/100 ` +
        `(qualified: ${analysis.qualified})`
    );

    return { lead: updated, analysis };
  }

  // -------------------------------------------------------------------------
  // qualifyLead
  // -------------------------------------------------------------------------

  /**
   * Move a lead forward in the pipeline. The lead advances one stage in the
   * predefined pipeline order: NEW -> CONTACTED -> ENGAGED -> QUALIFIED -> CONVERTED.
   *
   * If the lead is already QUALIFIED or CONVERTED, no change is made.
   * Leads in CHURNED status are also left unchanged.
   */
  async qualifyLead(leadId: string) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    if (lead.status === "CHURNED") {
      console.warn(
        `[LeadManager] Lead ${leadId} is CHURNED and cannot be qualified.`
      );
      return lead;
    }

    const currentIndex = PIPELINE_ORDER.indexOf(lead.status);

    if (currentIndex === -1 || currentIndex >= PIPELINE_ORDER.length - 1) {
      // Already at CONVERTED or in an unexpected state
      console.info(
        `[LeadManager] Lead ${leadId} is already at "${lead.status}" -- no further qualification.`
      );
      return lead;
    }

    const nextStatus = PIPELINE_ORDER[currentIndex + 1];

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: nextStatus,
        notes: [
          lead.notes ?? "",
          `[Pipeline ${new Date().toISOString()}] Advanced from ${lead.status} to ${nextStatus}.`,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    });

    console.info(
      `[LeadManager] Qualified lead "${lead.name ?? lead.email}": ${lead.status} -> ${nextStatus}`
    );

    return updated;
  }

  // -------------------------------------------------------------------------
  // getLeadsByStatus
  // -------------------------------------------------------------------------

  /**
   * Retrieve all leads at a specific pipeline stage, ordered by most
   * recently updated first.
   */
  async getLeadsByStatus(status: LeadStatus) {
    const leads = await prisma.lead.findMany({
      where: { status },
      orderBy: { updatedAt: "desc" },
    });

    console.info(
      `[LeadManager] Found ${leads.length} leads with status "${status}"`
    );
    return leads;
  }

  // -------------------------------------------------------------------------
  // getReadyLeads
  // -------------------------------------------------------------------------

  /**
   * Return leads that are QUALIFIED and ready for human handoff. These are
   * high-intent leads that have been scored and moved through the pipeline
   * by the AI agent and now warrant direct human attention (e.g. a sales
   * call or demo booking).
   */
  async getReadyLeads() {
    const leads = await prisma.lead.findMany({
      where: {
        status: "QUALIFIED",
        score: { gte: 50 }, // Only leads the AI considers reasonably likely to convert
      },
      orderBy: { score: "desc" },
    });

    console.info(
      `[LeadManager] Found ${leads.length} qualified leads ready for human handoff`
    );
    return leads;
  }

  // -------------------------------------------------------------------------
  // updateLeadNotes
  // -------------------------------------------------------------------------

  /**
   * Append notes to a lead's record. New notes are appended with a
   * timestamp so the full history is preserved.
   */
  async updateLeadNotes(leadId: string, notes: string) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const timestampedNote = `[Note ${new Date().toISOString()}] ${notes}`;
    const updatedNotes = [lead.notes ?? "", timestampedNote]
      .filter(Boolean)
      .join("\n");

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { notes: updatedNotes },
    });

    console.info(
      `[LeadManager] Updated notes for lead "${lead.name ?? lead.email}"`
    );
    return updated;
  }

  // -------------------------------------------------------------------------
  // getLeadTimeline
  // -------------------------------------------------------------------------

  /**
   * Build a complete interaction timeline for a lead, combining data from
   * the lead record itself and all associated campaign contacts.
   */
  async getLeadTimeline(leadId: string): Promise<LeadTimelineEntry[]> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        campaignContacts: {
          include: { campaign: true },
        },
      },
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const timeline: LeadTimelineEntry[] = [];

    // Lead creation
    timeline.push({
      type: "created",
      timestamp: lead.createdAt,
      details: `Lead captured from "${lead.source}" (email: ${lead.email})`,
    });

    // Parse notes for historical entries
    if (lead.notes) {
      const noteLines = lead.notes.split("\n").filter(Boolean);
      for (const line of noteLines) {
        // Extract timestamp from bracketed notes like [AI Score 2024-01-01T00:00:00.000Z]
        const timestampMatch = line.match(
          /\[(AI Score|Pipeline|Note)\s+(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\]/
        );
        const timestamp = timestampMatch
          ? new Date(timestampMatch[2])
          : lead.updatedAt;

        if (line.includes("[AI Score")) {
          timeline.push({
            type: "score_update",
            timestamp,
            details: line,
          });
        } else if (line.includes("[Pipeline")) {
          timeline.push({
            type: "status_change",
            timestamp,
            details: line,
          });
        } else if (line.includes("[Note")) {
          timeline.push({
            type: "note",
            timestamp,
            details: line,
          });
        }
      }
    }

    // Campaign interaction events
    for (const cc of lead.campaignContacts) {
      const campaignName = cc.campaign.name;

      if (cc.sentAt) {
        timeline.push({
          type: "campaign_sent",
          timestamp: cc.sentAt,
          details: `Outreach sent via campaign "${campaignName}"`,
        });
      }

      if (cc.openedAt) {
        timeline.push({
          type: "campaign_opened",
          timestamp: cc.openedAt,
          details: `Opened email from campaign "${campaignName}"`,
        });
      }

      if (cc.clickedAt) {
        timeline.push({
          type: "campaign_clicked",
          timestamp: cc.clickedAt,
          details: `Clicked link in campaign "${campaignName}"`,
        });
      }

      if (cc.repliedAt) {
        timeline.push({
          type: "campaign_replied",
          timestamp: cc.repliedAt,
          details: `Replied to campaign "${campaignName}"`,
        });
      }
    }

    // Sort chronologically (oldest first)
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    console.info(
      `[LeadManager] Built timeline for lead "${lead.name ?? lead.email}": ${timeline.length} entries`
    );

    return timeline;
  }
}
