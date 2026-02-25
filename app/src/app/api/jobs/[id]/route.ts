import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import prisma from "@/lib/prisma"
import authOptions from "@/lib/auth"

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const patchSchema = z.object({
  status: z
    .enum(["NEW", "SAVED", "APPLIED", "ARCHIVED"])
    .optional(),
  flagged: z.boolean().optional(),
}).refine((data) => data.status !== undefined || data.flagged !== undefined, {
  message: "At least one of 'status' or 'flagged' must be provided",
})

// ---------------------------------------------------------------------------
// PATCH /api/jobs/[id] — Update job status or flagged state
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string
    const { id } = await params

    // Validate request body
    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Verify job belongs to user
    const userJob = await prisma.userJob.findFirst({
      where: { id, userId },
    })

    if (!userJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status
    }
    if (parsed.data.flagged !== undefined) {
      updateData.flagged = parsed.data.flagged
    }

    const updated = await prisma.userJob.update({
      where: { id },
      data: updateData,
      include: { job: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[API] PATCH /api/jobs/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
