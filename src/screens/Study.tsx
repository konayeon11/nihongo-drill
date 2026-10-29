import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Deck, Grade, QuizQuestion, SessionAnswer } from '../types'
import { DECK_LABEL, findSource } from '../data/cards'
import { unitOf, unitTitleByCard } from '../data/units'
import { TYPE_PROMPT, buildQueue, hasMoreFreshBeyondBudget, makeQuestion } from '../lib/session'
import { fuzzyMatchKo, kanaEqual } from '../lib/match'
import { intervalLabel } from '../lib/srs'
import { speak, ttsSupported } from '../lib/tts'
import { navigate } from '../router'
import { useApp } from '../state/AppContext'
import { SpeakButton } from '../components/SpeakButton'
import { KanaKeypad } from '../components/KanaKeypad'

const MAX_REQUEUE = 2
/** 오답 재시험과 별개로, 정답을 맞혀도 아직 충분히 숙련되지 않은 카드는
 * 같은 세션 안에서 더 어려운 유형으로 한 번 더 테스트한다 (예: 선택형 → 타이핑). */
const MAX_REINFORCE = 2
const REINFORCE_BELOW_REPS = 3

interface Feedback {
  correct: boolean
  grade: Grade
  xp: number
  nextIn: number
}

export function Study({ deck, unitId }: { deck?: string; unitId?: string }) {
  const app = useApp()
  const { answer, finishSession, progress, user, todayLog } = app
  const unit = unitId ? unitOf(unitId) : undefined

  const [queue, setQueue] = useState<QuizQuestion[]>([])
  const [empty, setEmpty] = useState(false)
  const [extraNew, setExtraNew] = useState(0)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const answersRef = useRef<SessionAnswer[]>([])
  const xpRef = useRef(0)
  const goalRef = useRef(false)
  const requeues = useRef<Record<string, number>>({})
  const reinforced = useRef<Record<string, number>>({})
  const startedAt = useRef(Date.now())
  const planned = useRef(0)

  // 세션은 진입 시점에 한 번만 구성한다 (답을 맞힐 때마다 재구성되면 안 된다)
  useEffect(() => {
    const built = buildQueue({
      progress,
      user,
      newLearnedToday: todayLog.newLearned,
      deck: deck as Deck | undefined,
      cardIds: unit?.cardIds,
      size: unit ? Math.min(40, unit.cardIds.length) : undefined,
    })
    planned.current = built.length
    setQueue(built)
    if (built.length === 0) setEmpty(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMore = useCallback(() => {
    const extra = extraNew + 10
    const built = buildQueue({
      progress,
      user,
      newLearnedToday: todayLog.newLearned,
      deck: deck as Deck | undefined,
      extraNew: extra,
    })
    setExtraNew(extra)
    planned.current = built.length
    setQueue(built)
    setIndex(0)
    setEmpty(built.length === 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraNew])

  const q = queue[index]

  useEffect(() => {
    if (q?.type === 'listen' && user.tts && ttsSupported()) speak(q.card.ttsText)
  }, [q, user.tts])

  // 정답을 맞혔을 때, 문제 유형 때문에 화면에 읽는 법/음성이 안 나왔더라도
  // 확인할 수 있도록 정답 음성을 자동으로 들려준다.
  useEffect(() => {
    if (feedback?.correct && q?.card.ttsText && user.tts && ttsSupported()) speak(q.card.ttsText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback])

  const source = useMemo(() => (q ? findSource(q.card.id) : null), [q])

  const example = useMemo(() => {
    if (!source?.item) return null
    const item = source.item as { example?: { jp: string; kana: string; ko: string }; examples?: { jp: string; kana: string; ko: string }[] }
    return item.example ?? item.examples?.[0] ?? null
  }, [source])

  const commit = useCallback(
    (grade: Grade, correct: boolean) => {
      if (!q || feedback) return
      const res = answer(q.card, grade)
      answersRef.current.push({
        cardId: q.card.id,
        deck: q.card.deck,
        correct,
        grade,
        isNew: q.isNew,
      })
      xpRef.current += res.xp
      if (res.goalMetNow) goalRef.current = true

      if (grade === 0) {
        const used = requeues.current[q.card.id] ?? 0
        if (used < MAX_REQUEUE) {
          requeues.current[q.card.id] = used + 1
          setQueue((prev) => [...prev, makeQuestion(q.card, res.progress)])
        }
      } else {
        // 정답이어도 아직 복습 횟수가 적은 카드는 같은 세션 안에서 더 어려운
        // 유형으로 한 번 더 테스트해서, 첫날에도 선택형→타이핑까지 이어지게 한다.
        const done = reinforced.current[q.card.id] ?? 0
        if (done < MAX_REINFORCE && res.progress.reps < REINFORCE_BELOW_REPS) {
          reinforced.current[q.card.id] = done + 1
          setQueue((prev) => [...prev, makeQuestion(q.card, res.progress)])
        }
      }

      setFeedback({ correct, grade, xp: res.xp, nextIn: res.progress.interval })
    },
    [answer, feedback, q],
  )

  const next = useCallback(() => {
    if (index + 1 >= queue.length) {
      finishSession({
        answers: answersRef.current,
        xpGained: xpRef.current,
        goalMetNow: goalRef.current,
        startedAt: startedAt.current,
      })
      navigate('/result', true)
      return
    }
    setFeedback(null)
    setPicked(null)
    setTyped('')
    setRevealed(false)
    setIndex(index + 1)
  }, [index, queue.length, finishSession])

  if (empty) {
    const canLoadMore = !unit && hasMoreFreshBeyondBudget(progress, user, deck as Deck | undefined)
    return (
      <div className="screen">
        <p className="result-emoji">🙌</p>
        <h1 className="page-title">이 범위는 오늘 다 끝냈어요</h1>
        <p className="hint">
          {canLoadMore
            ? '하루 신규 카드 수(설정값)를 다 썼어요. 더 하고 싶으면 아래에서 오늘만 10개씩 추가로 꺼내올 수 있어요.'
            : '복습 예정일이 아직 안 됐어요. 내일 다시 와주세요.'}
        </p>
        {canLoadMore && (
          <button className="btn btn--primary btn--lg" onClick={loadMore}>
            신규 카드 10개 더 학습하기
          </button>
        )}
        <div className="btn-row">
          <button className="btn btn--ghost" onClick={() => navigate('/', true)}>
            홈으로
          </button>
          <button className="btn btn--ghost" onClick={() => navigate('/settings')}>
            설정으로
          </button>
        </div>
      </div>
    )
  }

  if (!q) return <div className="screen"><p className="hint">세션을 준비하고 있어요…</p></div>

  const total = Math.max(queue.length, planned.current)
  const isChoice = q.type === 'choice-jp-ko' || q.type === 'choice-ko-jp' || q.type === 'listen' || q.type === 'cloze'

  const onPick = (choice: string) => {
    if (feedback) return
    setPicked(choice)
    commit(choice === q.answer ? 2 : 0, choice === q.answer)
  }

  const onSubmitTyping = () => {
    if (feedback || !typed.trim()) return
    const ok =
      q.type === 'typing-meaning'
        ? fuzzyMatchKo(typed, q.answer ?? '')
        : kanaEqual(typed, q.answer ?? '')
    commit(ok ? 2 : 0, ok)
  }

  const showReading =
    (q.type === 'flashcard' ? revealed : true) && q.card.deck !== 'kanji' && q.type !== 'typing-kana'

  return (
    <div className="screen screen--study">
      <div className="study-head">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label="학습 종료">
          ✕
        </button>
        <div className="progress">
          <span style={{ width: `${(index / total) * 100}%` }} />
        </div>
        <span className="study-count">
          {index + 1}/{total}
        </span>
      </div>

      <div className="qmeta">
        <span className="chip">{DECK_LABEL[q.card.deck]}</span>
        {unitTitleByCard[q.card.id] && (
          <span className="chip chip--unit">{unitTitleByCard[q.card.id]}</span>
        )}
        {q.isNew && <span className="chip chip--new">새 카드</span>}
        <span className="qprompt">{TYPE_PROMPT[q.type]}</span>
      </div>

      <div className="qbody" key={index}>
        {q.type === 'listen' ? (
          <div className="listen-box">
            <button className="speak speak--huge" onClick={() => speak(q.card.ttsText)} aria-label="다시 듣기">
              🔊
            </button>
            {feedback && (
              <>
                <p className="jp jp--md">{q.card.front}</p>
                <p className="reading">{q.card.reading}</p>
              </>
            )}
          </div>
        ) : q.type === 'cloze' ? (
          <p className="jp jp--sm">{q.prompt}</p>
        ) : q.type === 'choice-ko-jp' ? (
          <p className="ko-prompt">{q.card.back}</p>
        ) : (
          <>
            <p className={q.card.front.length > 8 ? 'jp jp--sm' : 'jp'}>{q.card.front}</p>
            {showReading && (
              <p className="reading">
                {q.card.reading}
                {user.showKr && q.card.kr && q.card.deck !== 'kana' && (
                  <span className="kr"> · {q.card.kr}</span>
                )}
              </p>
            )}
            {q.type !== 'typing-kana' && q.card.deck !== 'kana' && <SpeakButton text={q.card.ttsText} />}
          </>
        )}

        {q.type === 'flashcard' && revealed && (
          <div className="reveal">
            {q.card.deck === 'kanji' && (
              <p className="reading reading--block">
                {q.card.reading}
                {user.showKr && q.card.kr && <span className="kr"> · {q.card.kr}</span>}
              </p>
            )}
            <p className="meaning">{q.card.back}</p>
            {q.card.sub && q.card.deck === 'grammar' && <p className="formation">{q.card.reading}</p>}
            {example && (
              <div className="example">
                <p className="example-jp">{example.jp}</p>
                <p className="example-kana">{example.kana}</p>
                <p className="example-ko">{example.ko}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isChoice && (
        <div className="choices">
          {q.choices?.map((c) => {
            const isAnswer = c === q.answer
            const state = !feedback ? '' : isAnswer ? ' is-right' : c === picked ? ' is-wrong' : ' is-dim'
            return (
              <button key={c} className={`choice${state}`} onClick={() => onPick(c)} disabled={!!feedback}>
                {c}
              </button>
            )
          })}
        </div>
      )}

      {q.type === 'typing-kana' && (
        <div className="typing">
          <input
            className="input input--kana"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmitTyping()}
            placeholder="ひらがな"
            autoComplete="off"
            autoCapitalize="off"
            disabled={!!feedback}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          {!feedback && <KanaKeypad value={typed} onChange={setTyped} />}
          {!feedback && (
            <button className="btn btn--primary" onClick={onSubmitTyping} disabled={!typed.trim()}>
              확인
            </button>
          )}
        </div>
      )}

      {q.type === 'typing-meaning' && (
        <div className="typing">
          <input
            className="input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmitTyping()}
            placeholder="한글로 뜻을 입력하세요"
            autoComplete="off"
            disabled={!!feedback}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          {!feedback && (
            <button className="btn btn--primary btn--lg" onClick={onSubmitTyping} disabled={!typed.trim()}>
              확인
            </button>
          )}
        </div>
      )}

      {q.type === 'flashcard' && !revealed && (
        <button className="btn btn--primary btn--lg" onClick={() => setRevealed(true)}>
          {q.isNew ? '뜻 확인하기' : '뜻 보기'}
        </button>
      )}

      {q.type === 'flashcard' && revealed && !feedback && q.isNew && (
        <button className="btn btn--primary btn--lg" onClick={() => commit(2, true)}>
          외웠어요 · 다음
        </button>
      )}

      {q.type === 'flashcard' && revealed && !feedback && !q.isNew && (
        <div className="grades">
          <button className="grade grade--again" onClick={() => commit(0, false)}>
            다시
            <small>곧 다시</small>
          </button>
          <button className="grade grade--hard" onClick={() => commit(1, true)}>
            어려움
          </button>
          <button className="grade grade--good" onClick={() => commit(2, true)}>
            좋음
          </button>
          <button className="grade grade--easy" onClick={() => commit(3, true)}>
            쉬움
          </button>
        </div>
      )}

      {feedback && (
        <div className={feedback.correct ? 'feedback is-right' : 'feedback is-wrong'}>
          <div className="feedback-main">
            <strong>{feedback.correct ? '정답!' : '아쉬워요'}</strong>
            <span className="feedback-xp">+{feedback.xp} XP</span>
          </div>
          {feedback.correct && (q.card.deck !== 'grammar' ? q.card.reading : example) && (
            <p className="feedback-reading">
              {q.card.deck === 'grammar'
                ? example && (
                    <>
                      {example.jp}
                      <span className="kr"> · {example.kana}</span>
                    </>
                  )
                : (
                    <>
                      {q.card.reading}
                      {user.showKr && q.card.kr && q.card.deck !== 'kana' && (
                        <span className="kr"> · {q.card.kr}</span>
                      )}
                    </>
                  )}
              {ttsSupported() && user.tts && (
                <button
                  type="button"
                  className="speak speak--inline"
                  onClick={() => speak(q.card.ttsText)}
                  aria-label="다시 듣기"
                >
                  🔊
                </button>
              )}
            </p>
          )}
          {!feedback.correct && (
            <p className="feedback-answer">
              {q.card.front}
              {q.card.reading && q.card.deck !== 'grammar' ? ` (${q.card.reading}` : ''}
              {q.card.reading && q.card.deck !== 'grammar' && user.showKr && q.card.kr && q.card.deck !== 'kana'
                ? ` · ${q.card.kr}`
                : ''}
              {q.card.reading && q.card.deck !== 'grammar' ? ')' : ''} — {q.card.back}
            </p>
          )}
          <p className="feedback-next">다음 복습: {intervalLabel(feedback.nextIn)}</p>
          <button className="btn btn--primary btn--lg" onClick={next}>
            계속
          </button>
        </div>
      )}
    </div>
  )
}
