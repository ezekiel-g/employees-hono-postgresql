import { z } from 'zod'

const nameRegex = /^\p{L}(?:[\p{L}'\- ]{0,98}\p{L})?$/u
const emailRegex = /^[\w.%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const countryCodeRegex = /^\d{1,4}$/
const phoneNumberRegex = /^\d{7,15}$/

export const InsertEmployeeSchema = z.object({
  firstName: z
    .string({ required_error: 'First name required' })
    .min(1, 'First name required')
    .regex(
      nameRegex,
      'First name can be maximum 100 characters and can contain only letters, '
      + 'apostrophes, hyphens, and spaces between words',
    ),
  lastName: z
    .string({ required_error: 'Last name required' })
    .min(1, 'Last name required')
    .regex(
      nameRegex,
      'Last name can be maximum 100 characters and can contain only letters, '
      + 'apostrophes, hyphens, and spaces between words',
    ),
  title: z
    .string({ required_error: 'Job title required' })
    .min(1, 'Job title required')
    .regex(
      nameRegex,
      'Job title can be maximum 100 characters and can contain only letters, '
      + 'apostrophes, hyphens, and spaces between words',
    ),
  departmentId: z
    .string({ required_error: 'Department required' }),
  email: z
    .string({ required_error: 'Email address required' })
    .regex(emailRegex, 'Email address must have a valid format'),
  countryCode: z
    .string({ required_error: 'Country code required' })
    .regex(
      countryCodeRegex,
      'Country code must be between 1 and 4 digits and contain only digits',
    ),
  phoneNumber: z
    .string({ required_error: 'Phone number required' })
    .regex(
      phoneNumberRegex,
      'Phone number must be between 7 and 15 digits and contain only digits',
    ),
  isActive: z.boolean().optional(),
  hireDate: z
    .string({ required_error: 'Hire date required' })
    .refine(dateStr => !Number.isNaN(Date.parse(dateStr)), {
      message: 'Hire date required',
    }),
})

export const UpdateEmployeeSchema = InsertEmployeeSchema.partial()

export const EmployeeSchema = InsertEmployeeSchema.extend({
  id: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CreateEmployeeInput = z.infer<typeof InsertEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>
export type Employee = z.infer<typeof EmployeeSchema>
