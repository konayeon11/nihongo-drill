import { useMemo } from 'react'
import { courses, unitsByCourse } from '../data/units'
import { Link, navigate } from '../router'
import { useApp } from '../state/AppContext'

export function CourseScreen({ id }: { id: string }) {
  const { progress } = useApp()
  const course = courses.find((c) => c.id === id)
  const unitList = useMemo(() => unitsByCourse(id), [id])

  if (!course) {
    return (
      <div className="screen">
        <p className="hint">코스를 찾을 수 없어요.</p>
        <Link to="/" className="btn btn--ghost">
          홈으로
        </Link>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="detail-head">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label="뒤로">
          ←
        </button>
        <div>
          <p className="eyebrow">{course.tagline}</p>
          <h1 className="page-title" style={{ margin: 0 }}>
            {course.title}
          </h1>
        </div>
      </div>

      <ul className="unit-path">
        {unitList.map((u, i) => {
          const learned = u.cardIds.filter((id) => progress[id] && progress[id].stage !== 'new').length
          const ratio = u.cardIds.length ? learned / u.cardIds.length : 0
          const done = ratio >= 1
          return (
            <li key={u.id}>
              <Link to={`/unit/${u.id}`} className={`unit-node${done ? ' is-done' : ''}`}>
                <span className="unit-step">{i + 1}</span>
                <span className="unit-icon">{u.icon}</span>
                <span className="unit-info">
                  <span className="unit-title">{u.title}</span>
                  <span className="unit-sub">{u.subtitle}</span>
                </span>
                <span className="unit-count">
                  {learned}/{u.cardIds.length}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
