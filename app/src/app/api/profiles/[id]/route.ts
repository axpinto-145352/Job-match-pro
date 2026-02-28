import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import authOptions from "@/lib/auth"
import { profileSchema } from "@/lib/validation"

// ---------------------------------------------------------------------------
// PATCH /api/profiles/[id] — Update a search profile
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

    // Verify profile belongs to user
    const existing = await prisma.searchProfile.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Validate request body (partial update)
    const body = await request.json()
    const partialSchema = profileSchema.partial()
    const parsed = partialSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updated = await prisma.searchProfile.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[API] PATCH /api/profiles/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/profiles/[id] — Delete a search profile
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string
    const { id } = await params

    // Verify profile belongs to user
    const existing = await prisma.searchProfile.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    await prisma.searchProfile.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Profile deleted" })
  } catch (error) {
    console.error("[API] DELETE /api/profiles/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
