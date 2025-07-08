import type { Pool } from 'pg'
import { Hono } from 'hono'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { crudEndpoints } from '../../endpoints/crudEndpoints'
import { handleDbError } from '../../util/handleDbError'
import { formatInsert, formatUpdate } from '../../util/queryHelper'
import { validateInput } from '../../util/validateInput'

vi.mock('pg')
vi.mock('../../util/handleDbError')
vi.mock('../../util/queryHelper')
vi.mock('../../util/validateInput')

describe('crudEndpoints', () => {
  let app: Hono
  let pool: Pool
  let consoleErrorSpy: any
  const baseUrl = 'http://localhost/api/v1/users'
  const postBody = { name: 'Mary', email: 'mary@example.com' }
  const patchBody = { name: 'Mary' }
  const userData = { id: 1, name: 'Mary', email: 'mary@example.com' }
  const formatInsertArray: [string[], unknown[], string] = [
    ['name', 'email'],
    ['Mary', 'mary@example.com'],
    '$1, $2',
  ]
  const formatUpdateArray: [string[], string, unknown[]] = [
    ['name'],
    'name = $1',
    ['Mary', '1'],
  ]

  const fetchFromBackEnd = async (url: string, options?: RequestInit) => {
    const request = new Request(url, options)
    const response = await app.request(request)
    const body = await response.json()

    return [response, body]
  }

  beforeEach(() => {
    pool = { query: vi.fn() } as unknown as Pool

    vi.mocked(validateInput).mockResolvedValue([null, 200])
    vi.mocked(formatInsert).mockResolvedValue(formatInsertArray)
    vi.mocked(formatUpdate).mockResolvedValue(formatUpdateArray)
    vi.mocked(handleDbError).mockImplementation((context, _error) =>
      context.json(
        { message: 'Database error', errors: ['error'] },
        500 as any,
      ),
    )

    app = new Hono()
    app.route('/api/v1/users', crudEndpoints(pool, 'users'))
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy.mockRestore()
  })

  it('returns 200 and all rows on GET /', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [userData],
    } as any)

    const [response, body] = await fetchFromBackEnd(baseUrl)

    expect(response.status).toBe(200)
    expect(body).toEqual([userData])
  })

  it('returns 200 and specific row on GET /:id', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [userData],
    } as any)

    const [response, body] = await fetchFromBackEnd(`${baseUrl}/1`)

    expect(response.status).toBe(200)
    expect(body).toEqual(userData)
  })

  it('returns 404 if no row found on GET /:id', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any)

    const [response, body] = await fetchFromBackEnd(`${baseUrl}/1`)

    expect(response.status).toBe(404)
    expect(body).toEqual({ message: 'Not found' })
  })

  it('returns 201 and new row on POST /', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [userData],
    } as any)

    const [response, body] = await fetchFromBackEnd(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody),
    })

    expect(response.status).toBe(201)
    expect(body).toEqual(userData)
  })

  it('returns 422 on validation error for POST /', async () => {
    vi.mocked(validateInput).mockResolvedValueOnce([
      ['Message 1', 'Message 2'],
      422,
    ])

    const [response, body] = await fetchFromBackEnd(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody),
    })

    expect(response.status).toBe(422)
    expect(body.errors).toContain('Message 1')
    expect(body.errors).toContain('Message 2')
  })

  it('returns 200 and updated row on PATCH /:id', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [userData],
    } as any)

    const [response, body] = await fetchFromBackEnd(`${baseUrl}/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody),
    })

    expect(response.status).toBe(200)
    expect(body).toEqual(userData)
  })

  it('returns 404 if no row found on PATCH /:id', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any)

    const [response, body] = await fetchFromBackEnd(`${baseUrl}/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody),
    })

    expect(response.status).toBe(404)
    expect(body).toEqual({ message: 'Not found' })
  })

  it('returns 422 on validation error for PATCH /:id', async () => {
    vi.mocked(validateInput).mockResolvedValueOnce([
      ['Message 1', 'Message 2'],
      422,
    ])

    const [response, body] = await fetchFromBackEnd(`${baseUrl}/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody),
    })

    expect(response.status).toBe(422)
    expect(body.errors).toContain('Message 1')
    expect(body.errors).toContain('Message 2')
  })

  it('returns 200 and deletes row on DELETE /:id', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rowCount: 1 } as any)

    const [response, body] = await fetchFromBackEnd(`${baseUrl}/1`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(200)
    expect(body).toEqual({ message: 'Deleted' })
  })

  it('returns 404 if no row found on DELETE /:id', async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({ rowCount: 0 } as any)

    const [response, body] = await fetchFromBackEnd(`${baseUrl}/1`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(404)
    expect(body).toEqual({ message: 'Not found' })
  })

  it('calls handleDbError on GET / failure', async () => {
    const error = new Error('Database error')

    vi.mocked(pool.query).mockRejectedValueOnce(error)
    vi.mocked(handleDbError).mockImplementation((context, _error) =>
      context.json(
        { message: 'Database error', errors: ['Unexpected error'] },
        500 as any,
      ),
    )

    const [response, body] = await fetchFromBackEnd(baseUrl)

    expect(response.status).toBe(500)
    expect(body).toEqual({
      message: 'Database error',
      errors: ['Unexpected error'],
    })
    expect(handleDbError).toHaveBeenCalledWith(expect.any(Object), error)
  })

  it('calls handleDbError on POST / failure', async () => {
    const error = new Error('Database error')

    vi.mocked(pool.query).mockRejectedValueOnce(error)
    vi.mocked(handleDbError).mockImplementation(
      (context, _error, _columns) =>
        context.json(
          { message: 'Database error', errors: ['Database error'] },
          500 as any,
        ),
    )

    const [response, body] = await fetchFromBackEnd(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody),
    })

    expect(response.status).toBe(500)
    expect(body).toEqual({
      message: 'Database error',
      errors: ['Database error'],
    })
    expect(handleDbError).toHaveBeenCalledWith(
      expect.any(Object),
      error,
      ['name', 'email'],
    )
  })
})
