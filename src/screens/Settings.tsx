import { useRef, useState } from 'react'
import type { Deck } from '../types'
import { ALL_DECKS, DECK_LABEL } from '../data/cards'
import { hasJapaneseVoice, speak, ttsSupported } from '../lib/tts'
import { useApp } from '../state/AppContext'

const GOALS = [10, 20, 30, 50]
const NEW_PER_DAY = [5, 10, 15, 20]

export function Settings() {
  const { user, updateUser, download, restore, wipe } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [confirmWipe, setConfirmWipe] = useState(false)

  const toggleDeck = (deck: Deck) => {
    const on = user.enabledDecks.includes(deck)
    const next = on ? user.enabledDecks.filter((d) => d !== deck) : [...user.enabledDecks, deck]
    if (next.length === 0) {
      setMsg('덱은 최소 하나는 켜 두어야 해요.')
      return
    }
    updateUser({ enabledDecks: next })
  }

  const onRestore = async (file: File) => {
    try {
      await restore(file)
      setMsg('백업을 복원했어요.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '복원에 실패했어요.')
    }
  }

  return (
    <div className="screen">
      <h1 className="page-title">설정</h1>

      <section className="card">
        <h2 className="card-title">하루 목표</h2>
        <div className="tabs">
          {GOALS.map((g) => (
            <button
              key={g}
              className={user.dailyGoal === g ? 'pill is-on' : 'pill'}
              onClick={() => updateUser({ dailyGoal: g })}
            >
              {g}문제
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">하루 신규 카드 수</h2>
        <div className="tabs">
          {NEW_PER_DAY.map((n) => (
            <button
              key={n}
              className={user.newPerDay === n ? 'pill is-on' : 'pill'}
              onClick={() => updateUser({ newPerDay: n })}
            >
              {n}개
            </button>
          ))}
        </div>
        <p className="hint">너무 많이 꺼내면 복습이 쌓여요. 10개 전후를 권장합니다.</p>
      </section>

      <section className="card">
        <h2 className="card-title">학습할 덱</h2>
        <div className="tabs">
          {ALL_DECKS.map((d) => (
            <button
              key={d}
              className={user.enabledDecks.includes(d) ? 'pill is-on' : 'pill'}
              onClick={() => toggleDeck(d)}
            >
              {DECK_LABEL[d]}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">음성</h2>
        <label className="switch">
          <input
            type="checkbox"
            checked={user.tts}
            onChange={(e) => updateUser({ tts: e.target.checked })}
          />
          <span>발음 듣기 사용</span>
        </label>
        {!ttsSupported() ? (
          <p className="hint">이 브라우저는 음성 합성을 지원하지 않아요.</p>
        ) : !hasJapaneseVoice() ? (
          <p className="hint">
            기기에 일본어 음성이 없는 것 같아요. 시스템 설정에서 일본어 음성을 추가하면 들을 수 있습니다.
          </p>
        ) : (
          <button className="btn btn--ghost" onClick={() => speak('こんにちは。日本語を勉強しましょう。')}>
            음성 테스트
          </button>
        )}
      </section>

      <section className="card">
        <h2 className="card-title">한글 발음 표기</h2>
        <label className="switch">
          <input
            type="checkbox"
            checked={user.showKr}
            onChange={(e) => updateUser({ showKr: e.target.checked })}
          />
          <span>읽는 법 옆에 한글 발음 같이 보기</span>
        </label>
        <p className="hint">음성이 바로 안 들릴 때 참고할 수 있는 보조 표기입니다. (예: おちゃ → 오차)</p>
      </section>

      <section className="card">
        <h2 className="card-title">데이터</h2>
        <p className="hint">
          학습 기록은 이 브라우저에만 저장됩니다. 기기를 바꾸거나 브라우저 데이터를 지우기 전에
          백업해 두세요.
        </p>
        <div className="btn-row">
          <button className="btn btn--ghost" onClick={() => void download()}>
            내보내기
          </button>
          <button className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
            가져오기
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onRestore(f)
            e.target.value = ''
          }}
        />
        {!confirmWipe ? (
          <button className="btn btn--danger" onClick={() => setConfirmWipe(true)}>
            모든 기록 초기화
          </button>
        ) : (
          <div className="btn-row">
            <button
              className="btn btn--danger"
              onClick={async () => {
                await wipe()
                setConfirmWipe(false)
                setMsg('모든 기록을 지웠어요.')
              }}
            >
              정말 초기화
            </button>
            <button className="btn btn--ghost" onClick={() => setConfirmWipe(false)}>
              취소
            </button>
          </div>
        )}
        {msg && <p className="notice">{msg}</p>}
      </section>

      <p className="hint footer-note">
        학습 시작일 {user.createdAt} · 누적 {user.totalXp} XP
      </p>
    </div>
  )
}
