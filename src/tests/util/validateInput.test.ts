import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { validateInput } from '@/util/validateInput'

const MockGetSchemaFunction = mock(() => ({}))

mock.module('@/util/zodHelper', () => ({
  getSchemaFunction: MockGetSchemaFunction,
}))

describe('validateInput', () => {
  let mockContext: any
  let requestBody: any
  let mockSchema: any

  beforeEach(() => {
    mockContext = { req: { json: mock(() => ({})) } }
    requestBody = { firstName: 'Michael', lastName: 'Smith' }
    mockSchema = { safeParse: mock(() => ({ success: true })) }
  })

  it('returns success for valid input', async () => {
    mockContext.req.json.mockReturnValue(requestBody)
    MockGetSchemaFunction.mockReturnValue(mockSchema)

    const [messages, statusCode]
      = await validateInput(mockContext, 'employees', 'INSERT')

    expect(messages).toBeNull()
    expect(statusCode).toBe(200)
    expect(mockSchema.safeParse).toHaveBeenCalledWith(requestBody)
  })

  it('returns validation errors for invalid input', async () => {
    requestBody = { firstName: '' }
    mockSchema = {
      safeParse: mock(() => ({
        success: false,
        error: { errors: [{ message: 'required' }] },
      })),
    }
    mockContext.req.json.mockReturnValue(requestBody)
    MockGetSchemaFunction.mockReturnValue(mockSchema)

    const [messages, statusCode]
      = await validateInput(mockContext, 'employees', 'INSERT')

    expect(messages).toContain('required')
    expect(statusCode).toBe(422)
    expect(mockSchema.safeParse).toHaveBeenCalledWith(requestBody)
  })

  it('returns error when no schema function found', async () => {
    mockContext.req.json.mockReturnValue(requestBody)
    MockGetSchemaFunction.mockReturnValue(null as any)

    const [messages, statusCode]
      = await validateInput(mockContext, 'nonexistent', 'INSERT')

    expect((messages ?? []).join()).toContain('schema function')
    expect(statusCode).toBe(400)
  })

  it('handles multiple validation errors', async () => {
    requestBody = { firstName: '', lastName: '' }
    mockSchema = {
      safeParse: mock(() => ({
        success: false,
        error: {
          errors: [
            { message: 'Column A required' },
            { message: 'Column B required' },
          ],
        },
      })),
    }
    mockContext.req.json.mockReturnValue(requestBody)
    MockGetSchemaFunction.mockReturnValue(mockSchema)

    const [messages, statusCode]
      = await validateInput(mockContext, 'employees', 'UPDATE')

    expect((messages ?? []).join()).toContain('required')
    expect(statusCode).toBe(422)
  })
})
