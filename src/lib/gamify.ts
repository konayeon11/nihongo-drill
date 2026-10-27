import type { DayLog, UserState } from '../types'
import { addDays, today } from './date'

export const XP_CORRECT = 10
export const XP_WRONG = 2
export const XP_GRADUATE = 15
export const XP_GOAL_BONUS = 50

/** 레벨 n에 도달하는 데 필요한 누적 XP */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) ** 2
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp)
  const start = xpForLevel(level)
  const end = xpForLevel(level + 1)
  const gained = xp - start
  const needed = end - start
  return { level, gained, needed, ratio: needed > 0 ? gained / needed : 0 }
}

export function emptyLog(date: string): DayLog {
  return { date, xp: 0, reviews: 0, correct: 0, newLearned: 0, goalMet: false }
}

/**
 * 데일리 목표를 처음 달성한 순간 스트릭을 갱신한다.
 * 전날에 달성했으면 이어지고, 하루라도 비었으면 1부터 다시 시작한다.
 */
export function bumpStreak(user: UserState, date: string = today()): UserState {
  if (user.lastStudyDate === date) return user
  const continued = user.lastStudyDate === addDays(date, -1)
  const streak = continued ? user.streak + 1 : 1
  return {
    ...user,
    streak,
    bestStreak: Math.max(user.bestStreak, streak),
    lastStudyDate: date,
  }
}

/**
 * 화면에 보여줄 스트릭.
 * 오늘 아직 목표를 못 채웠더라도 어제 채웠다면 스트릭은 살아 있다.
 */
export function effectiveStreak(user: UserState, date: string = today()): number {
  if (!user.lastStudyDate) return 0
  if (user.lastStudyDate === date || user.lastStudyDate === addDays(date, -1)) return user.streak
  return 0
}

/** 오늘 목표를 채우지 않으면 스트릭이 끊기는 상태인지 */
export function streakAtRisk(user: UserState, date: string = today()): boolean {
  return user.lastStudyDate === addDays(date, -1) && user.streak > 0
}
