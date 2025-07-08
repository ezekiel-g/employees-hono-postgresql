import type { Context } from 'hono'
import type { ZodIssue } from 'zod'
import { getSchemaFunction } from './zodHelper.js'

export const validateInput = async (
  context: Context,
  tableName: string,
  queryType: 'INSERT' | 'UPDATE',
): Promise<[string[] | null, number]> => {
  const requestBody = await context.req.json()
  let statusCode = 200
  let messages: string[] | null = null

  const schemaFunction = await getSchemaFunction(tableName, queryType)

  if (schemaFunction) {
    const result = schemaFunction.safeParse(requestBody)

    if (!result.success) {
      statusCode = 422
      messages = result.error.errors.map((e: ZodIssue) => e.message)
    }
  }
  else {
    statusCode = 400
    messages = [`No schema function found for table '${tableName}'`]
  }

  return [messages, statusCode]
}
