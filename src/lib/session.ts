import type { Card, CardProgress, Deck, QuizQuestion, QuizType, UserState } from '../types'
import { ALL_DECKS, allCards, cardsByDeck, grammar } from '../data/cards'
import { isDue, today } from './date'
export { normalizeKana, kanaEqual, fuzzyMatchKo } from './match'

export const SESSION_SIZE = 15

/** 가나(히라가나·가타카나)를 다 배우기 전까지 세션에서 차지하는 비중 */
const KANA_PRIORITY_RATIO = 0.7

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type ProgressMap = Record<string, CardProgress>

export interface DeckStat {
  total: number
  due: number
  fresh: number
  learned: number
}

export function deckStats(progress: ProgressMap, ref: string = today()): Record<Deck, DeckStat> {
  const out = {} as Record<Deck, DeckStat>
  for (const deck of ALL_DECKS) {
    const cards = cardsByDeck[deck]
    let due = 0
    let fresh = 0
    let learned = 0
    for (const c of cards) {
      const p = progress[c.id]
      if (!p || p.stage === 'new') fresh++
      else {
        learned++
        if (isDue(p.due, ref)) due++
      }
    }
    out[deck] = { total: cards.length, due, fresh, learned }
  }
  return out
}

/** 오늘 꺼낼 수 있는 신규 카드 수 */
export function newBudget(user: UserState, newLearnedToday: number): number {
  return Math.max(0, user.newPerDay - newLearnedToday)
}

function dueCards(progress: ProgressMap, decks: Deck[], ref: string): Card[] {
  return decks
    .flatMap((d) => cardsByDeck[d])
    .filter((c) => {
      const p = progress[c.id]
      return p && p.stage !== 'new' && isDue(p.due, ref)
    })
}

function freshCards(progress: ProgressMap, decks: Deck[]): Card[] {
  return decks.flatMap((d) => cardsByDeck[d]).filter((c) => {
    const p = progress[c.id]
    return !p || p.stage === 'new'
  })
}

/** 신규 카드를 복습 카드 사이에 고르게 끼워 넣는다 */
function interleave(review: Card[], fresh: Card[]): Card[] {
  if (!fresh.length) return review
  if (!review.length) return fresh
  const out: Card[] = []
  const gap = Math.max(1, Math.round(review.length / fresh.length))
  let fi = 0
  review.forEach((c, i) => {
    out.push(c)
    if (fi < fresh.length && (i + 1) % gap === 0) out.push(fresh[fi++])
  })
  while (fi < fresh.length) out.push(fresh[fi++])
  return out
}

export interface QueueOptions {
  progress: ProgressMap
  user: UserState
  newLearnedToday: number
  ref?: string
  size?: number
  /** 특정 덱만 학습 (사전 화면에서 바로 시작할 때) */
  deck?: Deck
  /** 복습 기한과 무관하게 특정 카드만 연습 */
  cardIds?: string[]
  /** 하루 신규 카드 한도를 오늘만 임시로 늘려서 더 꺼내온다 (설정값 자체는 바뀌지 않음) */
  extraNew?: number
}

export function buildQueue(opts: QueueOptions): QuizQuestion[] {
  const { progress, user, newLearnedToday } = opts
  const ref = opts.ref ?? today()
  const size = opts.size ?? SESSION_SIZE
  const decks = opts.deck ? [opts.deck] : user.enabledDecks.length ? user.enabledDecks : ALL_DECKS

  let picked: Card[]
  if (opts.cardIds?.length) {
    const set = new Set(opts.cardIds)
    picked = shuffle(allCards.filter((c) => set.has(c.id))).slice(0, size)
  } else {
    const effectiveUser = opts.extraNew ? { ...user, newPerDay: user.newPerDay + opts.extraNew } : user
    const totalBudget = Math.min(newBudget(effectiveUser, newLearnedToday), size)

    const restDecks = decks.filter((d) => d !== 'kana')
    // 단어 등 다른 덱은 가나를 읽을 줄 알아야 하므로, 가나를 아직 다 배우지 않았다면
    // (신규 가나 카드가 남아 있다면) 가나 70% · 나머지 30%로 편성한다
    const kanaUnfinished = decks.includes('kana') && freshCards(progress, ['kana']).length > 0

    if (kanaUnfinished && restDecks.length > 0) {
      const kanaSize = Math.round(size * KANA_PRIORITY_RATIO)
      const restSize = size - kanaSize
      const kanaBudget = Math.min(totalBudget, kanaSize)
      const restBudget = Math.max(0, totalBudget - kanaBudget)

      const kanaPicked = pickFromDecks(progress, ['kana'], ref, kanaSize, kanaBudget)
      const restPicked = pickFromDecks(progress, restDecks, ref, restSize, restBudget)
      picked = shuffle([...kanaPicked, ...restPicked])

      // 가나·나머지 덱 모두 카드가 부족해 목표 개수를 못 채웠다면, 남는 덱에서 더 채운다
      if (picked.length < size) {
        const pickedIds = new Set(picked.map((c) => c.id))
        const leftover = shuffle(dueCards(progress, decks, ref)).filter((c) => !pickedIds.has(c.id))
        picked = [...picked, ...leftover].slice(0, size)
      }
    } else {
      picked = pickFromDecks(progress, decks, ref, size, totalBudget)
    }
  }

  return picked.map((card) => makeQuestion(card, progress[card.id]))
}

function pickFromDecks(
  progress: ProgressMap,
  decks: Deck[],
  ref: string,
  size: number,
  budget: number,
): Card[] {
  const review = shuffle(dueCards(progress, decks, ref))
  const fresh = shuffle(freshCards(progress, decks)).slice(0, budget)
  return interleave(review, fresh).slice(0, size)
}

