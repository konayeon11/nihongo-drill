import { cardById } from '../data/cards'
import { unitOf } from '../data/units'
import { MASTERY_LABEL, mastery } from '../lib/srs'
import { Link, navigate } from '../router'
import { useApp } from '../state/AppContext'

export function UnitScreen({ id }: { id: string }) {
  const { progress } = useApp()
  const unit = unitOf(id)

  if (!unit) {
    return (
      <div className="screen">
        <p className="hint">유닛을 찾을 수 없어요.</p>
        <Link to="/" className="btn btn--ghost">
          홈으로
        </Link>
      </div>
    )
  }

  const cards = unit.cardIds.map((cid) => cardById.get(cid)).filter((c) => !!c)
  const learned = cards.filter((c) => progress[c.id] && progress[c.id].stage !== 'new').length

  return (
    <div className="screen">
      <div className="detail-head">
        <button className="icon-btn" onClick={() => navigate(`/course/${unit.course}`)} aria-label="뒤로">
          ←
        </button>
        <div>
          <p className="eyebrow">{unit.subtitle}</p>
          <h1 className="page-title" style={{ margin: 0 }}>
            {unit.icon} {unit.title}
          </h1>
        </div>
      </div>

      <p className="hint">
        {learned} / {cards.length}개 학습함
      </p>

      <button
        className="btn btn--primary btn--lg"
        onClick={() => navigate(`/study?unit=${unit.id}`)}
        disabled={cards.length === 0}
      >
        이 유닛 학습 시작
      </button>

      <ul className="item-list">
        {cards.map((c) => {
          const m = mastery(progress[c.id])
          return (
            <li key={c.id}>
              <Link to={`/item/${c.id}`} className="item">
                <div className="item-main">
                  <span className={c.front.length > 10 ? 'item-jp item-jp--sm' : 'item-jp'}>{c.front}</span>
                  {c.deck !== 'grammar' && <span className="item-reading">{c.reading}</span>}
                  <span className="item-ko">{c.back}</span>
                </div>
                <span className={`mastery m${m}`}>{MASTERY_LABEL[m]}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
