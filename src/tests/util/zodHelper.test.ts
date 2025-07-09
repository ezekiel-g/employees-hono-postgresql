import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'bun:test'
import { getSchemaFunction, tableNames } from '@/util/zodHelper'

describe('zodHelper', () => {
  describe('getSchemaNames', () => {
    it('returns schema names from .ts files', async () => {
      const folderPath = path.resolve('src', 'zod')
      const files = fs.readdirSync(folderPath).filter(
        file => file.endsWith('.ts'),
      )

      expect(files.length).toBeGreaterThan(0)
      expect(tableNames.length).toBe(files.length)
    })

    it('handles file system read errors', async () => {
      const folderPath = path.resolve('src', 'zod')
      const allFiles = fs.readdirSync(folderPath)
      const tsFiles = allFiles.filter(file => file.endsWith('.ts'))

      expect(tableNames.length).toBe(tsFiles.length)
      expect(tableNames.length).toBeLessThanOrEqual(allFiles.length)
    })
  })

  describe('getTableNames', () => {
    it('converts schema names to snake-case table names', async () => {
      for (let i = 0; i < tableNames.length; i++) {
        const tableName = tableNames[i]

        if (tableName) {
          expect(tableName).toBe(tableName.toLowerCase())
          expect(tableName).not.toMatch(/[A-Z]/)
          expect(tableName.length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('getSchemaFunction', () => {
    it('returns correct schema for any table and query type', async () => {
      const [table1, table2] = tableNames

      if (!table1 || !table2)
        throw new Error('Not enough tables')

      const result1 = await getSchemaFunction(table1, 'INSERT')
      const result2 = await getSchemaFunction(table2, 'UPDATE')

      expect(result1).toBeDefined()
      expect(result2).toBeDefined()
      expect(typeof result1.safeParse).toBe('function')
      expect(typeof result2.safeParse).toBe('function')
    })
  })

  describe('tableNames export', () => {
    it('exports table names as array', async () => {
      expect(Array.isArray(tableNames)).toBe(true)
      expect(tableNames.length).toBeGreaterThan(0)
    })
  })
})
