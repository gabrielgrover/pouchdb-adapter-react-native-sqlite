import { type SQLiteDatabase, openDatabaseSync } from 'expo-sqlite'
import { TransactionQueue } from './transactionQueue'

export type OpenDatabaseOptions = { name: string }
type OpenDatabaseResult =
  | {
      db: SQLiteDatabase
      transactionQueue: TransactionQueue
    }
  | {
      error: Error
    }

const cachedDatabases = new Map<string, OpenDatabaseResult>()

function openDBSafely(opts: OpenDatabaseOptions): OpenDatabaseResult {
  try {
    const db = openDatabaseSync(opts.name)
    const transactionQueue = new TransactionQueue(db)
    return { db, transactionQueue }
  } catch (err: any) {
    return { error: err }
  }
}

function openDB(opts: OpenDatabaseOptions) {
  let cachedResult: OpenDatabaseResult | undefined = cachedDatabases.get(
    opts.name
  )
  if (!cachedResult) {
    cachedResult = openDBSafely(opts)
    cachedDatabases.set(opts.name, cachedResult)
  }
  return cachedResult
}

export function closeDB(name: string) {
  const cachedResult = cachedDatabases.get(name)
  if (cachedResult) {
    if ('db' in cachedResult) {
      cachedResult.db.closeSync()
    }
    cachedDatabases.delete(name)
  }
}

export default openDB
