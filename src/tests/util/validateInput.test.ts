import { beforeEach, describe, expect, it, vi } from 'vitest'
import { validateInput } from '../../util/validateInput.js'
import { getSchemaFunction } from '../../util/zodHelper.js'

vi.mock('../../util/zodHelper.js', () => ({
  getSchemaFunction: vi.fn(),
}))

describe('validateInput', () => {
  let mockContext: any
  let mockGetSchemaFunction: any
  let requestBody: any
  let mockSchema: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockContext = { req: { json: vi.fn() } }
    mockGetSchemaFunction = vi.mocked(getSchemaFunction)

    requestBody = { firstName: 'Michael', lastName: 'Smith' }
    mockSchema = { safeParse: vi.fn().mockReturnValue({ success: true }) }
  })

  it('returns success for valid input', async () => {
    mockContext.req.json.mockResolvedValue(requestBody)
    mockGetSchemaFunction.mockResolvedValue(mockSchema)

    const [messages, statusCode]
      = await validateInput(mockContext, 'employees', 'INSERT')

    expect(messages).toBeNull()
    expect(statusCode).toBe(200)
    expect(mockSchema.safeParse).toHaveBeenCalledWith(requestBody)
  })

  it('returns validation errors for invalid input', async () => {
    requestBody = { firstName: '' }
    mockSchema = {
      safeParse: vi.fn().mockReturnValue({
        success: false,
        error: { errors: [{ message: 'required' }] },
      }),
    }

    mockContext.req.json.mockResolvedValue(requestBody)
    mockGetSchemaFunction.mockResolvedValue(mockSchema)

    const [messages, statusCode]
      = await validateInput(mockContext, 'employees', 'INSERT')

    expect(messages).toContain('required')
    expect(statusCode).toBe(422)
    expect(mockSchema.safeParse).toHaveBeenCalledWith(requestBody)
  })

  it('returns error when no schema function found', async () => {
    mockContext.req.json.mockResolvedValue(requestBody)
    mockGetSchemaFunction.mockResolvedValue(null)

    const [messages, statusCode]
      = await validateInput(mockContext, 'nonexistent', 'INSERT')

    expect((messages ?? []).join()).toContain('schema function')
    expect(statusCode).toBe(400)
  })

  it('handles multiple validation errors', async () => {
    requestBody = { firstName: '', lastName: '' }
    mockSchema = {
      safeParse: vi.fn().mockReturnValue({
        success: false,
        error: {
          errors: [
            { message: 'Column A required' },
            { message: 'Column B required' },
          ],
        },
      }),
    }

    mockContext.req.json.mockResolvedValue(requestBody)
    mockGetSchemaFunction.mockResolvedValue(mockSchema)

    const [messages, statusCode]
      = await validateInput(mockContext, 'employees', 'UPDATE')

    expect((messages ?? []).join()).toContain('required')
    expect(statusCode).toBe(422)
  })
})
