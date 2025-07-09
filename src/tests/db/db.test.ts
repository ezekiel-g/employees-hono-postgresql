import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test'
import { connectToDb, disconnectFromDb } from '@/db/db'

const mockQuery = mock(() => Promise.resolve({ rows: [{ '?column?': 1 }] }))
const mockEnd = mock(() => Promise.resolve())
const MockPool = mock(() => ({ query: mockQuery, end: mockEnd }))

mock.module('pg', () => ({ Pool: MockPool }))

describe('db', () => {
  let originalConsoleLog: typeof console.log
  let originalConsoleError: typeof console.error

  beforeAll(() => {
    originalConsoleLog = console.log
    originalConsoleError = console.error
    const consoleMock = mock(() => {})
    console.log = consoleMock as any
    console.error = consoleMock as any
  })

  beforeEach(() => {
    mockQuery.mockClear()
    mockEnd.mockClear()
  })

  afterAll(() => {
    console.log = originalConsoleLog
    console.error = originalConsoleError
    mock.restore()
  })

  describe('connectToDb', () => {
    it('connects to the database', async () => {
      mockQuery.mockResolvedValue({ rows: [{ '?column?': 1 }] })

      const result = await connectToDb()

      expect(result).toBeDefined()
      expect(mockQuery).toHaveBeenCalledWith('SELECT 1;')
    })

    it('returns null when database connection fails', async () => {
      mockQuery.mockRejectedValue(new Error('Error message'))

      const result = await connectToDb()

      expect(result).toBeNull()
      expect(mockEnd).toHaveBeenCalled()
    })
  })

  describe('disconnectFromDb', () => {
    it('disconnects from database', async () => {
      const mockPool = MockPool()
      await disconnectFromDb(mockPool as any)

      expect(mockEnd).toHaveBeenCalled()
    })

    it('handles disconnection errors', async () => {
      const mockPool = MockPool()
      mockEnd.mockRejectedValue(new Error('Error message'))

      expect(disconnectFromDb(mockPool as any)).resolves.toBeUndefined()
      expect(mockEnd).toHaveBeenCalled()
    })
  })
})
