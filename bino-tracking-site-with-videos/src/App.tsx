import { useState } from 'react'
import { Layout, type Page } from './components/Layout'
import { useTrackerData } from './hooks/useTrackerData'
import { Business } from './sections/Business'
import { Dashboard } from './sections/Dashboard'
import { DataSettings } from './sections/DataSettings'
import { Goals } from './sections/Goals'
import { Journal } from './sections/Journal'
import { Money } from './sections/Money'
import { Mood } from './sections/Mood'
import { Sleep } from './sections/Sleep'
import { Training } from './sections/Training'
import { Videos } from './sections/Videos'
import { Work } from './sections/Work'
import { localDateKey } from './utils'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedDate, setSelectedDate] = useState(localDateKey())
  const tracker = useTrackerData()

  if (!tracker.ready) return <div className="loading-screen"><div className="loading-mark wordmark">Bino</div><span>Opening your private dashboard…</span></div>

  const props = { data: tracker.data, selectedDate, updateEntry: tracker.updateEntry, commit: tracker.commit }
  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard {...props} />,
    money: <Money {...props} />,
    training: <Training {...props} />,
    work: <Work {...props} />,
    sleep: <Sleep {...props} />,
    mood: <Mood {...props} />,
    videos: <Videos {...props} />,
    business: <Business {...props} />,
    goals: <Goals {...props} />,
    journal: <Journal {...props} />,
    data: <DataSettings data={tracker.data} importData={tracker.importData} reset={tracker.reset} />,
  }

  return <Layout page={page} setPage={setPage} selectedDate={selectedDate} setSelectedDate={setSelectedDate} saveState={tracker.saveState}>{pages[page]}</Layout>
}
