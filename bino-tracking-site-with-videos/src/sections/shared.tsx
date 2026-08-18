import type { AppData, DailyEntry, DateKey } from '../types'

export interface SectionProps {
  data: AppData
  selectedDate: DateKey
  updateEntry: (date: DateKey, update: (entry: DailyEntry) => DailyEntry) => void
  commit: (update: (current: AppData) => AppData) => void
}

export const chartTooltipStyle = {
  background: 'rgba(18, 19, 22, .96)',
  border: '1px solid rgba(255,255,255,.09)',
  borderRadius: '14px',
  boxShadow: '0 16px 40px rgba(0,0,0,.35)',
  color: '#f5f5f3',
  fontSize: '12px',
}

export const axisStyle = { fill: '#797c84', fontSize: 11 }
