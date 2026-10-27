import { Link } from '../router'

const TABS = [
  { to: '/', label: '홈', icon: 'M12 3 2 11h3v9h6v-6h2v6h6v-9h3z' },
  { to: '/browse', label: '사전', icon: 'M4 4h7v16H4zm9 0h7v16h-7zM6 7h3v1H6zm9 0h3v1h-3z' },
  { to: '/stats', label: '통계', icon: 'M4 20V10h4v10zm6 0V4h4v16zm6 0v-7h4v7z' },
  { to: '/settings', label: '설정', icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 4a9 9 0 0 1-.1 1.3l2 1.6-2 3.4-2.4-1a9 9 0 0 1-2.2 1.3L16 21h-4l-.3-2.4a9 9 0 0 1-2.2-1.3l-2.4 1-2-3.4 2-1.6A9 9 0 0 1 7 12a9 9 0 0 1 .1-1.3l-2-1.6 2-3.4 2.4 1A9 9 0 0 1 11.7 5.4L12 3h4l.3 2.4a9 9 0 0 1 2.2 1.3l2.4-1 2 3.4-2 1.6A9 9 0 0 1 21 12z' },
]

export function TabBar({ path }: { path: string }) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const active = t.to === '/' ? path === '/' : path.startsWith(t.to)
        return (
          <Link key={t.to} to={t.to} className={active ? 'tab is-active' : 'tab'}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path fill="currentColor" d={t.icon} />
            </svg>
            <span>{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
