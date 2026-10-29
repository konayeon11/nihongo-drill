/**
 * 답안 채점용 비교 유틸.
 * 타이핑 테스트는 자기평가보다 효과적이지만, 오타 하나로 오답 처리되면
 * 좌절감을 주므로 한글 뜻은 약간의 오타를 허용한다.
 */

function normalizeKo(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s~\-·.,!?()[\]「」『』"'、。]/g, '')
}

/** 표준 레벤슈타인 거리 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      prev = tmp
    }
  }
  return dp[b.length]
}

/**
 * 한글 뜻 타이핑 채점.
 * 정답에 "크다, 비싸다"처럼 쉼표로 여러 뜻이 적혀 있으면 그중 하나만 맞아도 정답.
 * 짧은 단어는 정확히, 긴 단어는 오타 1~2글자까지 허용한다.
 */
export function fuzzyMatchKo(input: string, answer: string): boolean {
  const norm = normalizeKo(input)
  if (!norm) return false
  const targets = answer
    .split(/[,·\/、]/)
    .map(normalizeKo)
    .filter(Boolean)

  for (const t of targets) {
    if (norm === t) return true
    const tolerance = t.length >= 8 ? 2 : t.length >= 4 ? 1 : 0
    if (levenshtein(norm, t) <= tolerance) return true
  }
  return false
}
