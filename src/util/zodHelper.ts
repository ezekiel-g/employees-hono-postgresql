import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import pluralize from 'pluralize'
import snakecaseKeys from 'snakecase-keys'

const getSchemaNames = () => {
  const folderPath = path.resolve('src', 'zod')
  const files = fs.readdirSync(folderPath).filter(
    file => file.endsWith('.ts'),
  )

  return files.map(file => file.replace('.ts', ''))
}

const getTableNames = () => {
  const schemaNames = getSchemaNames()

  return schemaNames.map((name) => {
    const snakecasedObject = snakecaseKeys({ [name]: '' })
    const snakecasedName = Object.keys(snakecasedObject)[0]

    if (!snakecasedName)
      throw new Error('No snake-cased name found')

    const pluralName = pluralize(snakecasedName)

    return pluralName
  })
}

export const getSchemaFunction = async (
  tableName: string,
  queryType: 'INSERT' | 'UPDATE',
) => {
  const schemaNames = getSchemaNames()
  const singularTableName = pluralize.singular(tableName.toLowerCase())
  const schemaName = schemaNames.find(name => name === singularTableName)

  if (!schemaName)
    throw new Error(`No schema found for table '${tableName}'`)

  const schemaFilePath = path.resolve('src', 'zod', `${schemaName}.ts`)
  const schemaModule = await import(pathToFileURL(schemaFilePath).href)

  const schemaFunctionName
  = `${queryType.charAt(0).toUpperCase()}${queryType.slice(1).toLowerCase()}`
    + `${schemaName.charAt(0).toUpperCase()}${schemaName.slice(1)}Schema`

  if (!(schemaFunctionName in schemaModule)) {
    throw new Error(`Schema function '${schemaFunctionName}' not found in `
      + `${schemaName}.ts`)
  }

  return schemaModule[schemaFunctionName]
}

export const tableNames = getTableNames()
