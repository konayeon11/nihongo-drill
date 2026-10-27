import type { Course, Unit } from '../types'
import { kanaByKind } from './kana'
import { words, kanji, grammar, phrases } from './cards'

const byTag = (tags: string[]) => words.filter((w) => w.tags?.some((t) => tags.includes(t))).map((w) => w.id)
const byPos = (pos: string) => words.filter((w) => w.pos.includes(pos)).map((w) => w.id)
const byTheme = <T extends { id: string; theme?: string }>(arr: T[], theme: string) =>
  arr.filter((x) => x.theme === theme).map((x) => x.id)
const bySituation = (situation: string) => phrases.filter((p) => p.situation === situation).map((p) => p.id)
const kanaIds = (arr: { id: string }[]) => arr.map((x) => x.id)

const NUM_KANJI = '一二三四五六七八九十百千万円半'.split('')
const numberKanjiIds = kanji.filter((k) => NUM_KANJI.includes(k.char)).map((k) => k.id)
const baseKanjiIds = kanji
  .filter((k) => k.level === 'N5' && !numberKanjiIds.includes(k.id))
  .map((k) => k.id)
const signKanjiIds = [
  'k-061',
  'k-062',
  ...kanji.filter((k) => k.theme === '간판' || k.theme === '온천').map((k) => k.id),
]

const baseGrammarIds = grammar.filter((g) => g.level === 'N5').map((g) => g.id)

const n4KanjiIds = kanji.filter((k) => k.level === 'N4').map((k) => k.id)
const n4GrammarIds = grammar.filter((g) => g.level === 'N4').map((g) => g.id)
const half = <T,>(arr: T[]): [T[], T[]] => {
  const mid = Math.ceil(arr.length / 2)
  return [arr.slice(0, mid), arr.slice(mid)]
}
const [n4Kanji1, n4Kanji2] = half(n4KanjiIds)
const [n4Grammar1, n4Grammar2] = half(n4GrammarIds)

export const courses: Course[] = [
  { id: 'kana', title: '가나 익히기', tagline: '히라가나·가타카나·탁음을 차근차근', icon: 'あ' },
  { id: 'travel', title: '여행 생존 회화', tagline: '인사부터 길 찾기, 주문, 쇼핑까지', icon: '✈' },
  { id: 'hobby', title: '취미 생활', tagline: '골프·뜨개질·온천·미술관에서 쓰는 말', icon: '⛳' },
  { id: 'base', title: '기초 다지기', tagline: '가족·시간·신체 같은 기본 어휘와 문법', icon: '基' },
  { id: 'n4', title: 'N4로 넓히기', tagline: 'N5 다음 단계, 한 걸음 더 깊은 일본어', icon: 'N4' },
]

