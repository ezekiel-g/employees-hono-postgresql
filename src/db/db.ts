import { Pool } from 'pg'

export const connectToDb = async (): Promise<Pool | null> => {
  let pool: Pool | null = new Pool({ connectionString: process.env.DB_URI })

  try {
    const sqlResult = await pool.query('SELECT 1;')

    if (sqlResult && sqlResult.rows)
      console.log('Connected to database')
  }
  catch (error) {
    await pool.end()
    pool = null
    console.error('Error connecting to database:', error)
  }

  return pool
}

export const disconnectFromDb = async (pool: Pool) => {
  try {
    await pool.end()
    console.log('Disconnected from database')
  }
  catch (error) {
    console.error('Error disconnecting from database:', error)
  }
}
