import type { Context } from 'hono'
import { ZodError } from 'zod'

interface pgError {
  code?: string
  message?: string
  stack?: string
}

export const pgErrorMap = new Map<string, {
  status: number
  getMessage: (col: string) => string
}>([
      ['23502', { status: 400, getMessage: col => `${col} required` }],
      ['22001', { status: 422, getMessage: col => `${col} too long` }],
      ['22003', { status: 422, getMessage: col => `${col} out of range` }],
      ['23514', { status: 422, getMessage: col => `${col} invalid` }],
      ['22023', { status: 422, getMessage: col => `${col} invalid` }],
      ['22008', { status: 422, getMessage: col => `${col} invalid` }],
      ['42703', { status: 422, getMessage: col => `'${col}' not a column` }],
      ['23503', { status: 422, getMessage: col => `${col} invalid` }],
      ['23505', { status: 422, getMessage: col => `${col} taken` }],
    ])

export const handleDbError = (
  context: Context,
  error: unknown,
  columnNames: string[] = [],
) => {
  let statusCode = 500
  let messages = ['Unexpected error']
  let columnName = 'Value'

  if (error instanceof ZodError) {
    messages = error.errors.map(e => e.message)
    statusCode = 400
  }

  const pgError = error as pgError

  for (let i = 0; i < columnNames.length; i++) {
    const current = columnNames[i]

    if (current && pgError.message && pgError.message.includes(current)) {
      columnName = current.replace(/^./, l => l.toUpperCase())
      break
    }
  }

  const errorInMap = pgErrorMap.get(pgError.code ?? '')

  if (errorInMap) {
    statusCode = errorInMap.status
    messages = [errorInMap.getMessage(columnName)]
  }

  console.error(
    `Error${pgError.code ? ` ${pgError.code}` : ''}: ${pgError.message}`,
  )

  if (pgError.stack)
    console.error(pgError.stack)

  return context.json(
    { message: 'Database error', errors: messages },
    statusCode as 400 || 422 || 500,
  )
}
