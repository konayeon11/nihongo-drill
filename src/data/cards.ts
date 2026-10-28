import { BookOpen, MessageCircle, PenTool, Puzzle, Type, type LucideIcon } from 'lucide-react'
import type { Card, Deck } from '../types'
import { toKorean } from '../lib/romanize'
import { kana } from './kana'
import { words } from './words'
import { kanji } from './kanji'
import { grammar } from './grammar'
import { phrases } from './phrases'

export { kana, words, kanji, grammar, phrases }

export const DECK_LABEL: Record<Deck, string> = {
  kana: '가나',
  word: '단어',
  kanji: '한자',
  grammar: '문법',
  phrase: '회화',
}

export const DECK_ICON: Record<Deck, LucideIcon> = {
  kana: Type,
  word: BookOpen,
  kanji: PenTool,
  grammar: Puzzle,
  phrase: MessageCircle,
}

export const ALL_DECKS: Deck[] = ['kana', 'word', 'kanji', 'grammar', 'phrase']

const KANA_KIND_LABEL: Record<string, string> = {
  hiragana: '히라가나',
  katakana: '가타카나',
  dakuten: '탁음·반탁음',
}

const kanaCards: Card[] = kana.map((n) => ({
  id: n.id,
  deck: 'kana',
  front: n.char,
  reading: n.romaji,
  back: n.romaji,
  kr: toKorean(n.char),
  sub: `${n.row} · ${KANA_KIND_LABEL[n.kind] ?? n.kind}`,
  ttsText: n.char,
  level: 'kana',
  search: [n.char, n.romaji, n.row].join(' '),
}))

const wordCards: Card[] = words.map((w) => ({
  id: w.id,
  deck: 'word',
  front: w.jp,
  reading: w.kana,
  back: w.ko,
  kr: toKorean(w.kana),
  sub: w.pos,
  ttsText: w.jp,
  theme: w.theme,
  level: w.level,
  search: [w.jp, w.kana, w.ko, w.pos, ...(w.tags ?? [])].join(' '),
}))

const kanjiCards: Card[] = kanji.map((k) => {
  const ttsText = k.examples[0]?.jp ?? k.char
  return {
    id: k.id,
    deck: 'kanji',
    front: k.char,
    reading: [
      k.on.length ? `음독 ${k.on.join('・')}` : '',
      k.kun.length ? `훈독 ${k.kun.join('・')}` : '',
    ]
      .filter(Boolean)
      .join('  /  '),
    back: k.meaning,
    kr: toKorean(k.examples[0]?.kana ?? ''),
    sub: `${k.strokes}획`,
    ttsText,
    theme: k.theme,
    level: k.level,
    search: [k.char, k.meaning, ...k.on, ...k.kun, ...k.examples.map((e) => e.jp)].join(' '),
  }
})

const grammarCards: Card[] = grammar.map((g) => {
  const ex = g.examples[0]
  return {
    id: g.id,
    deck: 'grammar',
    front: g.pattern,
    reading: g.formation,
    back: g.title,
    kr: toKorean(ex?.kana ?? ''),
    sub: '문법',
    ttsText: ex?.jp ?? g.pattern,
    theme: g.theme,
    level: g.level,
    search: [g.pattern, g.title, g.formation, g.explanation].join(' '),
  }
})

const phraseCards: Card[] = phrases.map((p) => ({
  id: p.id,
  deck: 'phrase',
  front: p.jp,
  reading: p.kana,
  back: p.ko,
  kr: toKorean(p.kana),
  sub: p.situation,
  ttsText: p.jp,
  theme: p.theme ?? p.situation,
  level: p.level,
  search: [p.jp, p.kana, p.ko, p.situation].join(' '),
}))

export const allCards: Card[] = [
  ...kanaCards,
  ...wordCards,
  ...kanjiCards,
  ...grammarCards,
  ...phraseCards,
]

export const cardById = new Map<string, Card>(allCards.map((c) => [c.id, c]))

export const cardsByDeck: Record<Deck, Card[]> = {
  kana: kanaCards,
  word: wordCards,
  kanji: kanjiCards,
  grammar: grammarCards,
  phrase: phraseCards,
}

export type SourceLookup =
  | { kind: 'kana'; item: (typeof kana)[number] | undefined }
  | { kind: 'word'; item: (typeof words)[number] | undefined }
  | { kind: 'kanji'; item: (typeof kanji)[number] | undefined }
  | { kind: 'grammar'; item: (typeof grammar)[number] | undefined }
  | { kind: 'phrase'; item: (typeof phrases)[number] | undefined }

/** 상세 화면에서 원본 데이터를 찾기 위한 조회 */
export function findSource(id: string): SourceLookup | null {
  if (id.startsWith('kn-')) return { kind: 'kana', item: kana.find((n) => n.id === id) }
  if (id.startsWith('w-')) return { kind: 'word', item: words.find((w) => w.id === id) }
  if (id.startsWith('k-')) return { kind: 'kanji', item: kanji.find((k) => k.id === id) }
  if (id.startsWith('g-')) return { kind: 'grammar', item: grammar.find((g) => g.id === id) }
  if (id.startsWith('p-')) return { kind: 'phrase', item: phrases.find((p) => p.id === id) }
  return null
}
