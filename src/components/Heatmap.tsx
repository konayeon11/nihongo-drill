import type { DayLog } from '../types'
import { addDays, formatKo, fromKey, today } from '../lib/date'

interface Props {
  dayLogs: Record<string, DayLog>
  weeks?: number
  goal: number
}

function intensity(log: DayLog | undefined, goal: number): 0 | 1 | 2 | 3 | 4 {
  if (!log || log.reviews === 0) return 0
  const r = log.reviews / Math.max(1, goal)
  if (r >= 1.5) return 4
  if (r >= 1) return 3
  if (r >= 0.5) return 2
  return 1
}

/** 잔디 히트맵. 일요일 시작 주 단위로 세로 7칸 */
export function Heatmap({ dayLogs, weeks = 12, goal }: Props) {
  const end = today()
  // 이번 주 토요일까지 채워서 열 정렬을 맞춘다
  const endOfWeek = addDays(end, 6 - fromKey(end).getDay())
  const start = addDays(endOfWeek, -(weeks * 7 - 1))

  const columns: string[][] = []
  for (let w = 0; w < weeks; w++) {
    columns.push(Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)))
  }

  return (
    <div className="heatmap">
      {columns.map((col, i) => (
        <div className="heatmap-col" key={i}>
          {col.map((key) => {
            const future = key > end
            const log = dayLogs[key]
            return (
              <div
                key={key}
                className={`heatmap-cell lv${future ? 0 : intensity(log, goal)}${future ? ' is-future' : ''}`}
                title={`${formatKo(key)} · ${log?.reviews ?? 0}문제`}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
