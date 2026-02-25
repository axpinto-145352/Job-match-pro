import prisma from './prisma'
import { Prisma } from '@/generated/prisma'

/**
 * Supported audit actions within the application.
 */
export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE'

/**
 * Writes an entry to the AuditLog table for compliance and debugging purposes.
 *
 * @param userId - The ID of the user performing the action
 * @param action - The type of action being performed
 * @param resource - The resource being acted upon (e.g. "Profile", "Job", "Subscription")
 * @param details - Optional additional details or metadata about the action
 * @param ip - Optional IP address of the request origin
 * @returns The created audit log record
 */
export async function logAudit(
  userId: string,
  action: AuditAction,
  resource: string,
  details?: Record<string, unknown> | null,
  ip?: string
) {
  try {
    const auditEntry = await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        details: details as unknown as Prisma.InputJsonValue ?? Prisma.JsonNull,
        ip: ip ?? null,
      },
    })

    return auditEntry
  } catch (error) {
    // Audit logging should never break the main application flow.
    // Log the failure to stderr so it can be picked up by monitoring.
    console.error('[AUDIT] Failed to write audit log entry:', {
      userId,
      action,
      resource,
      error: error instanceof Error ? error.message : error,
    })
    return null
  }
}

export default logAudit
