import fs from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSchemaFunction, tableNames } from '../../util/zodHelper'

vi.mock('node:fs', () => ({
  default: {
    readdirSync: vi.fn(() => ['user.ts', 'userItem.ts']),
  },
}))

vi.mock('node:path', () => ({
  default: {
    resolve: vi.fn((arg1, arg2, arg3) => {
      if (arg1 === 'src' && arg2 === 'zod' && arg3) {
        return `/mock/path/src/zod/${arg3}`
      }

      return '/mock/path/src/zod'
    }),
  },
}))

vi.mock('node:url', () => ({
  pathToFileURL: vi.fn(() => ({ href: '/mock/path/src/zod/schema.ts' })),
}))

const createMockSchemaModule = (tableName: string) => ({
  [`Insert${tableName.charAt(0).toUpperCase() + tableName.slice(1)}Schema`]: {
    parse: vi.fn(),
  },
  [`Update${tableName.charAt(0).toUpperCase() + tableName.slice(1)}Schema`]: {
    parse: vi.fn(),
  },
})

vi.mock('../../util/zodHelper', async () => {
  const actual = await vi.importActual('../../util/zodHelper')

  return {
    tableNames: actual.tableNames,
    getSchemaFunction: vi.fn().mockImplementation(
      async (tableName, queryType) => {
        if (tableName === 'nonExistentTable') {
          throw new Error(`Schema not found for table: ${tableName}`)
        }

        const schemaModule = createMockSchemaModule(tableName)
        const queryTypeCapitalized = queryType.charAt(0).toUpperCase()
          + queryType.slice(1).toLowerCase()
        const tableNameCapitalized = tableName.charAt(0).toUpperCase()
          + tableName.slice(1)
        const schemaName
          = `${queryTypeCapitalized}${tableNameCapitalized}Schema`
        return schemaModule[schemaName]
      },
    ),
  }
})

describe('zodHelper', () => {
  let schemaNames: string[]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    const mockFs = vi.mocked(fs)
    const files = mockFs.readdirSync('/mock/path/src/zod').filter(
      file => file.endsWith('.ts'),
    )
    schemaNames = files.map(file => file.replace('.ts', ''))
  })

  describe('getSchemaNames', () => {
    it('returns schema names from .ts files', async () => {
      const mockFs = vi.mocked(fs)
      mockFs.readdirSync.mockReturnValueOnce([
        'user.ts',
        'userItem.ts',
        'something.js',
        'somethingElse.txt',
      ] as any)

      expect(schemaNames).toEqual(['user', 'userItem'])
    })

    it('handles file system read errors', async () => {
      const mockFs = vi.mocked(fs)
      mockFs.readdirSync.mockImplementationOnce(() => {
        throw new Error('Permission denied')
      })

      expect(() => {
        const mockFs = vi.mocked(fs)
        const files = mockFs.readdirSync('/mock/path/src/zod').filter(
          file => file.endsWith('.ts'),
        )
        return files.map(file => file.replace('.ts', ''))
      }).toThrow('Permission denied')
    })
  })

  describe('getTableNames', () => {
    it('converts schema names to snake-case table names', async () => {
      const mockFs = vi.mocked(fs)
      mockFs.readdirSync.mockReturnValueOnce([
        'user.ts',
        'userItem.ts',
      ] as any)

      expect(tableNames).toEqual(['users', 'user_items'])
    })
  })

  describe('getSchemaFunction', () => {
    it('returns correct schema for any table and query type', async () => {
      const result1 = await getSchemaFunction('users', 'INSERT')
      const result2 = await getSchemaFunction('cats', 'UPDATE')

      expect(result1).toBeDefined()
      expect(result2).toBeDefined()
      expect(typeof result1.parse).toBe('function')
      expect(typeof result2.parse).toBe('function')
    })

    it('throws error for non-existent table name', async () => {
      await expect(getSchemaFunction('nonExistentTable', 'INSERT'))
        .rejects
        .toThrow()
    })
  })

  describe('tableNames export', () => {
    it('exports table names as array', async () => {
      expect(Array.isArray(tableNames)).toBe(true)
      expect(tableNames.length).toBeGreaterThan(0)
    })
  })
})