export const units: Unit[] = [
  // ── 가나 익히기 ──────────────────────────────
  {
    id: 'u-kana-1',
    course: 'kana',
    title: '히라가나 1',
    subtitle: 'あ・か・さ・た・な행',
    icon: 'あ',
    cardIds: kanaIds(kanaByKind.hiragana.slice(0, 25)),
  },
  {
    id: 'u-kana-2',
    course: 'kana',
    title: '히라가나 2',
    subtitle: 'は・ま・や・ら・わ행',
    icon: 'は',
    cardIds: kanaIds(kanaByKind.hiragana.slice(25)),
  },
  {
    id: 'u-kana-3',
    course: 'kana',
    title: '탁음·반탁음',
    subtitle: 'が・ざ・だ・ば・ぱ행',
    icon: 'が',
    cardIds: kanaIds(kanaByKind.dakuten),
  },
  {
    id: 'u-kana-4',
    course: 'kana',
    title: '가타카나 1',
    subtitle: 'ア・カ・サ・タ・ナ행',
    icon: 'ア',
    cardIds: kanaIds(kanaByKind.katakana.slice(0, 25)),
  },
  {
    id: 'u-kana-5',
    course: 'kana',
    title: '가타카나 2',
    subtitle: 'ハ・マ・ヤ・ラ・ワ행',
    icon: 'ハ',
    cardIds: kanaIds(kanaByKind.katakana.slice(25)),
  },

  // ── 여행 생존 회화 ───────────────────────────
  {
    id: 'u-travel-1',
    course: 'travel',
    title: '인사',
    subtitle: '만나고 헤어질 때 하는 말',
    icon: '🙇',
    cardIds: [...bySituation('인사')],
  },
  {
    id: 'u-travel-2',
    course: 'travel',
    title: '감사·사과',
    subtitle: '고마울 때, 미안할 때',
    icon: '🙏',
    cardIds: [...bySituation('감사·사과')],
  },
  {
    id: 'u-travel-3',
    course: 'travel',
    title: '자기소개',
    subtitle: '이름, 국적, 취미 말하기',
    icon: '😊',
    cardIds: [...bySituation('자기소개')],
  },
  {
    id: 'u-travel-4',
    course: 'travel',
    title: '길 찾기·교통',
    subtitle: '역, 버스, 길 묻기',
    icon: '🚉',
    cardIds: [
      ...bySituation('길 묻기'),
      ...byTag(['교통', '방향']),
      'g-013',
      'g-014',
      'g-015',
      'g-017',
    ],
  },
  {
    id: 'u-travel-5',
    course: 'travel',
    title: '식당·주문',
    subtitle: '메뉴 고르고 주문하기',
    icon: '🍜',
    cardIds: [
      ...bySituation('식당'),
      ...byTag(['음식', '음료']),
      'g-024',
      'g-025',
      'g-033',
      'g-034',
    ],
  },
  {
    id: 'u-travel-6',
    course: 'travel',
    title: '쇼핑',
    subtitle: '가격 묻고 계산하기',
    icon: '🛍',
    cardIds: [...bySituation('쇼핑'), ...byTag(['물건']), 'g-023'],
  },
  {
    id: 'u-travel-7',
    course: 'travel',
    title: '숫자·돈',
    subtitle: '숫자 읽고 환전하기',
    icon: '💴',
    cardIds: [
      ...numberKanjiIds,
      'w-254',
      'w-255',
      'w-256',
      'w-257',
      'w-258',
      ...bySituation('숫자·돈'),
    ],
  },
  {
    id: 'u-travel-8',
    course: 'travel',
    title: '숙소·여행 실무',
    subtitle: '체크인, 예약, 환전',
    icon: '🏨',
    cardIds: byTheme(words, '여행실무'),
  },
  {
    id: 'u-travel-9',
    course: 'travel',
    title: '곤란할 때',
    subtitle: '아프거나 길을 잃었을 때',
    icon: '🆘',
    cardIds: [...byTheme(words, '곤란할때'), ...bySituation('곤란할때'), 'p-055'],
  },
  {
    id: 'u-travel-10',
    course: 'travel',
    title: '소통 기본 표현',
    subtitle: '못 알아들었을 때 쓰는 말',
    icon: '💬',
    cardIds: [...bySituation('소통'), 'g-026', 'g-028', 'g-029'],
  },
  {
    id: 'u-travel-11',
    course: 'travel',
    title: '간판 읽기',
    subtitle: '화장실·주차장·금연 표지',
    icon: '🚻',
    cardIds: signKanjiIds,
  },

  // ── 취미 생활 ───────────────────────────────
  {
    id: 'u-hobby-1',
    course: 'hobby',
    title: '골프',
    subtitle: '라운딩에서 쓰는 말',
    icon: '⛳',
    cardIds: [...byTheme(words, '골프'), ...bySituation('골프')],
  },
  {
    id: 'u-hobby-2',
    course: 'hobby',
    title: '뜨개질·수예',
    subtitle: '실·바늘 사고 고르기',
    icon: '🧶',
    cardIds: [...byTheme(words, '뜨개질'), ...bySituation('뜨개질')],
  },
  {
    id: 'u-hobby-3',
    course: 'hobby',
    title: '온천',
    subtitle: '탕에 들어가기 전에',
    icon: '♨',
    cardIds: [...byTheme(words, '온천'), 'k-122', ...bySituation('온천')],
  },
  {
    id: 'u-hobby-4',
    course: 'hobby',
    title: '미술관·공연',
    subtitle: '전시·공연 관람하기',
    icon: '🎨',
    cardIds: [...byTheme(words, '미술관공연'), ...bySituation('미술관공연')],
  },

  // ── 기초 다지기 ──────────────────────────────
  {
    id: 'u-base-1',
    course: 'base',
    title: '가족·사람',
    subtitle: '가족 호칭, 직업',
    icon: '👪',
    cardIds: byTag(['가족', '사람', '직업']),
  },
  {
    id: 'u-base-2',
    course: 'base',
    title: '시간·요일',
    subtitle: '날짜와 시간 표현',
    icon: '🕐',
    cardIds: byTag(['시간', '요일']),
  },
  {
    id: 'u-base-3',
    course: 'base',
    title: '신체·자연',
    subtitle: '몸, 날씨, 동식물',
    icon: '🌿',
    cardIds: byTag(['신체', '날씨', '자연', '동물']),
  },
  {
    id: 'u-base-4',
    course: 'base',
    title: '생활 물건',
    subtitle: '집 안 물건들',
    icon: '🏠',
    cardIds: byTag(['물건', '집']),
  },
  {
    id: 'u-base-5',
    course: 'base',
    title: '기본 동사',
    subtitle: '자주 쓰는 동사',
    icon: '🏃',
    cardIds: byPos('동사'),
  },
  {
    id: 'u-base-6',
    course: 'base',
    title: '기본 형용사',
    subtitle: '상태·감정 표현',
    icon: '😀',
    cardIds: byPos('형용사'),
  },
  {
    id: 'u-base-7',
    course: 'base',
    title: '부사·의문사',
    subtitle: '문장을 꾸미는 말',
    icon: '❓',
    cardIds: byTag(['부사', '의문사', '접속사']),
  },
  {
    id: 'u-base-8',
    course: 'base',
    title: '숫자 한자',
    subtitle: '一二三부터 돈 단위까지',
    icon: '一',
    cardIds: numberKanjiIds,
  },
  {
    id: 'u-base-9',
    course: 'base',
    title: '기초 한자',
    subtitle: '자주 보이는 N5 한자',
    icon: '漢',
    cardIds: baseKanjiIds,
  },
  {
    id: 'u-base-10',
    course: 'base',
    title: '기초 문법',
    subtitle: '문장을 만드는 기본 규칙',
    icon: '文',
    cardIds: baseGrammarIds,
  },

  // ── N4로 넓히기 ──────────────────────────────
  {
    id: 'u-n4-1',
    course: 'n4',
    title: 'N4 단어 1',
    subtitle: '감정·상태 표현',
    icon: '😌',
    cardIds: byTag(['N4감정']),
  },
  {
    id: 'u-n4-2',
    course: 'n4',
    title: 'N4 단어 2',
    subtitle: '동사·행동 표현',
    icon: '🏃',
    cardIds: byTag(['N4동사']),
  },
  {
    id: 'u-n4-3',
    course: 'n4',
    title: 'N4 단어 3',
    subtitle: '형용사·부사·기타',
    icon: '📝',
    cardIds: byTag(['N4형용사', 'N4부사', 'N4기타']),
  },
  {
    id: 'u-n4-4',
    course: 'n4',
    title: 'N4 한자 1',
    subtitle: '생활·장소·동작',
    icon: '漢',
    cardIds: n4Kanji1,
  },
  {
    id: 'u-n4-5',
    course: 'n4',
    title: 'N4 한자 2',
    subtitle: '상태·날씨·사회',
    icon: '漢',
    cardIds: n4Kanji2,
  },
  {
    id: 'u-n4-6',
    course: 'n4',
    title: 'N4 문법 1',
    subtitle: '가능·의무·추측',
    icon: '文',
    cardIds: n4Grammar1,
  },
  {
    id: 'u-n4-7',
    course: 'n4',
    title: 'N4 문법 2',
    subtitle: '조건·수동·사역·수수',
    icon: '文',
    cardIds: n4Grammar2,
  },
]

export function unitsByCourse(course: string): Unit[] {
  return units.filter((u) => u.course === course)
}

export function unitOf(id: string): Unit | undefined {
  return units.find((u) => u.id === id)
}

/**
 * 카드가 세션에서 섞여 나올 때 "어느 분야(유닛)"에서 왔는지 보여주기 위한 역색인.
 * 한 카드가 여러 유닛에 속할 수 있으므로 가장 먼저 매칭되는 유닛(= units 배열의 앞쪽,
 * 더 구체적인 코스 순서)을 대표 라벨로 쓴다.
 */
export const unitTitleByCard: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const u of units) {
    for (const id of u.cardIds) {
      if (!map[id]) map[id] = u.title
    }
  }
  return map
})()
