import { useMemo } from 'react'
import { ALL_DECKS, DECK_ICON, DECK_LABEL } from '../data/cards'
import { courses, unitsByCourse } from '../data/units'
import { addDays, today, weekdayLabel } from '../lib/date'
import { effectiveStreak, levelProgress, streakAtRisk } from '../lib/gamify'
import { deckStats, newBudget } from '../lib/session'
import { Link, navigate } from '../router'
import { useApp } from '../state/AppContext'
import { ProgressRing } from '../components/ProgressRing'
import { Mascot, type MascotStage } from '../components/Mascot'

export function Home() {
  const { user, progress, dayLogs, todayLog, freezeNotice, dismissFreezeNotice } = useApp()
  const day = today()

  const stats = useMemo(() => deckStats(progress, day), [progress, day])
  const lvl = levelProgress(user.totalXp)
  const streak = effectiveStreak(user, day)
  const atRisk = streakAtRisk(user, day)

  const dueTotal = user.enabledDecks.reduce((s, d) => s + stats[d].due, 0)
  const freshTotal = user.enabledDecks.reduce((s, d) => s + stats[d].fresh, 0)
  const budget = Math.min(newBudget(user, todayLog.newLearned), freshTotal)
  const available = dueTotal + budget

  const goalRatio = todayLog.reviews / Math.max(1, user.dailyGoal)
  const week = Array.from({ length: 7 }, (_, i) => addDays(day, -(6 - i)))

  const mascotStage: MascotStage = lvl.level >= 10 ? 4 : lvl.level >= 6 ? 3 : lvl.level >= 3 ? 2 : 1
  const mascotMood = todayLog.goalMet ? 'happy' : todayLog.reviews > 0 ? 'neutral' : 'hungry'
  const mascotLine = todayLog.goalMet
    ? '오늘 밥 다 먹었어요! 배불러요 🍚'
    : todayLog.reviews > 0
      ? '조금만 더 먹여주세요!'
      : '배고파요... 오늘 아직 안 먹었어요'

  const courseProgress = useMemo(
    () =>
      courses.map((c) => {
        const cardIds = unitsByCourse(c.id).flatMap((u) => u.cardIds)
        const total = new Set(cardIds).size
        const learned = new Set(
          cardIds.filter((id) => progress[id] && progress[id].stage !== 'new'),
        ).size
        return { course: c, total, learned }
      }),
    [progress],
  )

  return (
    <div className="screen">
      {freezeNotice && (
        <div className="notice notice--freeze" onClick={dismissFreezeNotice}>
          🛡️ 어제는 쉬었지만 스트릭 방어권으로 연속 기록을 지켰어요!
        </div>
      )}

      <header className="home-top">
        <div>
          <p className="eyebrow">일본어 학습</p>
          <h1 className="home-title">오늘도 한 걸음</h1>
        </div>
        <div className="badges">
          <span className={atRisk ? 'badge badge--flame is-risk' : 'badge badge--flame'}>
            <span className="flame-ico">🔥</span> {streak}일
          </span>
          {user.streakFreezes > 0 && (
            <span className="badge badge--freeze" title="스트릭 방어권">
              🛡️ {user.streakFreezes}
            </span>
          )}
          <span className="badge badge--gold">Lv.{lvl.level}</span>
        </div>
      </header>

      <div className="mascot-stage">
        <Mascot stage={mascotStage} mood={mascotMood} size={150} />
        <div className="mascot-bubble">{mascotLine}</div>
      </div>

      <section className="card card--goal">
        <ProgressRing ratio={goalRatio} tone="hero" className="ring--hero">
          <strong className="ring-num">{todayLog.reviews}</strong>
          <span className="ring-sub">/ {user.dailyGoal}문제</span>
        </ProgressRing>

        <div className="goal-meta">
          <p className="goal-state">
            {todayLog.goalMet ? '오늘 목표 달성! 🎉' : atRisk ? '오늘 채우면 스트릭 유지' : '오늘의 목표'}
          </p>
          <dl className="ministats">
            <div>
              <dt>복습 대기</dt>
              <dd>{dueTotal}</dd>
            </div>
            <div>
              <dt>새 카드</dt>
              <dd>{budget}</dd>
            </div>
            <div>
              <dt>정확도</dt>
              <dd>
                {todayLog.reviews ? Math.round((todayLog.correct / todayLog.reviews) * 100) : 0}%
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <button className="btn btn--primary btn--lg" onClick={() => navigate('/study')}>
        {available === 0 ? '오늘 복습은 모두 끝났어요 (더 학습하기)' : `학습 시작 · ${available}문제`}
      </button>
      {available === 0 && freshTotal > 0 && (
        <p className="hint">
          새 카드를 더 보려면 설정에서 &lsquo;하루 신규 카드 수&rsquo;를 늘려 보세요.
        </p>
      )}

      <section className="week">
        {week.map((key) => {
          const log = dayLogs[key]
          const done = log?.goalMet
          const partial = (log?.reviews ?? 0) > 0
          return (
            <div key={key} className="week-day">
              <span className={`dot${done ? ' is-done' : partial ? ' is-partial' : ''}`}>
                {done ? '🔥' : ''}
              </span>
              <span className="week-label">{weekdayLabel(key)}</span>
            </div>
          )
        })}
      </section>

      <h2 className="section-title">코스</h2>
      <div className="course-list">
        {courseProgress.map(({ course, total, learned }) => (
          <Link key={course.id} to={`/course/${course.id}`} className="course-tile">
            <span className="course-icon">{course.icon}</span>
            <span className="course-info">
              <span className="course-title">{course.title}</span>
              <span className="course-tagline">{course.tagline}</span>
              <span className="bar">
                <span className="bar-fill" style={{ width: `${total ? (learned / total) * 100 : 0}%` }} />
              </span>
            </span>
            <span className="course-count">
              {learned}/{total}
            </span>
          </Link>
        ))}
      </div>

      <h2 className="section-title">전체 진도</h2>
      <div className="deck-grid">
        {ALL_DECKS.map((deck) => {
          const s = stats[deck]
          const ratio = s.learned / s.total
          const on = user.enabledDecks.includes(deck)
          const Icon = DECK_ICON[deck]
          return (
            <button
              key={deck}
              className={on ? 'deck' : 'deck is-off'}
              onClick={() => navigate(`/study?deck=${deck}`)}
            >
              <span className="deck-ico">
                <Icon size={18} strokeWidth={2.25} />
              </span>
              <span className="deck-name">{DECK_LABEL[deck]}</span>
              <span className="deck-count">
                {s.learned} / {s.total}
              </span>
              <span className="bar">
                <span className="bar-fill" style={{ width: `${ratio * 100}%` }} />
              </span>
              {s.due > 0 && <span className="deck-due">복습 {s.due}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
