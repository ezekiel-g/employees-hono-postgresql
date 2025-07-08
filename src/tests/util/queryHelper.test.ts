import { beforeEach, describe, expect, it, vi } from 'vitest'
import { formatInsert, formatUpdate } from '../../util/queryHelper.js'

describe('queryHelper', () => {
  let mockContext: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockContext = { req: { json: vi.fn(), param: vi.fn() } }
  })

  describe('formatInsert', () => {
    it('formats insert query with camel case input', async () => {
      const camelCaseData = { firstName: 'Michael', lastName: 'Smith', age: 30 }
      mockContext.req.json.mockResolvedValue(camelCaseData)

      const [columnNames, queryParams, placeholders]
        = await formatInsert(mockContext)

      expect(columnNames).toEqual(['first_name', 'last_name', 'age'])
      expect(queryParams).toEqual(['Michael', 'Smith', 30])
      expect(placeholders).toBe('$1, $2, $3')
    })

    it('returns empty values for empty input', async () => {
      mockContext.req.json.mockResolvedValue({})

      const [columnNames, queryParams, placeholders]
        = await formatInsert(mockContext)

      expect(columnNames).toEqual([])
      expect(queryParams).toEqual([])
      expect(placeholders).toBe('')
    })
  })

  describe('formatUpdate', () => {
    it('formats update query excluding id field', async () => {
      const camelCaseData = { id: 1, firstName: 'Michael', lastName: 'Smith' }
      mockContext.req.json.mockResolvedValue(camelCaseData)
      mockContext.req.param.mockReturnValue('1')

      const [columnNames, setClause, queryParams]
        = await formatUpdate(mockContext)

      expect(columnNames).toEqual(['first_name', 'last_name'])
      expect(setClause).toBe('first_name = $1, last_name = $2')
      expect(queryParams).toEqual(['Michael', 'Smith', '1'])
    })

    it('returns empty values for input empty except id', async () => {
      const camelCaseData = { id: 1 }
      mockContext.req.json.mockResolvedValue(camelCaseData)
      mockContext.req.param.mockReturnValue('1')

      const [columnNames, setClause, queryParams]
        = await formatUpdate(mockContext)

      expect(columnNames).toEqual([])
      expect(setClause).toBe('')
      expect(queryParams).toEqual(['1'])
    })
  })
})
