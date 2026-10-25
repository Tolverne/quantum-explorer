import { allActivityIds, type StudentEntry } from '../curriculum/lessons'
import { CHALLENGES } from '../challenges/challenges'

const DATABASE = 'quantum-explorer-student-work'
const STORE = 'work'
const KEY = 'current'
const SCHEMA_VERSION = 1

export type StudentWork = {
  journal: Record<string, StudentEntry>
  completedChallenges: string[]
}

export function emptyStudentWork(): StudentWork {
  return { journal: {}, completedChallenges: [] }
}

/** Ignore unexpected or corrupted data rather than crashing the app. */
export function normaliseStudentWork(value: unknown): StudentWork {
  if (!value || typeof value !== 'object') return emptyStudentWork()
  const input = value as Record<string, unknown>
  if (input.schemaVersion !== SCHEMA_VERSION) return emptyStudentWork()
  const journal: Record<string, StudentEntry> = {}
  const rawJournal = input.journal
  if (rawJournal && typeof rawJournal === 'object' && !Array.isArray(rawJournal)) {
    const permitted = new Set(allActivityIds())
    for (const [id, raw] of Object.entries(rawJournal)) {
      if (!permitted.has(id) || !raw || typeof raw !== 'object' || Array.isArray(raw)) continue
      const entry = raw as Record<string, unknown>
      const safe: StudentEntry = {}
      if (typeof entry.prediction === 'number' && Number.isInteger(entry.prediction) &&
          entry.prediction >= 0 && entry.prediction <= 2) safe.prediction = entry.prediction
      if (typeof entry.observation === 'string') safe.observation = entry.observation
      if (typeof entry.reflection === 'string') safe.reflection = entry.reflection
      if (typeof entry.completed === 'boolean') safe.completed = entry.completed
      journal[id] = safe
    }
  }
  const allowedChallenges = new Set(CHALLENGES.map(c => c.id))
  const completedChallenges = Array.isArray(input.completedChallenges)
    ? [...new Set(input.completedChallenges.filter(
        (id): id is string => typeof id === 'string' && allowedChallenges.has(id)
      ))]
    : []
  return { journal, completedChallenges }
}

export type StudentWorkStorage = {
  load: () => Promise<StudentWork>
  save: (work: StudentWork) => Promise<void>
}

/**
 * One local record per browser origin, no accounts or network requests.
 * Injecting IDBFactory allows deterministic integration tests.
 * A separate file:// origin may have different IndexedDB permissions.
 */
export function createStudentWorkStorage(
  factory: IDBFactory | undefined = globalThis.indexedDB,
  name: string = DATABASE
): StudentWorkStorage {
  let connection: Promise<IDBDatabase> | null = null
  function open(): Promise<IDBDatabase> {
    if (!factory) return Promise.reject(new Error('IndexedDB is unavailable'))
    if (!connection) {
      connection = new Promise<IDBDatabase>((resolve, reject) => {
        const request = factory.open(name, SCHEMA_VERSION)
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
        }
        request.onsuccess = () => {
          const db = request.result
          db.onversionchange = () => db.close()
          resolve(db)
        }
        request.onerror = () => reject(request.error || new Error('Could not open IndexedDB'))
        request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked'))
      }).catch(error => {
        connection = null
        throw error
      })
    }
    return connection!
  }
  return {
    async load() {
      const db = await open()
      return new Promise<StudentWork>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly')
        const request = tx.objectStore(STORE).get(KEY)
        request.onsuccess = () => resolve(normaliseStudentWork(request.result))
        request.onerror = () => reject(request.error || new Error('Could not load student work'))
        tx.onabort = () => reject(tx.error || new Error('Read transaction aborted'))
      })
    },
    async save(work) {
      const db = await open()
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).put({
          schemaVersion: SCHEMA_VERSION,
          journal: work.journal,
          completedChallenges: work.completedChallenges
        }, KEY)
        // Resolve only once the entire transaction has committed.
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error || new Error('Could not save student work'))
        tx.onabort = () => reject(tx.error || new Error('Save transaction aborted'))
      })
    }
  }
}

export const studentWorkStorage = createStudentWorkStorage()