/** 오늘 더 꺼내올 수 있는 신규 카드가 남아 있는지 (한도 때문에 못 꺼내온 것인지 판단용) */
export function hasMoreFreshBeyondBudget(
  progress: ProgressMap,
  user: UserState,
  deck?: Deck,
): boolean {
  const decks = deck ? [deck] : user.enabledDecks.length ? user.enabledDecks : ALL_DECKS
  return freshCards(progress, decks).length > 0
}

// ── 문제 생성 ────────────────────────────────────

function canType(card: Card): boolean {
  return card.deck === 'word' && card.reading.length > 0 && card.reading !== card.front
}

/**
 * 복습 횟수(reps)가 늘수록 "고르기"보다 "타이핑"(능동 회상) 비중을 높인다.
 * 배열에 같은 유형을 여러 번 넣어 추첨 가중치를 준다.
 * reps 0(첫 노출)은 테스트가 아니라 학습용 플래시카드로 고정한다.
 */
function typesFor(card: Card, reps: number): QuizType[] {
  if (reps === 0) return ['flashcard']

  switch (card.deck) {
    case 'kana':
      if (reps === 1) return ['choice-jp-ko', 'choice-ko-jp']
      return ['choice-jp-ko', 'choice-jp-ko', 'choice-ko-jp', 'listen']
    case 'word': {
      if (reps === 1) return ['choice-jp-ko', 'choice-ko-jp']
      const t: QuizType[] = ['typing-meaning', 'typing-meaning', 'choice-jp-ko', 'listen']
      if (canType(card)) t.push('typing-kana', 'typing-kana')
      return t
    }
    case 'kanji':
      if (reps === 1) return ['choice-jp-ko', 'choice-ko-jp']
      return ['typing-meaning', 'typing-meaning', 'choice-jp-ko', 'listen']
    case 'phrase':
      // 문장은 통째로 외워 타이핑하기보다 듣기·선택형으로 인식하는 게 맞는 난이도다.
      if (reps === 1) return ['choice-jp-ko', 'listen']
      return ['choice-jp-ko', 'listen', 'listen', 'flashcard']
    case 'grammar':
      // 문법 패턴명은 사람마다 표현이 달라 타이핑 채점이 애매하므로 선택형 위주로 유지
      return reps === 1 ? ['cloze', 'choice-ko-jp'] : ['cloze', 'choice-ko-jp', 'flashcard']
    default:
      return ['flashcard']
  }
}

function distractors(card: Card, field: 'front' | 'back', count: number): string[] {
  const pool = cardsByDeck[card.deck].filter((c) => c.id !== card.id && c[field] !== card[field])
  const out: string[] = []
  const seen = new Set<string>([card[field]])
  for (const c of shuffle(pool)) {
    const v = c[field]
    if (seen.has(v)) continue
    seen.add(v)
    out.push(v)
    if (out.length === count) break
  }
  return out
}

/** 문법 패턴에서 예문에 실제로 등장하는 조각을 찾아낸다 */
function clozeKey(pattern: string, sentence: string): string | null {
  const tokens = pattern
    .split(/[～・／/\s()（）+＋]/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .sort((a, b) => b.length - a.length)
  for (const t of tokens) {
    if (sentence.includes(t)) return t
  }
  return null
}

export function makeQuestion(card: Card, p?: CardProgress): QuizQuestion {
  const reps = p?.reps ?? 0
  const isNew = !p || p.stage === 'new'
  const candidates = typesFor(card, reps)
  let type = candidates[Math.floor(Math.random() * candidates.length)]

  if (type === 'cloze') {
    const g = grammar.find((x) => x.id === card.id)
    const ex = g?.examples.find((e) => clozeKey(g.pattern, e.jp))
    if (g && ex) {
      const key = clozeKey(g.pattern, ex.jp)!
      const prompt = ex.jp.replace(key, '＿＿＿')
      const wrong = shuffle(grammar.filter((x) => x.id !== g.id)).slice(0, 3).map((x) => x.pattern)
      return {
        card,
        type: 'cloze',
        prompt,
        answer: g.pattern,
        choices: shuffle([g.pattern, ...wrong]),
        isNew,
      }
    }
    type = 'flashcard'
  }

  if (type === 'choice-jp-ko' || type === 'listen') {
    const wrong = distractors(card, 'back', 3)
    if (wrong.length < 3) return { card, type: 'flashcard', isNew }
    return { card, type, answer: card.back, choices: shuffle([card.back, ...wrong]), isNew }
  }

  if (type === 'choice-ko-jp') {
    const wrong = distractors(card, 'front', 3)
    if (wrong.length < 3) return { card, type: 'flashcard', isNew }
    return { card, type, answer: card.front, choices: shuffle([card.front, ...wrong]), isNew }
  }

  if (type === 'typing-kana') {
    return { card, type, answer: card.reading, isNew }
  }

  if (type === 'typing-meaning') {
    return { card, type, answer: card.back, isNew }
  }

  return { card, type: 'flashcard', isNew }
}

export const TYPE_PROMPT: Record<QuizType, string> = {
  'choice-jp-ko': '뜻을 고르세요',
  'choice-ko-jp': '알맞은 일본어를 고르세요',
  listen: '잘 듣고 뜻을 고르세요',
  'typing-kana': '읽는 법을 히라가나로 입력하세요',
  'typing-meaning': '뜻을 한글로 입력하세요',
  flashcard: '뜻을 떠올린 뒤 확인하세요',
  cloze: '빈칸에 들어갈 문법을 고르세요',
}
