import type { UserState } from '../types'

export interface AchievementCtx {
  user: UserState
  learnedCount: number
  studyDays: number
}

export interface Achievement {
  id: string
  icon: string
  title: string
  desc: string
  done: (ctx: AchievementCtx) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', icon: '🌱', title: '첫 학습', desc: '학습 1회 완료', done: (c) => c.user.totalXp > 0 },
  { id: 'streak7', icon: '🔥', title: '7일 연속', desc: '최고 스트릭 7일', done: (c) => c.user.bestStreak >= 7 },
  { id: 'streak30', icon: '🏆', title: '30일 연속', desc: '최고 스트릭 30일', done: (c) => c.user.bestStreak >= 30 },
  { id: 'streak100', icon: '👑', title: '100일 연속', desc: '최고 스트릭 100일', done: (c) => c.user.bestStreak >= 100 },
  { id: 'cards100', icon: '📘', title: '카드 100개', desc: '100개 학습 시작', done: (c) => c.learnedCount >= 100 },
  { id: 'cards300', icon: '📗', title: '카드 300개', desc: '300개 학습 시작', done: (c) => c.learnedCount >= 300 },
  { id: 'cards600', icon: '📙', title: '카드 600개', desc: '600개 학습 시작', done: (c) => c.learnedCount >= 600 },
  { id: 'lv5', icon: '⭐', title: '레벨 5', desc: '레벨 5 도달', done: (c) => c.user.totalXp >= 50 * (5 - 1) ** 2 },
  { id: 'lv10', icon: '🌟', title: '레벨 10', desc: '레벨 10 도달', done: (c) => c.user.totalXp >= 50 * (10 - 1) ** 2 },
  { id: 'days30', icon: '📅', title: '30일 학습', desc: '누적 학습한 날 30일', done: (c) => c.studyDays >= 30 },
]
