import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { connectToDb, disconnectFromDb } from './db/db.js'

const pool = await connectToDb()

if (!pool)
  process.exit(1)

const app = createApp(pool)
const PORT = Number(process.env.PORT || 3000)

serve({ fetch: app.fetch, port: PORT })
console.log(`Server running on port ${PORT}`)

process.on('SIGINT', async () => {
  console.log('Shutting down server...')
  await disconnectFromDb(pool)
  process.exit(0)
})
