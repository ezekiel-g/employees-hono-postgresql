import type { Pool } from 'pg'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../app.ts'
import { tableNames } from '../util/zodHelper.js'

vi.mock('hono/logger')
vi.mock('hono/cors')

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
    expect(logger).toHaveBeenCalled()
  })

  it('uses CORS middleware with correct settings', () => {
    expect(cors).toHaveBeenCalledWith(
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
