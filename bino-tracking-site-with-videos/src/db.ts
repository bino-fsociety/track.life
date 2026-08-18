import { openDB } from 'idb'
import type { AppData } from './types'
import { createEmptyData } from './types'
import { normalizeData } from './utils'

const DB_NAME = 'bino-tracking-app'
const STORE_NAME = 'app-state'
const DATA_KEY = 'primary'

const database = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME)
  },
})

export async function loadData(): Promise<AppData> {
  const db = await database
  const stored = await db.get(STORE_NAME, DATA_KEY) as AppData | undefined
  return stored ? normalizeData(stored) : createEmptyData()
}

export async function saveData(data: AppData): Promise<void> {
  const db = await database
  await db.put(STORE_NAME, data, DATA_KEY)
}

export async function resetDatabase(): Promise<AppData> {
  const empty = createEmptyData()
  await saveData(empty)
  return empty
}
