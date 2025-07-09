import { beforeEach, describe, expect, it } from 'bun:test'
import { InsertEmployeeSchema } from '@/zod/employee'

describe('employee', () => {
  let employeeData: any

  const shouldFail = (field: string, badValues: any[] = []) => {
    for (let i = 0; i < badValues.length; i++) {
      employeeData[field] = badValues[i]
      const result = InsertEmployeeSchema.safeParse(employeeData)

      expect(result.success).toBe(false)
    }
  }

  beforeEach(() => {
    employeeData = {
      firstName: 'Michael',
      lastName: 'Smith',
      title: 'Manager',
      departmentId: '1',
      email: 'michael.smith@example.com',
      countryCode: '1',
      phoneNumber: '1234567890',
      isActive: true,
      hireDate: '2022-01-30',
    }
  })

  it('allows create or update if input is validated successfully', () => {
    const result = InsertEmployeeSchema.safeParse(employeeData)

    expect(result.success).toBe(true)
  })

  it('validates firstName format correctly', () => {
    shouldFail('firstName', [
      null,
      '',
      'I'.repeat(101),
      ' Michael',
      'Michael ',
      ' Michael ',
      'Michael123',
      'Michael@',
      'Michael!',
    ])
  })

  it('validates lastName format correctly', () => {
    shouldFail('lastName', [
      null,
      '',
      'I'.repeat(101),
      ' Smith',
      'Smith ',
      ' Smith ',
      'Smith123',
      'Smith@',
      'Smith!',
    ])
  })

  it('validates title format correctly', () => {
    shouldFail('title', [
      null,
      '',
      'I'.repeat(101),
      ' Manager',
      'Manager ',
      ' Manager ',
      'Manager123',
      'Manager@',
      'Manager!',
    ])
  })

  it('validates departmentId correctly', () => {
    shouldFail('departmentId', [
      null,
    ])
  })

  it('validates email format correctly', () => {
    shouldFail('email', [
      null,
      '',
      'invalid-email',
      '@example.com',
      'michael@',
      'michael@examplecom',
      'michael@.com',
      'michael@example.',
    ])
  })

  it('validates countryCode format correctly', () => {
    shouldFail('countryCode', [
      null,
      '',
      '12345',
      'abc',
      '12a',
      'a12',
    ])
  })

  it('validates phoneNumber format correctly', () => {
    shouldFail('phoneNumber', [
      null,
      '',
      '123456',
      '1234567890123456',
      '123-456-7890',
      'abc1234567',
      '123456789a',
    ])
  })

  it('validates hireDate format correctly', () => {
    shouldFail('hireDate', [
      null,
      '',
      'invalid-date',
      'not-a-date',
      '2023-13-45',
      '2023-25-01',
      '2023-01-45',
      'kangaroo',
      '2023/13/01',
      '13-01-2023',
    ])
  })

  it('allows create or update without isActive field', () => {
    delete employeeData.isActive

    const result = InsertEmployeeSchema.safeParse(employeeData)

    expect(result.success).toBe(true)
  })
})
