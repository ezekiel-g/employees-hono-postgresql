import type { Pool } from 'pg'
import { createRouter } from '@/app'
import { handleDbError } from '@/util/handleDbError'
import { formatInsert, formatUpdate } from '@/util/queryHelper'
import { validateInput } from '@/util/validateInput'

export const crudEndpoints = (pool: Pool, tableName: string) => {
  const router = createRouter()

  router.get('/', async (context) => {
    try {
      const sqlResult = await pool.query(`SELECT * FROM ${tableName};`)

      return context.json(sqlResult.rows, 200)
    }
    catch (error) {
      return handleDbError(context, error)
    }
  })

  router.get('/:id', async (context) => {
    try {
      const sqlResult = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1;`,
        [context.req.param('id')],
      )

      if (sqlResult.rows.length === 0)
        return context.json({ message: 'Not found' }, 404)

      return context.json(sqlResult.rows[0], 200)
    }
    catch (error) {
      return handleDbError(context, error)
    }
  })

  router.post('/', async (context) => {
    const [messages, statusCode] = await validateInput(
      context,
      tableName,
      'INSERT',
    )

    if (statusCode >= 400) {
      return context.json(
        { message: 'Validation error(s)', errors: messages },
        statusCode as 400 || 422,
      )
    }

    const [columnNames, queryParams, placeholders] = await formatInsert(context)

    try {
      const sqlResult = await pool.query(
        `INSERT INTO ${tableName} (${columnNames.join(', ')})
        VALUES (${placeholders})
        RETURNING *;`,
        queryParams,
      )

      return context.json(sqlResult.rows[0], 201)
    }
    catch (error) {
      return handleDbError(context, error, columnNames)
    }
  })

  router.patch('/:id', async (context) => {
    const [messages, statusCode] = await validateInput(
      context,
      tableName,
      'UPDATE',
    )

    if (statusCode >= 400) {
      return context.json(
        { message: 'Validation error(s)', errors: messages },
        statusCode as 400 || 422,
      )
    }

    const [columnNames, setClause, queryParams] = await formatUpdate(context)

    try {
      const sqlResult = await pool.query(
        `UPDATE ${tableName}
        SET ${setClause}
        WHERE id = $${queryParams.length}
        RETURNING *;`,
        queryParams,
      )

      if (sqlResult.rows.length === 0)
        return context.json({ message: 'Not found' }, 404)

      return context.json(sqlResult.rows[0], 200)
    }
    catch (error) {
      return handleDbError(context, error, columnNames)
    }
  })

  router.delete('/:id', async (context) => {
    try {
      const sqlResult = await pool.query(
        `DELETE FROM ${tableName} WHERE id = $1;`,
        [context.req.param('id')],
      )

      if (sqlResult.rowCount === 0)
        return context.json({ message: 'Not found' }, 404)

      return context.json({ message: 'Deleted' }, 200)
    }
    catch (error) {
      return handleDbError(context, error)
    }
  })

  return router
}
