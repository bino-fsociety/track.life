import { useCallback, useEffect, useRef, useState } from 'react'
import { loadData, resetDatabase, saveData } from '../db'
import type { AppData, DailyEntry, DateKey } from '../types'
import { createDailyEntry, createEmptyData } from '../types'

export function useTrackerData() {
  const [data, setData] = useState<AppData>(createEmptyData())
  const [ready, setReady] = useState(false)
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved')
  const saveTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    loadData().then((stored) => {
      setData(stored)
      setReady(true)
    })
  }, [])

  const commit = useCallback((update: (current: AppData) => AppData) => {
    setData((current) => {
      const next = update(current)
      setSaveState('saving')
      window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(() => {
        void saveData(next).then(() => setSaveState('saved'))
      }, 120)
      return next
    })
  }, [])

  const updateEntry = useCallback((date: DateKey, update: (entry: DailyEntry) => DailyEntry) => {
    commit((current) => {
      const entry = current.entries[date] ?? createDailyEntry(date)
      return { ...current, entries: { ...current.entries, [date]: update(entry) } }
    })
  }, [commit])

  const importData = useCallback(async (next: AppData) => {
    await saveData(next)
    setData(next)
    setSaveState('saved')
  }, [])

  const reset = useCallback(async () => {
    const empty = await resetDatabase()
    setData(empty)
  }, [])

  return { data, ready, saveState, commit, updateEntry, importData, reset }
}
