import { z } from 'zod'

export const InsertDepartmentSchema = z.object({
  name: z
    .string({ required_error: 'Name required' })
    .min(1, 'Name required')
    .regex(
      /^[A-Z0-9][A-Z0-9 \-'",.]{0,98}[A-Z0-9]$/i,
      'Name can be maximum 100 characters and can contain only letters, '
      + 'numbers, spaces, hyphens, apostrophes and periods',
    ),
  code: z
    .string({ required_error: 'Code required' })
    .min(1, 'Code required')
    .regex(
      /^[A-Z][A-Z0-9]{0,19}$/,
      'Code can be maximum 20 characters and can contain only numbers and '
      + 'capital letters',
    ),
  location: z.enum(['New York', 'San Francisco', 'London'], {
    errorMap: () => ({ message: 'Location not currently valid' }),
  }),
  is_active: z.boolean().optional(),
})

export const UpdateDepartmentSchema = InsertDepartmentSchema.partial()

export const DepartmentSchema = InsertDepartmentSchema.extend({
  id: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type CreateDepartmentInput = z.infer<typeof InsertDepartmentSchema>
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>
export type Department = z.infer<typeof DepartmentSchema>
