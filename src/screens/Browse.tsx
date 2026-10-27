import { useMemo, useState } from 'react'
import type { Deck } from '../types'
import { ALL_DECKS, DECK_LABEL, cardsByDeck } from '../data/cards'
import { MASTERY_LABEL, mastery } from '../lib/srs'
import { Link } from '../router'
import { useApp } from '../state/AppContext'

export function Browse() {
  const { progress, favorites } = useApp()
  const [deck, setDeck] = useState<Deck>('word')
  const [query, setQuery] = useState('')
  const [onlyFav, setOnlyFav] = useState(false)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cardsByDeck[deck].filter((c) => {
      if (onlyFav && !favorites.includes(c.id)) return false
      if (!q) return true
      return c.search.toLowerCase().includes(q)
    })
  }, [deck, query, onlyFav, favorites])

  return (
    <div className="screen">
      <h1 className="page-title">사전</h1>

      <div className="tabs">
        {ALL_DECKS.map((d) => (
          <button key={d} className={d === deck ? 'pill is-on' : 'pill'} onClick={() => setDeck(d)}>
            {DECK_LABEL[d]}
          </button>
        ))}
      </div>

      <div className="search-row">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="일본어 · 読み · 한국어 검색"
        />
        <button
          className={onlyFav ? 'icon-btn is-on' : 'icon-btn'}
          onClick={() => setOnlyFav((v) => !v)}
          aria-label="즐겨찾기만 보기"
        >
          ★
        </button>
      </div>

      <p className="hint">{list.length}개</p>

      <ul className="item-list">
        {list.map((c) => {
          const m = mastery(progress[c.id])
          return (
            <li key={c.id}>
              <Link to={`/item/${c.id}`} className="item">
                <div className="item-main">
                  <span className={c.front.length > 10 ? 'item-jp item-jp--sm' : 'item-jp'}>
                    {c.front}
                  </span>
                  {c.deck !== 'grammar' && <span className="item-reading">{c.reading}</span>}
                  <span className="item-ko">{c.back}</span>
                </div>
                <span className={`mastery m${m}`}>{MASTERY_LABEL[m]}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      {list.length === 0 && <p className="hint">검색 결과가 없어요.</p>}
    </div>
  )
}
