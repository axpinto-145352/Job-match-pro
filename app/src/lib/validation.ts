import { z } from 'zod'

/**
 * Schema for user profile creation and updates.
 */
export const profileSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),

  keywords: z
    .array(z.string().min(1, 'Keyword cannot be empty'))
    .max(10, 'You can have at most 10 keywords'),

  locations: z
    .array(z.string().min(1, 'Location cannot be empty'))
    .max(5, 'You can have at most 5 locations'),

  dealBreakers: z
    .array(z.string().min(1, 'Deal breaker cannot be empty'))
    .max(10, 'You can have at most 10 deal breakers'),

  resumeText: z
    .string()
    .max(5000, 'Resume text must be at most 5000 characters')
    .optional(),

  minSalary: z
    .number()
    .int('Salary must be a whole number')
    .min(0, 'Minimum salary cannot be negative')
    .optional(),

  maxSalary: z
    .number()
    .int('Salary must be a whole number')
    .min(0, 'Maximum salary cannot be negative')
    .optional(),

  remote: z.boolean(),
}).refine(
  (data) => {
    if (data.minSalary !== undefined && data.maxSalary !== undefined) {
      return data.maxSalary >= data.minSalary
    }
    return true
  },
  {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['maxSalary'],
  }
)

export type ProfileInput = z.infer<typeof profileSchema>

/**
 * Schema for updating a job's status.
 */
export const jobStatusSchema = z.object({
  status: z.enum(['NEW', 'SAVED', 'APPLIED', 'ARCHIVED']),
})

export type JobStatusInput = z.infer<typeof jobStatusSchema>

/**
 * Schema for Google Sheets export configuration.
 */
export const exportSchema = z.object({
  spreadsheetId: z
    .string()
    .min(1, 'Spreadsheet ID is required'),

  sheetName: z
    .string()
    .min(1, 'Sheet name is required'),
})

export type ExportInput = z.infer<typeof exportSchema>
