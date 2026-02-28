import prisma from "@/lib/prisma";
import { CampaignManager, CampaignSchedule } from "./campaign-manager";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScheduledCampaignInfo {
  id: string;
  name: string;
  type: string;
  status: string;
  schedule: CampaignSchedule;
  contactCount: number;
}

export interface ProcessingResult {
  campaignId: string;
  campaignName: string;
  success: boolean;
  contactsProcessed?: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// CampaignScheduler
//
// This module is designed to be invoked by an external cron job (e.g. Vercel
// Cron, a Next.js API route called by cron-job.org, or a node-cron process).
//
// Typical usage from a Next.js API route:
//
//   import { processScheduledCampaigns } from "@/services/marketing-agent/scheduler";
//
//   export async function GET(request: Request) {
//     // Verify cron secret
//     const authHeader = request.headers.get("authorization");
//     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//       return new Response("Unauthorized", { status: 401 });
//     }
//     const results = await processScheduledCampaigns();
//     return Response.json({ results });
//   }
// ---------------------------------------------------------------------------

/**
 * Retrieve all campaigns that are SCHEDULED and whose start time has arrived
 * (startAt <= now). Returns enriched info including contact counts.
 */
export async function getScheduledCampaigns(): Promise<ScheduledCampaignInfo[]> {
  const now = new Date();

  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "SCHEDULED",
    },
    include: {
      _count: {
        select: { contacts: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Filter to campaigns whose schedule says they should start now or earlier
  const dueCampaigns: ScheduledCampaignInfo[] = [];

  for (const campaign of campaigns) {
    const schedule = campaign.schedule as unknown as CampaignSchedule | null;

    if (!schedule || !schedule.startAt) {
      // No schedule attached -- skip. This shouldn't happen for SCHEDULED
      // campaigns, but we handle it defensively.
      console.warn(
        `[Scheduler] Campaign "${campaign.name}" (${campaign.id}) is SCHEDULED but has no schedule data. Skipping.`
      );
      continue;
    }

    const startAt = new Date(schedule.startAt);
    if (isNaN(startAt.getTime())) {
      console.warn(
        `[Scheduler] Campaign "${campaign.name}" (${campaign.id}) has invalid startAt: "${schedule.startAt}". Skipping.`
      );
      continue;
    }

    // Check if the campaign has passed its end date
    if (schedule.endAt) {
      const endAt = new Date(schedule.endAt);
      if (!isNaN(endAt.getTime()) && endAt < now) {
        console.info(
          `[Scheduler] Campaign "${campaign.name}" (${campaign.id}) has passed its endAt. Marking as COMPLETED.`
        );
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: "COMPLETED" },
        });
        continue;
      }
    }

    // Is it time to start?
    if (startAt <= now) {
      dueCampaigns.push({
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        schedule,
        contactCount: campaign._count.contacts,
      });
    }
  }

  console.info(
    `[Scheduler] Found ${dueCampaigns.length} campaigns due for execution ` +
      `(out of ${campaigns.length} scheduled total).`
  );

  return dueCampaigns;
}

/**
 * Process all campaigns that are due for execution. This is the main entry
 * point for the cron job. Each due campaign is executed sequentially to
 * avoid overwhelming the AI API with concurrent requests.
 *
 * Returns an array of results -- one per campaign processed -- indicating
 * success or failure.
 */
export async function processScheduledCampaigns(): Promise<ProcessingResult[]> {
  const dueCampaigns = await getScheduledCampaigns();

  if (dueCampaigns.length === 0) {
    console.info("[Scheduler] No campaigns due for execution.");
    return [];
  }

  const manager = new CampaignManager();
  const results: ProcessingResult[] = [];

  for (const campaignInfo of dueCampaigns) {
    console.info(
      `[Scheduler] Executing campaign "${campaignInfo.name}" (${campaignInfo.id}) ` +
        `with ${campaignInfo.contactCount} contacts...`
    );

    try {
      const executionResult = await manager.executeCampaign(campaignInfo.id);

      const successCount = executionResult.results.filter(
        (r) => r.success
      ).length;

      results.push({
        campaignId: campaignInfo.id,
        campaignName: campaignInfo.name,
        success: true,
        contactsProcessed: successCount,
      });

      console.info(
        `[Scheduler] Campaign "${campaignInfo.name}" executed successfully: ` +
          `${successCount}/${executionResult.results.length} contacts processed.`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      results.push({
        campaignId: campaignInfo.id,
        campaignName: campaignInfo.name,
        success: false,
        error: message,
      });

      console.error(
        `[Scheduler] Campaign "${campaignInfo.name}" failed: ${message}`
      );
    }
  }

  // Log summary
  const successfulCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;
  const totalContacts = results.reduce(
    (sum, r) => sum + (r.contactsProcessed ?? 0),
    0
  );

  console.info(
    `[Scheduler] Processing complete. ` +
      `${successfulCount} campaigns succeeded, ${failedCount} failed, ` +
      `${totalContacts} total contacts processed.`
  );

  return results;
}
