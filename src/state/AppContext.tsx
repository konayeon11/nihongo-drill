import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Card, CardProgress, DayLog, Grade, SessionAnswer, UserState } from '../types'
import {
  DEFAULT_USER,
  exportBackup,
  importBackup,
  loadSnapshot,
  resetAll,
  saveDayLog,
  saveProgress,
  saveUser,
  setFavorite,
  type Snapshot,
} from '../lib/db'
import { newProgress, schedule } from '../lib/srs'
import { XP_CORRECT, XP_GOAL_BONUS, XP_GRADUATE, XP_WRONG, bumpStreak, emptyLog } from '../lib/gamify'
import { today } from '../lib/date'

export interface SessionSummary {
  answers: SessionAnswer[]
  xpGained: number
  goalMetNow: boolean
  startedAt: number
}

interface AppState {
  ready: boolean
  progress: Record<string, CardProgress>
  dayLogs: Record<string, DayLog>
  user: UserState
  favorites: string[]
  lastSession: SessionSummary | null
}

export interface AnswerResult {
  xp: number
  graduated: boolean
  goalMetNow: boolean
  progress: CardProgress
}

interface AppApi extends AppState {
  todayLog: DayLog
  answer: (card: Card, grade: Grade) => AnswerResult
  updateUser: (patch: Partial<UserState>) => void
  toggleFavorite: (cardId: string) => void
  finishSession: (summary: SessionSummary) => void
  wipe: () => Promise<void>
  download: () => Promise<void>
  restore: (file: File) => Promise<void>
}

const initial: AppState = {
  ready: false,
  progress: {},
  dayLogs: {},
  user: DEFAULT_USER,
  favorites: [],
  lastSession: null,
}

const Ctx = createContext<AppApi | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initial)
  // 액션 안에서 최신 상태를 읽기 위한 거울. setState 업데이터를 순수하게 유지한다.
  const ref = useRef(state)
  ref.current = state

  const apply = useCallback((next: AppState) => {
    ref.current = next
    setState(next)
  }, [])

  useEffect(() => {
    let alive = true
    loadSnapshot().then((snap) => {
      if (alive) apply({ ...ref.current, ...snap, ready: true })
    })
    return () => {
      alive = false
    }
  }, [apply])

  const answer = useCallback(
    (card: Card, grade: Grade): AnswerResult => {
      const prev = ref.current
      const day = today()
      const current = prev.progress[card.id] ?? newProgress(card.id, card.deck, day)
      const wasNew = current.stage === 'new'
      const nextProgress = schedule(current, grade, day)
      const graduated = wasNew && nextProgress.stage === 'review'
      const correct = grade >= 2

      const log: DayLog = { ...(prev.dayLogs[day] ?? emptyLog(day)) }
      log.reviews += 1
      if (correct) log.correct += 1
      if (graduated) log.newLearned += 1

      let xp = correct ? XP_CORRECT : XP_WRONG
      if (graduated) xp += XP_GRADUATE

      let user = prev.user
      const goalMetNow = !log.goalMet && log.reviews >= user.dailyGoal
      if (goalMetNow) {
        log.goalMet = true
        xp += XP_GOAL_BONUS
        user = bumpStreak(user, day)
      }
      log.xp += xp
      user = { ...user, totalXp: user.totalXp + xp }

      apply({
        ...prev,
        progress: { ...prev.progress, [card.id]: nextProgress },
        dayLogs: { ...prev.dayLogs, [day]: log },
        user,
      })

      void saveProgress([nextProgress])
      void saveDayLog(log)
      void saveUser(user)

      return { xp, graduated, goalMetNow, progress: nextProgress }
    },
    [apply],
  )

  const updateUser = useCallback(
    (patch: Partial<UserState>) => {
      const prev = ref.current
      const user = { ...prev.user, ...patch }
      apply({ ...prev, user })
      void saveUser(user)
    },
    [apply],
  )

  const toggleFavorite = useCallback(
    (cardId: string) => {
      const prev = ref.current
      const on = !prev.favorites.includes(cardId)
      const favorites = on ? [...prev.favorites, cardId] : prev.favorites.filter((f) => f !== cardId)
      apply({ ...prev, favorites })
      void setFavorite(cardId, on)
    },
    [apply],
  )

  const finishSession = useCallback(
    (summary: SessionSummary) => {
      apply({ ...ref.current, lastSession: summary })
    },
    [apply],
  )

  const wipe = useCallback(async () => {
    await resetAll()
    apply({ ...initial, ready: true, user: { ...DEFAULT_USER, createdAt: today() } })
    await saveUser({ ...DEFAULT_USER, createdAt: today() })
  }, [apply])

  const download = useCallback(async () => {
    const backup = await exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nihongo-drill-${today()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const restore = useCallback(
    async (file: File) => {
      const snap: Snapshot = await importBackup(JSON.parse(await file.text()))
      apply({ ...ref.current, ...snap, ready: true, lastSession: null })
    },
    [apply],
  )

  const day = today()
  const value: AppApi = {
    ...state,
    todayLog: state.dayLogs[day] ?? emptyLog(day),
    answer,
    updateUser,
    toggleFavorite,
    finishSession,
    wipe,
    download,
    restore,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('AppProvider 안에서만 useApp을 쓸 수 있습니다.')
  return ctx
}
