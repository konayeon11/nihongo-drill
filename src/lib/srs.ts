import type { CardProgress, Deck, Grade } from '../types'
import { addDays, today } from './date'

export const DEFAULT_EASE = 2.5
const MIN_EASE = 1.3
const MAX_EASE = 2.8
const MAX_INTERVAL = 365

/** 졸업 간격 (일) */
const GRADUATE_GOOD = 1
const GRADUATE_EASY = 3

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** 복습이 같은 날에 몰리지 않도록 ±5% 흔들기 */
function fuzz(interval: number): number {
  if (interval < 4) return interval
  const spread = Math.max(1, Math.round(interval * 0.05))
  return interval + Math.floor(Math.random() * (spread * 2 + 1)) - spread
}

export function newProgress(cardId: string, deck: Deck, ref: string = today()): CardProgress {
  return {
    cardId,
    deck,
    ease: DEFAULT_EASE,
    interval: 0,
    reps: 0,
    lapses: 0,
    due: ref,
    stage: 'new',
    updatedAt: Date.now(),
  }
}

/**
 * SM-2 간소화 버전.
 * 신규·학습 단계 카드는 good 이상을 받으면 졸업해서 복습 큐로 넘어가고,
 * again을 받으면 다시 학습 단계로 돌아간다.
 */
export function schedule(p: CardProgress, grade: Grade, ref: string = today()): CardProgress {
  const next: CardProgress = { ...p, reps: p.reps + 1, updatedAt: Date.now() }

  if (p.stage === 'new' || p.stage === 'learning') {
    if (grade === 0) {
      next.stage = 'learning'
      next.interval = 0
      next.due = ref
      next.lapses = p.stage === 'new' ? p.lapses : p.lapses + 1
      next.ease = clamp(p.ease - 0.2, MIN_EASE, MAX_EASE)
      return next
    }
    if (grade === 1) {
      next.stage = 'learning'
      next.interval = 0
      next.due = ref
      return next
    }
    // good / easy → 졸업
    const base = grade === 3 ? GRADUATE_EASY : GRADUATE_GOOD
    next.stage = 'review'
    next.interval = p.lapses > 0 ? GRADUATE_GOOD : base
    next.due = addDays(ref, next.interval)
    return next
  }

  // 복습 단계
  if (grade === 0) {
    next.stage = 'learning'
    next.interval = 0
    next.due = ref
    next.lapses = p.lapses + 1
    next.ease = clamp(p.ease - 0.2, MIN_EASE, MAX_EASE)
    return next
  }

  let interval: number
  if (grade === 1) {
    next.ease = clamp(p.ease - 0.15, MIN_EASE, MAX_EASE)
    interval = Math.max(1, Math.round(p.interval * 1.2))
  } else if (grade === 2) {
    interval = Math.max(1, Math.round(p.interval * p.ease))
  } else {
    next.ease = clamp(p.ease + 0.15, MIN_EASE, MAX_EASE)
    interval = Math.max(1, Math.round(p.interval * p.ease * 1.3))
  }

  next.interval = clamp(fuzz(interval), 1, MAX_INTERVAL)
  next.due = addDays(ref, next.interval)
  return next
}

/** 객관식 자동 채점 → 평가 등급 */
export function gradeFromCorrect(correct: boolean): Grade {
  return correct ? 2 : 0
}

/** 0 미학습 · 1 학습중 · 2 익숙 · 3 숙련 · 4 완성 */
export type Mastery = 0 | 1 | 2 | 3 | 4

export function mastery(p?: CardProgress): Mastery {
  if (!p || p.stage === 'new') return 0
  if (p.stage === 'learning' || p.interval < 1) return 1
  if (p.interval < 7) return 2
  if (p.interval < 30) return 3
  return 4
}

export const MASTERY_LABEL: Record<Mastery, string> = {
  0: '미학습',
  1: '학습 중',
  2: '익숙',
  3: '숙련',
  4: '완성',
}

/** 다음 복습까지 남은 기간을 사람이 읽을 수 있게 */
export function intervalLabel(days: number): string {
  if (days <= 0) return '오늘'
  if (days === 1) return '1일 후'
  if (days < 30) return `${days}일 후`
  if (days < 365) return `${Math.round(days / 30)}개월 후`
  return `${Math.round(days / 365)}년 후`
}
