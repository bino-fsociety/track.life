import type { ReactNode } from 'react'
import {
  BadgeEuro, BriefcaseBusiness, ChevronLeft, ChevronRight,
  CloudOff, Dumbbell, Flag, HeartPulse, LayoutDashboard, Menu, MoonStar, NotebookPen,
  Settings2, Timer, Video, X,
} from 'lucide-react'
import { useState } from 'react'
import { localDateKey, niceDate, parseDate } from '../utils'

export type Page = 'dashboard' | 'money' | 'training' | 'work' | 'sleep' | 'mood' | 'videos' | 'business' | 'goals' | 'journal' | 'data'

const nav: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'money', label: 'Money', icon: BadgeEuro },
  { id: 'training', label: 'Training', icon: Dumbbell },
  { id: 'work', label: 'Work', icon: Timer },
  { id: 'sleep', label: 'Sleep', icon: MoonStar },
  { id: 'mood', label: 'Mood', icon: HeartPulse },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'business', label: 'Business', icon: BriefcaseBusiness },
  { id: 'goals', label: 'Goals', icon: Flag },
  { id: 'journal', label: 'Wins Journal', icon: NotebookPen },
  { id: 'data', label: 'Data & Backup', icon: Settings2 },
]

const mobilePrimary = nav.slice(0, 4)

export function Layout({ page, setPage, selectedDate, setSelectedDate, saveState, children }: {
  page: Page
  setPage: (page: Page) => void
  selectedDate: string
  setSelectedDate: (date: string) => void
  saveState: 'saved' | 'saving'
  children: ReactNode
}) {
  const [mobileMenu, setMobileMenu] = useState(false)
  const moveDate = (days: number) => {
    const date = parseDate(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(localDateKey(date))
  }
  const navigate = (next: Page) => { setPage(next); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark brand-word">Bino</div>
          <div><strong>Bino</strong><span>Tracking App</span></div>
        </div>
        <nav>
          {nav.map((item) => <NavButton key={item.id} item={item} active={page === item.id} onClick={() => navigate(item.id)} />)}
        </nav>
        <div className="privacy-note"><CloudOff size={17} /><div><strong>Private by design</strong><span>Stored only on this device</span></div></div>
      </aside>

      <div className="main-wrap">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark brand-word">Bino</div><strong>Bino Tracking App</strong></div>
          <div className="date-control">
            <button onClick={() => moveDate(-1)} aria-label="Previous day"><ChevronLeft size={18} /></button>
            <label>
              <span>{selectedDate === localDateKey() ? 'Today' : niceDate(selectedDate, true)}</span>
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </label>
            <button onClick={() => moveDate(1)} aria-label="Next day"><ChevronRight size={18} /></button>
          </div>
          <div className={`save-state ${saveState}`}><span />{saveState === 'saving' ? 'Saving…' : 'Saved locally'}</div>
        </header>
        <main>{children}</main>
      </div>

      <nav className="mobile-nav">
        {mobilePrimary.map((item) => <NavButton key={item.id} item={item} active={page === item.id} onClick={() => navigate(item.id)} />)}
        <button className={mobileMenu ? 'active' : ''} onClick={() => setMobileMenu(!mobileMenu)}><Menu size={21} /><span>More</span></button>
      </nav>

      {mobileMenu && <div className="mobile-sheet-backdrop" onClick={() => setMobileMenu(false)}>
        <div className="mobile-sheet" onClick={(event) => event.stopPropagation()}>
          <div className="mobile-sheet-head"><div><span>Navigate</span><strong>All trackers</strong></div><button onClick={() => setMobileMenu(false)}><X /></button></div>
          <div className="mobile-sheet-grid">{nav.map((item) => <NavButton key={item.id} item={item} active={page === item.id} onClick={() => navigate(item.id)} />)}</div>
        </div>
      </div>}
    </div>
  )
}

function NavButton({ item, active, onClick }: { item: typeof nav[number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon
  return <button className={active ? 'active' : ''} onClick={onClick}><Icon size={19} /><span>{item.label}</span></button>
}
