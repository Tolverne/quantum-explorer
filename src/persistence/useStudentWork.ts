import { useEffect, useRef, useState } from 'react'
import { emptyStudentWork, studentWorkStorage, type StudentWork } from './studentWork'

export type SaveStatus = 'loading' | 'saving' | 'saved' | 'unavailable'

/**
 * Hydrate fully before rendering editable lesson controls.
 * Every edit is queued as an IndexedDB readwrite transaction (rather than
 * waiting for a debounce, which could lose the last typed response on exit).
 * Only the newest write is allowed to update the status indicator.
 */
export function useStudentWork() {
  const [work, setWork] = useState<StudentWork>(emptyStudentWork)
  const [status, setStatus] = useState<SaveStatus>('loading')
  const [ready, setReady] = useState(false)
  const [canSave, setCanSave] = useState(false)
  const revision = useRef(0)

  useEffect(() => {
    let active = true
    studentWorkStorage.load().then(data => {
      if (!active) return
      setWork(data)
      setCanSave(true)
      setReady(true)
      setStatus('saved')
    }).catch(() => {
      if (!active) return
      // Do not risk overwriting inaccessible old work: edits remain in memory
      // and can always be exported manually.
      setReady(true)
      setStatus('unavailable')
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!ready || !canSave) return
    const current = ++revision.current
    setStatus('saving')
    studentWorkStorage.save(work).then(() => {
      if (current === revision.current) setStatus('saved')
    }).catch(() => {
      if (current === revision.current) setStatus('unavailable')
    })
  }, [work, ready, canSave])

  return { work, setWork, status, ready }
}
