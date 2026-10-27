import { useMemo } from 'react'
import { ALL_DECKS, DECK_LABEL, allCards } from '../data/cards'
import { recentDays, today } from '../lib/date'
import { effectiveStreak, levelProgress } from '../lib/gamify'
import { deckStats } from '../lib/session'
import { useApp } from '../state/AppContext'
import { Heatmap } from '../components/Heatmap'

export function Stats() {
  const { dayLogs, progress, user } = useApp()
  const day = today()
  const stats = useMemo(() => deckStats(progress, day), [progress, day])
  const lvl = levelProgress(user.totalXp)

  const totals = useMemo(() => {
    const logs = Object.values(dayLogs)
    return {
      reviews: logs.reduce((s, l) => s + l.reviews, 0),
      correct: logs.reduce((s, l) => s + l.correct, 0),
      days: logs.filter((l) => l.reviews > 0).length,
    }
  }, [dayLogs])

  const learned = allCards.filter((c) => {
    const p = progress[c.id]
    return p && p.stage !== 'new'
  }).length

  const last14 = recentDays(14, day)
  const max14 = Math.max(1, ...last14.map((k) => dayLogs[k]?.reviews ?? 0))

  return (
    <div className="screen">
      <h1 className="page-title">통계</h1>

      <div className="stat-grid">
        <div className="card stat">
          <span className="stat-num">🔥 {effectiveStreak(user, day)}</span>
          <span className="stat-label">현재 스트릭</span>
        </div>
        <div className="card stat">
          <span className="stat-num">{user.bestStreak}</span>
          <span className="stat-label">최고 스트릭</span>
        </div>
        <div className="card stat">
          <span className="stat-num">Lv.{lvl.level}</span>
          <span className="stat-label">{user.totalXp} XP</span>
        </div>
        <div className="card stat">
          <span className="stat-num">
            {totals.reviews ? Math.round((totals.correct / totals.reviews) * 100) : 0}%
          </span>
          <span className="stat-label">전체 정확도</span>
        </div>
        <div className="card stat">
          <span className="stat-num">{learned}</span>
          <span className="stat-label">학습한 카드</span>
        </div>
        <div className="card stat">
          <span className="stat-num">{totals.days}</span>
          <span className="stat-label">학습한 날</span>
        </div>
      </div>

      <section className="card">
        <h2 className="card-title">최근 12주</h2>
        <Heatmap dayLogs={dayLogs} goal={user.dailyGoal} />
        <div className="legend">
          <span>적음</span>
          {[1, 2, 3, 4].map((l) => (
            <span key={l} className={`heatmap-cell lv${l}`} />
          ))}
          <span>많음</span>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">최근 14일 학습량</h2>
        <div className="barchart">
          {last14.map((k) => {
            const n = dayLogs[k]?.reviews ?? 0
            return (
              <div className="barchart-col" key={k} title={`${k} · ${n}문제`}>
                <div className="barchart-bar" style={{ height: `${(n / max14) * 100}%` }} />
              </div>
            )
          })}
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">덱별 진도</h2>
        <ul className="progress-list">
          {ALL_DECKS.map((d) => {
            const s = stats[d]
            return (
              <li key={d}>
                <div className="progress-head">
                  <span>{DECK_LABEL[d]}</span>
                  <span className="hint">
                    {s.learned} / {s.total}
                  </span>
                </div>
                <span className="bar">
                  <span className="bar-fill" style={{ width: `${(s.learned / s.total) * 100}%` }} />
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
