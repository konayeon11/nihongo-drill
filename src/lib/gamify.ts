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

export const MAX_STREAK_FREEZES = 3
/** 스트릭이 이만큼(일) 쌓일 때마다 방어권을 하나 더 준다 */
const FREEZE_EARN_EVERY = 7

/**
 * 데일리 목표를 처음 달성한 순간 스트릭을 갱신한다.
 * 전날에 달성했으면 이어지고, 하루라도 비었으면 1부터 다시 시작한다.
 * 7일마다 스트릭 방어권을 하나씩 더 준다 (최대 3개).
 */
export function bumpStreak(user: UserState, date: string = today()): UserState {
  if (user.lastStudyDate === date) return user
  const continued = user.lastStudyDate === addDays(date, -1)
  const streak = continued ? user.streak + 1 : 1
  const earnedFreeze = streak > 0 && streak % FREEZE_EARN_EVERY === 0
  return {
    ...user,
    streak,
    bestStreak: Math.max(user.bestStreak, streak),
    lastStudyDate: date,
    streakFreezes: earnedFreeze
      ? Math.min(MAX_STREAK_FREEZES, user.streakFreezes + 1)
      : user.streakFreezes,
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

export interface FreezeResult {
  user: UserState
  /** 방어권으로 스트릭을 지켰다면 true */
  used: boolean
}

/**
 * 앱을 열었을 때, 어제 하루를 쉬어서 스트릭이 끊길 상황이면
 * 방어권이 있을 경우 자동으로 하나 소모해 스트릭을 이어 붙인다.
 * (정확히 하루 빠졌을 때만 적용 — 이틀 이상 비면 방어권으로도 못 막는다)
 */
export function applyStreakFreeze(user: UserState, date: string = today()): FreezeResult {
  if (!user.lastStudyDate || user.streak === 0 || user.streakFreezes <= 0) {
    return { user, used: false }
  }
  const missedOneDay = user.lastStudyDate === addDays(date, -2)
  if (!missedOneDay) return { user, used: false }

  return {
    user: {
      ...user,
      lastStudyDate: addDays(date, -1),
      streakFreezes: user.streakFreezes - 1,
    },
    used: true,
  }
}
