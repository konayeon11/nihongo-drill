import type { GrammarItem, KanaItem, KanjiItem, PhraseItem, WordItem } from '../types'
import { DECK_LABEL, cardById, findSource } from '../data/cards'
import { diffDays, today } from '../lib/date'
import { MASTERY_LABEL, intervalLabel, mastery } from '../lib/srs'
import { Link, navigate } from '../router'
import { useApp } from '../state/AppContext'
import { SpeakButton } from '../components/SpeakButton'

function Examples({ items }: { items: { jp: string; kana: string; ko: string }[] }) {
  if (!items.length) return null
  return (
    <section className="card">
      <h2 className="card-title">예문</h2>
      <ul className="example-list">
        {items.map((e, i) => (
          <li key={i}>
            <div className="example-row">
              <p className="example-jp">{e.jp}</p>
              <SpeakButton text={e.jp} />
            </div>
            <p className="example-kana">{e.kana}</p>
            <p className="example-ko">{e.ko}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Detail({ id }: { id: string }) {
  const { progress, favorites, toggleFavorite, user } = useApp()
  const card = cardById.get(id)
  const source = findSource(id)

  if (!card || !source?.item) {
    return (
      <div className="screen">
        <p className="hint">카드를 찾을 수 없어요.</p>
        <Link to="/browse" className="btn btn--ghost">
          사전으로
        </Link>
      </div>
    )
  }

  const p = progress[id]
  const m = mastery(p)
  const fav = favorites.includes(id)

  return (
    <div className="screen">
      <div className="detail-head">
        <button className="icon-btn" onClick={() => navigate('/browse')} aria-label="뒤로">
          ←
        </button>
        <span className="chip">{DECK_LABEL[card.deck]}</span>
        <button
          className={fav ? 'icon-btn is-on' : 'icon-btn'}
          onClick={() => toggleFavorite(id)}
          aria-label="즐겨찾기"
        >
          ★
        </button>
      </div>

      <section className="card card--hero">
        <p className={card.front.length > 10 ? 'jp jp--sm' : 'jp'}>{card.front}</p>
        {card.deck !== 'grammar' && (
          <p className="reading reading--block">
            {card.reading}
            {user.showKr && card.kr && card.deck !== 'kana' && <span className="kr"> · {card.kr}</span>}
          </p>
        )}
        {card.deck !== 'kana' && <p className="meaning">{card.back}</p>}
        {card.sub && <p className="hint">{card.sub}</p>}
        <SpeakButton text={card.ttsText} big />
      </section>

      <section className="card srs-card">
        <div className="srs-row">
          <span className={`mastery m${m}`}>{MASTERY_LABEL[m]}</span>
          <span className="hint">
            {p
              ? `다음 복습 ${intervalLabel(diffDays(p.due, today()))} · 복습 ${p.reps}회`
              : '아직 학습하지 않았어요'}
          </span>
        </div>
      </section>

      {source.kind === 'kana' && (
        <section className="card">
          {(source.item as KanaItem).image && (
            <img
              className="mnemonic-img"
              src={`${import.meta.env.BASE_URL}${(source.item as KanaItem).image}`}
              alt={`${card.front} 연상 이미지`}
            />
          )}
          <h2 className="card-title">글자 유래</h2>
          <p className="body">{(source.item as KanaItem).shape}</p>
          <h2 className="card-title">외우는 법</h2>
          <p className="body">{(source.item as KanaItem).mnemonic}</p>
          {(source.item as KanaItem).confuse && (source.item as KanaItem).confuse!.length > 0 && (
            <>
              <h2 className="card-title">헷갈리는 글자</h2>
              <ul className="confuse-list">
                {(source.item as KanaItem).confuse!.map((c) => (
                  <li key={c.char}>
                    <span className="confuse-char">{c.char}</span>
                    <span className="confuse-note">{c.note}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {source.kind === 'kanji' && (
        <>
          <section className="card">
            <h2 className="card-title">읽기</h2>
            <dl className="kv">
              <div>
                <dt>음독</dt>
                <dd>{(source.item as KanjiItem).on.join('・') || '—'}</dd>
              </div>
              <div>
                <dt>훈독</dt>
                <dd>{(source.item as KanjiItem).kun.join('・') || '—'}</dd>
              </div>
              <div>
                <dt>획수</dt>
                <dd>{(source.item as KanjiItem).strokes}획</dd>
              </div>
            </dl>
          </section>
          <Examples items={(source.item as KanjiItem).examples} />
        </>
      )}

      {source.kind === 'grammar' && (
        <>
          <section className="card">
            <h2 className="card-title">설명</h2>
            <p className="body">{(source.item as GrammarItem).explanation}</p>
            <h2 className="card-title">접속 형태</h2>
            <p className="formation">{(source.item as GrammarItem).formation}</p>
          </section>
          <Examples items={(source.item as GrammarItem).examples} />
        </>
      )}

      {source.kind === 'word' && (
        <Examples items={(source.item as WordItem).example ? [(source.item as WordItem).example!] : []} />
      )}

      {source.kind === 'phrase' && (
        <section className="card">
          <h2 className="card-title">상황</h2>
          <p className="body">{(source.item as PhraseItem).situation}</p>
        </section>
      )}
    </div>
  )
}
