import type { Pool } from 'pg'
import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Hono } from 'hono'
import { createApp } from '@/app'
import { tableNames } from '@/util/zodHelper'

const MockLogger = mock(() => ({}))
const MockCors = mock(() => ({}))

mock.module('hono/logger', () => ({ logger: MockLogger }))
mock.module('hono/cors', () => ({ cors: MockCors }))

describe('createApp', () => {
  let pool: Pool
  let app: Hono

  beforeEach(() => {
    pool = {} as Pool
    app = createApp(pool)
  })

  it('creates an app instance', () => {
    expect(app).toBeInstanceOf(Hono)
  })

  it('uses logger middleware', () => {
    expect(MockLogger).toHaveBeenCalled()
  })

  it('uses CORS middleware with correct settings', () => {
    expect(MockCors).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: process.env.FRONT_END_URL ?? '',
        allowHeaders: ['Content-Type'],
        credentials: true,
        allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
      }),
    )
  })

  it('creates a route for each table name', async () => {
    expect(app.routes).toBeDefined()
    const expectedRoutes = tableNames.map(name => `/api/v1/${name}`)
    const actualRoutes = app.routes.map(route => route.path)

    for (let i = 0; i < expectedRoutes.length; i++) {
      expect(actualRoutes).toContain(expectedRoutes[i])
    }
  })
})
