/** 로컬 시간대 기준 YYYY-MM-DD */
export function toKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function today(): string {
  return toKey()
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, days: number): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + days)
  return toKey(d)
}

/** a - b (일 단위). a가 더 미래면 양수 */
export function diffDays(a: string, b: string): number {
  const ms = fromKey(a).getTime() - fromKey(b).getTime()
  return Math.round(ms / 86_400_000)
}

export function isDue(due: string, ref: string = today()): boolean {
  return diffDays(due, ref) <= 0
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function weekdayLabel(key: string): string {
  return WEEKDAYS[fromKey(key).getDay()]
}

/** 오늘을 포함한 최근 n일의 키 배열 (과거 → 현재 순) */
export function recentDays(n: number, ref: string = today()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(ref, -(n - 1 - i)))
}

export function formatKo(key: string): string {
  const d = fromKey(key)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}
