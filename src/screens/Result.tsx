import { cardById } from '../data/cards'
import { today } from '../lib/date'
import { effectiveStreak, levelProgress } from '../lib/gamify'
import { Link, navigate } from '../router'
import { useApp } from '../state/AppContext'

export function Result() {
  const { lastSession, user, todayLog } = useApp()

  if (!lastSession) {
    return (
      <div className="screen">
        <p className="hint">표시할 세션 기록이 없어요.</p>
        <Link to="/" className="btn btn--primary btn--lg">
          홈으로
        </Link>
      </div>
    )
  }

  const { answers, xpGained, goalMetNow } = lastSession
  const total = answers.length
  const correct = answers.filter((a) => a.correct).length
  const accuracy = total ? Math.round((correct / total) * 100) : 0
  const minutes = Math.max(1, Math.round((Date.now() - lastSession.startedAt) / 60000))
  const lvl = levelProgress(user.totalXp)

  // 같은 카드를 여러 번 틀렸어도 한 번만 보여준다
  const missed = [...new Set(answers.filter((a) => !a.correct).map((a) => a.cardId))]

  return (
    <div className="screen screen--result">
      <div className="result-hero">
        <p className="result-emoji">{goalMetNow ? '🔥' : accuracy >= 80 ? '🎉' : '💪'}</p>
        <h1 className="result-title">
          {goalMetNow ? `${effectiveStreak(user, today())}일 연속 달성!` : '세션 완료'}
        </h1>
        <p className="result-sub">
          {total}문제 · {minutes}분
        </p>
      </div>

      <div className="result-stats">
        <div className="rstat">
          <span className="rstat-num">{accuracy}%</span>
          <span className="rstat-label">정확도</span>
        </div>
        <div className="rstat">
          <span className="rstat-num">+{xpGained}</span>
          <span className="rstat-label">획득 XP</span>
        </div>
        <div className="rstat">
          <span className="rstat-num">
            {todayLog.reviews}/{user.dailyGoal}
          </span>
          <span className="rstat-label">오늘 목표</span>
        </div>
      </div>

      <div className="card">
        <div className="lvl-row">
          <span>Lv.{lvl.level}</span>
          <span className="lvl-xp">
            {lvl.gained} / {lvl.needed} XP
          </span>
        </div>
        <span className="bar">
          <span className="bar-fill" style={{ width: `${lvl.ratio * 100}%` }} />
        </span>
      </div>

      {missed.length > 0 && (
        <>
          <h2 className="section-title">다시 볼 카드 {missed.length}개</h2>
          <ul className="miss-list">
            {missed.map((id) => {
              const card = cardById.get(id)
              if (!card) return null
              return (
                <li key={id}>
                  <Link to={`/item/${id}`} className="miss">
                    <span className="miss-jp">{card.front}</span>
                    <span className="miss-ko">{card.back}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <div className="result-actions">
        <button className="btn btn--primary btn--lg" onClick={() => navigate('/study', true)}>
          한 세션 더
        </button>
        <Link to="/" className="btn btn--ghost btn--lg">
          홈으로
        </Link>
      </div>
    </div>
  )
}
