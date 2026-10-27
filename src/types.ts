/** 학습 덱 종류 */
export type Deck = 'kana' | 'word' | 'kanji' | 'grammar' | 'phrase'

export type Level = 'N5' | 'kana' | 'basic' | 'travel' | 'hobby'

export interface Example {
  jp: string
  kana: string
  ko: string
}

/** 비슷하게 생겨서 헷갈리는 글자와의 차이 */
export interface Confusion {
  char: string
  note: string
}

export interface KanaItem {
  id: string
  char: string
  romaji: string
  kind: 'hiragana' | 'katakana' | 'dakuten' | 'rule'
  /** 행 이름 (あ행, か행 …) */
  row: string
  /** 글자의 유래·모양 */
  shape: string
  /** 연상 암기법 */
  mnemonic: string
  confuse?: Confusion[]
  /** 탁음·반탁음 변형 */
  dakuten?: string
  /** 2차 과제: 연상 그림 */
  image?: string
  /** rule 카드용 추가 설명 */
  detail?: string
}

export interface WordItem {
  id: string
  jp: string
  kana: string
  ko: string
  pos: string
  /** 상황 테마. 유닛 구성에 참고하지만, 유닛은 cardIds로 직접 큐레이션한다 */
  theme?: string
  level: Level
  tags?: string[]
  example?: Example
}

export interface KanjiItem {
  id: string
  char: string
  meaning: string
  on: string[]
  kun: string[]
  strokes: number
  theme?: string
  level: Level
  examples: Example[]
  /** 간판·표지에서 이 글자를 만나는 맥락 */
  signNote?: string
}

export interface GrammarItem {
  id: string
  pattern: string
  title: string
  explanation: string
  formation: string
  theme?: string
  level: Level
  examples: Example[]
}

export interface PhraseItem {
  id: string
  jp: string
  kana: string
  ko: string
  /** 쓰는 상황 (예: 인사, 식당, 길 묻기) */
  situation: string
  theme?: string
  level: Level
  /** 쓰는 상황에 대한 짧은 팁 */
  tip?: string
}

/** 학습 시점에 모든 덱을 공통으로 정규화한 형태 */
export interface Card {
  id: string
  deck: Deck
  /** 문제로 보여줄 일본어 */
  front: string
  /** 읽는 법 (가나, 가나 카드는 로마자) */
  reading: string
  /** 한글 발음 표기 */
  kr: string
  /** 한국어 뜻 */
  back: string
  /** 품사·테마·획수 등 부가 라벨 */
  sub?: string
  /** 음성으로 읽을 텍스트 */
  ttsText: string
  theme?: string
  level: Level
  /** 검색용 */
  search: string
}

export type Stage = 'new' | 'learning' | 'review'

/** 0 = again, 1 = hard, 2 = good, 3 = easy */
export type Grade = 0 | 1 | 2 | 3

export interface CardProgress {
  cardId: string
  deck: Deck
  ease: number
  /** 복습 간격 (일) */
  interval: number
  reps: number
  lapses: number
  /** 다음 복습 예정일 YYYY-MM-DD */
  due: string
  stage: Stage
  updatedAt: number
}

export interface DayLog {
  /** YYYY-MM-DD */
  date: string
  xp: number
  reviews: number
  correct: number
  newLearned: number
  goalMet: boolean
}

export interface UserState {
  streak: number
  bestStreak: number
  /** 마지막으로 데일리 목표를 달성한 날 */
  lastStudyDate: string | null
  totalXp: number
  /** 하루 목표 문제 수 */
  dailyGoal: number
  /** 하루에 새로 꺼낼 신규 카드 수 */
  newPerDay: number
  enabledDecks: Deck[]
  tts: boolean
  /** 한글 발음 표기 항상 보이기 */
  showKr: boolean
  createdAt: string
}

export type QuizType =
  | 'choice-jp-ko'
  | 'choice-ko-jp'
  | 'listen'
  | 'typing-kana'
  | 'typing-romaji'
  | 'typing-meaning'
  | 'flashcard'
  | 'cloze'

export interface QuizQuestion {
  card: Card
  type: QuizType
  /** 객관식 보기 (정답 포함, 섞인 상태) */
  choices?: string[]
  answer?: string
  /** cloze 전용: 빈칸이 뚫린 예문 */
  prompt?: string
  /** 신규 카드 여부 (XP 계산용) */
  isNew: boolean
}

export interface SessionAnswer {
  cardId: string
  deck: Deck
  correct: boolean
  grade: Grade
  isNew: boolean
}

export type CourseId = 'kana' | 'travel' | 'hobby' | 'base'

export interface Unit {
  id: string
  course: CourseId
  title: string
  subtitle: string
  icon: string
  cardIds: string[]
}

export interface Course {
  id: CourseId
  title: string
  tagline: string
  icon: string
}
