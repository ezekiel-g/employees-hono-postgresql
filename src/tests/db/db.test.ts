import { Pool } from 'pg'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { connectToDb, disconnectFromDb } from '../../db/db.js'

vi.mock('pg', () => ({ Pool: vi.fn() }))

describe('db', () => {
  let mockPool: any

  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  beforeEach(() => {
    vi.clearAllMocks()

    mockPool = { query: vi.fn(), end: vi.fn() }

    vi.mocked(Pool).mockImplementation(() => mockPool)
  })

  afterAll(() => vi.restoreAllMocks())

  describe('connectToDb', () => {
    it('connects to the database', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ '?column?': 1 }] })

      const result = await connectToDb()

      expect(result).toBe(mockPool)
      expect(mockPool.query).toHaveBeenCalledWith('SELECT 1;')
    })

    it('returns null when database connection fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Connection failed'))

      const result = await connectToDb()

      expect(result).toBeNull()
      expect(mockPool.end).toHaveBeenCalled()
    })
  })

  describe('disconnectFromDb', () => {
    it('disconnects from database', async () => {
      await disconnectFromDb(mockPool)

      expect(mockPool.end).toHaveBeenCalled()
    })

    it('handles disconnection errors', async () => {
      mockPool.end.mockRejectedValue(new Error('Disconnect failed'))

      await expect(disconnectFromDb(mockPool)).resolves.toBeUndefined()
      expect(mockPool.end).toHaveBeenCalled()
    })
  })
})
