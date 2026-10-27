import { useState } from 'react'

/**
 * 화면 안에 그리는 히라가나 전용 입력판.
 * 기기에 일본어 자판이 없어도 탭으로 가나를 입력할 수 있게 한다.
 */

const SEION = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', '', 'ゆ', '', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', '', 'ん', '', 'を'],
]

const DAKUON = [
  ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
  ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
  ['だ', 'ぢ', 'づ', 'で', 'ど'],
  ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
  ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
  ['ゃ', 'ゅ', 'ょ', 'っ', 'ー'],
]

interface Props {
  value: string
  onChange: (next: string) => void
}

export function KanaKeypad({ value, onChange }: Props) {
  const [tab, setTab] = useState<'seion' | 'dakuon'>('seion')
  const rows = tab === 'seion' ? SEION : DAKUON

  return (
    <div className="keypad">
      <div className="keypad-tabs">
        <button
          type="button"
          className={tab === 'seion' ? 'pill is-on' : 'pill'}
          onClick={() => setTab('seion')}
        >
          あ행
        </button>
        <button
          type="button"
          className={tab === 'dakuon' ? 'pill is-on' : 'pill'}
          onClick={() => setTab('dakuon')}
        >
          が행・작은글자
        </button>
        <button type="button" className="pill" onClick={() => onChange(value.slice(0, -1))}>
          ⌫
        </button>
        <button type="button" className="pill" onClick={() => onChange('')}>
          지우기
        </button>
      </div>
      <div className="keypad-grid">
        {rows.flat().map((ch, i) =>
          ch ? (
            <button key={i} type="button" className="key" onClick={() => onChange(value + ch)}>
              {ch}
            </button>
          ) : (
            <span key={i} className="key key--empty" />
          ),
        )}
      </div>
    </div>
  )
}
