import type { Pool } from 'pg'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { crudEndpoints } from './endpoints/crudEndpoints.ts'
import { tableNames } from './util/zodHelper.ts'

export const createRouter = () => new Hono({ strict: false })

export const createApp = (pool: Pool) => {
  const app = createRouter()

  app.use('*', logger())
  app.use('*', cors({
    origin: process.env.FRONT_END_URL ?? '',
    allowHeaders: ['Content-Type'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  }))

  for (let i = 0; i < tableNames.length; i++) {
    app.route(`/api/v1/${tableNames[i]}`, crudEndpoints(pool, tableNames[i]))
  }

  return app
}
