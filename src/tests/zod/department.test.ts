import { beforeEach, describe, expect, it } from 'bun:test'
import { InsertDepartmentSchema } from '@/zod/department'

describe('department', () => {
  let departmentData: any

  const shouldFail = (field: string, badValues: any[] = []) => {
    for (let i = 0; i < badValues.length; i++) {
      departmentData[field] = badValues[i]
      const result = InsertDepartmentSchema.safeParse(departmentData)

      expect(result.success).toBe(false)
    }
  }

  beforeEach(() => {
    departmentData = {
      name: 'IT Department',
      code: 'IT1',
      location: 'New York',
      isActive: true,
    }
  })

  it('allows create or update if input is validated successfully', () => {
    const result = InsertDepartmentSchema.safeParse(departmentData)

    expect(result.success).toBe(true)
  })

  it('validates name format correctly', () => {
    shouldFail('name', [
      null,
      '',
      'I'.repeat(101),
      ' IT',
      'IT ',
      ' IT ',
      'IT&',
      '}',
      'IT-Department!',
    ])
  })

  it('validates code format correctly', () => {
    shouldFail('code', [
      null,
      '',
      'I'.repeat(21),
      ' IT',
      'IT ',
      'it',
      'iT1',
      '1IT',
      'IT@',
      'IT-1',
      'IT_1',
    ])
  })

  it('validates location correctly', () => {
    shouldFail('location', [
      null,
      '',
      'Ur',
      'new york',
      'Chicago',
    ])
  })

  it('allows create or update without is_active field', () => {
    delete departmentData.isActive

    const result = InsertDepartmentSchema.safeParse(departmentData)

    expect(result.success).toBe(true)
  })
})
