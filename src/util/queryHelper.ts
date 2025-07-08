import type { Context } from 'hono'
import snakecaseKeys from 'snakecase-keys'

export const formatInsert = async (
  context: Context,
): Promise<[string[], unknown[], string]> => {
  const requestBodyCamel = await context.req.json()
  const requestBody = snakecaseKeys(requestBodyCamel)
  const columnNames = Object.keys(requestBody)
  const queryParams = columnNames.map(name => requestBody[name])
  const placeholders = columnNames.length
    ? columnNames.map((_, i) => `$${i + 1}`).join(', ')
    : ''

  return [columnNames, queryParams, placeholders]
}

export const formatUpdate = async (
  context: Context,
): Promise<[string[], string, unknown[]]> => {
  const requestBodyCamel = await context.req.json()
  const requestBody = snakecaseKeys(requestBodyCamel)
  const columnNames = Object.keys(requestBody).filter(name => name !== 'id')
  const queryParams = columnNames.map(name => requestBody[name])
  const setClause = columnNames.map(
    (field, i) => `${field} = $${i + 1}`,
  ).join(', ')
  queryParams.push(context.req.param('id'))

  return [columnNames, setClause, queryParams]
}
