import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CardProgress, DayLog, UserState } from '../types'
import { ALL_DECKS } from '../data/cards'
import { today } from './date'

const DB_NAME = 'nihongo-drill'
const DB_VERSION = 1

interface Schema extends DBSchema {
  progress: { key: string; value: CardProgress }
  dayLogs: { key: string; value: DayLog }
  meta: { key: string; value: unknown }
  favorites: { key: string; value: { cardId: string; addedAt: number } }
}

export const DEFAULT_USER: UserState = {
  streak: 0,
  bestStreak: 0,
  lastStudyDate: null,
  totalXp: 0,
  dailyGoal: 20,
  newPerDay: 10,
  enabledDecks: [...ALL_DECKS],
  tts: true,
  showKr: true,
  streakFreezes: 1,
  createdAt: today(),
}

let dbPromise: Promise<IDBPDatabase<Schema>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<Schema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('progress', { keyPath: 'cardId' })
        db.createObjectStore('dayLogs', { keyPath: 'date' })
        db.createObjectStore('meta')
        db.createObjectStore('favorites', { keyPath: 'cardId' })
      },
    })
  }
  return dbPromise
}

export interface Snapshot {
  progress: Record<string, CardProgress>
  dayLogs: Record<string, DayLog>
  user: UserState
  favorites: string[]
}

export async function loadSnapshot(): Promise<Snapshot> {
  const db = await getDB()
  const [progressRows, dayRows, storedUser, favRows] = await Promise.all([
    db.getAll('progress'),
    db.getAll('dayLogs'),
    db.get('meta', 'user') as Promise<UserState | undefined>,
    db.getAll('favorites'),
  ])

  const progress: Record<string, CardProgress> = {}
  for (const row of progressRows) progress[row.cardId] = row

  const dayLogs: Record<string, DayLog> = {}
  for (const row of dayRows) dayLogs[row.date] = row

  return {
    progress,
    dayLogs,
    // 설정 항목이 늘어나도 기존 저장본이 깨지지 않도록 기본값과 병합
    user: { ...DEFAULT_USER, ...(storedUser ?? {}) },
    favorites: favRows.map((f) => f.cardId),
  }
}

export async function saveProgress(rows: CardProgress[]) {
  if (!rows.length) return
  const db = await getDB()
  const tx = db.transaction('progress', 'readwrite')
  await Promise.all([...rows.map((r) => tx.store.put(r)), tx.done])
}

export async function saveDayLog(log: DayLog) {
  const db = await getDB()
  await db.put('dayLogs', log)
}

export async function saveUser(user: UserState) {
  const db = await getDB()
  await db.put('meta', user, 'user')
}

export async function setFavorite(cardId: string, on: boolean) {
  const db = await getDB()
  if (on) await db.put('favorites', { cardId, addedAt: Date.now() })
  else await db.delete('favorites', cardId)
}

export async function resetAll() {
  const db = await getDB()
  const tx = db.transaction(['progress', 'dayLogs', 'meta', 'favorites'], 'readwrite')
  await Promise.all([
    tx.objectStore('progress').clear(),
    tx.objectStore('dayLogs').clear(),
    tx.objectStore('meta').clear(),
    tx.objectStore('favorites').clear(),
    tx.done,
  ])
}

export interface BackupFile {
  app: 'nihongo-drill'
  version: number
  exportedAt: string
  data: Snapshot
}

export async function exportBackup(): Promise<BackupFile> {
  return {
    app: 'nihongo-drill',
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    data: await loadSnapshot(),
  }
}

export async function importBackup(raw: unknown): Promise<Snapshot> {
  const file = raw as Partial<BackupFile>
  if (!file || file.app !== 'nihongo-drill' || !file.data) {
    throw new Error('이 앱에서 내보낸 백업 파일이 아닙니다.')
  }
  const data = file.data
  await resetAll()
  await saveProgress(Object.values(data.progress ?? {}))
  for (const log of Object.values(data.dayLogs ?? {})) await saveDayLog(log)
  const user = { ...DEFAULT_USER, ...(data.user ?? {}) }
  await saveUser(user)
  for (const id of data.favorites ?? []) await setFavorite(id, true)
  return loadSnapshot()
}
