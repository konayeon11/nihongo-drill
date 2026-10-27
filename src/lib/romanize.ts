/**
 * 가나 → 한글 발음 / 로마자 자동 변환.
 *
 * 수백 개 항목에 한글 발음을 손으로 적지 않고 `kana` 필드에서 생성한다.
 * 정확성이 중요한 여행 회화용 표기이므로, 생성 후 샘플을 사람이 검수한다
 * (data/*.ts 작성 시 발음이 이상하면 이 표를 조정할 것).
 *
 *   - か행·た행: 어두는 평음(가·다), 어중·어말은 격음(카·타) — 외래어 표기법 관례
 *   - つ는 항상 '쓰', ぱ행은 항상 거센소리, が·ざ·だ·ば행은 항상 평음
 *   - ん은 앞 음절 받침 ㄴ, っ은 앞 음절 받침 ㅅ으로 합성
 *   - 장음(ー, お단·う단 뒤의 う)은 따로 표기하지 않음
 */

interface Syl {
  /** 로마자 */
  r: string
  /** 어중·어말 한글 */
  k: string
  /** 어두 한글 (다르면) */
  k0?: string
}

// prettier-ignore
const TABLE: Record<string, Syl> = {
  あ: { r: 'a', k: '아' }, い: { r: 'i', k: '이' }, う: { r: 'u', k: '우' }, え: { r: 'e', k: '에' }, お: { r: 'o', k: '오' },

  か: { r: 'ka', k: '카', k0: '가' }, き: { r: 'ki', k: '키', k0: '기' }, く: { r: 'ku', k: '쿠', k0: '구' },
  け: { r: 'ke', k: '케', k0: '게' }, こ: { r: 'ko', k: '코', k0: '고' },

  さ: { r: 'sa', k: '사' }, し: { r: 'shi', k: '시' }, す: { r: 'su', k: '스' }, せ: { r: 'se', k: '세' }, そ: { r: 'so', k: '소' },

  た: { r: 'ta', k: '타', k0: '다' }, ち: { r: 'chi', k: '치', k0: '지' }, つ: { r: 'tsu', k: '쓰' },
  て: { r: 'te', k: '테', k0: '데' }, と: { r: 'to', k: '토', k0: '도' },

  な: { r: 'na', k: '나' }, に: { r: 'ni', k: '니' }, ぬ: { r: 'nu', k: '누' }, ね: { r: 'ne', k: '네' }, の: { r: 'no', k: '노' },

  は: { r: 'ha', k: '하' }, ひ: { r: 'hi', k: '히' }, ふ: { r: 'fu', k: '후' }, へ: { r: 'he', k: '헤' }, ほ: { r: 'ho', k: '호' },

  ま: { r: 'ma', k: '마' }, み: { r: 'mi', k: '미' }, む: { r: 'mu', k: '무' }, め: { r: 'me', k: '메' }, も: { r: 'mo', k: '모' },

  や: { r: 'ya', k: '야' }, ゆ: { r: 'yu', k: '유' }, よ: { r: 'yo', k: '요' },

  ら: { r: 'ra', k: '라' }, り: { r: 'ri', k: '리' }, る: { r: 'ru', k: '루' }, れ: { r: 're', k: '레' }, ろ: { r: 'ro', k: '로' },

  わ: { r: 'wa', k: '와' }, ゐ: { r: 'i', k: '이' }, ゑ: { r: 'e', k: '에' }, を: { r: 'o', k: '오' },

  が: { r: 'ga', k: '가' }, ぎ: { r: 'gi', k: '기' }, ぐ: { r: 'gu', k: '구' }, げ: { r: 'ge', k: '게' }, ご: { r: 'go', k: '고' },
  ざ: { r: 'za', k: '자' }, じ: { r: 'ji', k: '지' }, ず: { r: 'zu', k: '즈' }, ぜ: { r: 'ze', k: '제' }, ぞ: { r: 'zo', k: '조' },
  だ: { r: 'da', k: '다' }, ぢ: { r: 'ji', k: '지' }, づ: { r: 'zu', k: '즈' }, で: { r: 'de', k: '데' }, ど: { r: 'do', k: '도' },
  ば: { r: 'ba', k: '바' }, び: { r: 'bi', k: '비' }, ぶ: { r: 'bu', k: '부' }, べ: { r: 'be', k: '베' }, ぼ: { r: 'bo', k: '보' },
  ぱ: { r: 'pa', k: '파' }, ぴ: { r: 'pi', k: '피' }, ぷ: { r: 'pu', k: '푸' }, ぺ: { r: 'pe', k: '페' }, ぽ: { r: 'po', k: '포' },

  // 요음
  きゃ: { r: 'kya', k: '캬', k0: '갸' }, きゅ: { r: 'kyu', k: '큐', k0: '규' }, きょ: { r: 'kyo', k: '쿄', k0: '교' },
  しゃ: { r: 'sha', k: '샤' }, しゅ: { r: 'shu', k: '슈' }, しょ: { r: 'sho', k: '쇼' }, しぇ: { r: 'she', k: '셰' },
  ちゃ: { r: 'cha', k: '차', k0: '자' }, ちゅ: { r: 'chu', k: '추', k0: '주' }, ちょ: { r: 'cho', k: '초', k0: '조' },
  ちぇ: { r: 'che', k: '체' },
  にゃ: { r: 'nya', k: '냐' }, にゅ: { r: 'nyu', k: '뉴' }, にょ: { r: 'nyo', k: '뇨' },
  ひゃ: { r: 'hya', k: '햐' }, ひゅ: { r: 'hyu', k: '휴' }, ひょ: { r: 'hyo', k: '효' },
  みゃ: { r: 'mya', k: '먀' }, みゅ: { r: 'myu', k: '뮤' }, みょ: { r: 'myo', k: '묘' },
  りゃ: { r: 'rya', k: '랴' }, りゅ: { r: 'ryu', k: '류' }, りょ: { r: 'ryo', k: '료' },
  ぎゃ: { r: 'gya', k: '갸' }, ぎゅ: { r: 'gyu', k: '규' }, ぎょ: { r: 'gyo', k: '교' },
  じゃ: { r: 'ja', k: '자' }, じゅ: { r: 'ju', k: '주' }, じょ: { r: 'jo', k: '조' }, じぇ: { r: 'je', k: '제' },
  びゃ: { r: 'bya', k: '뱌' }, びゅ: { r: 'byu', k: '뷰' }, びょ: { r: 'byo', k: '뵤' },
  ぴゃ: { r: 'pya', k: '퍄' }, ぴゅ: { r: 'pyu', k: '퓨' }, ぴょ: { r: 'pyo', k: '표' },

  // 외래어(가타카나) 표기용 조합
  ふぁ: { r: 'fa', k: '파' }, ふぃ: { r: 'fi', k: '피' }, ふぇ: { r: 'fe', k: '페' }, ふぉ: { r: 'fo', k: '포' },
  てぃ: { r: 'ti', k: '티' }, でぃ: { r: 'di', k: '디' }, とぅ: { r: 'tu', k: '투' }, どぅ: { r: 'du', k: '두' },
  うぃ: { r: 'wi', k: '위' }, うぇ: { r: 'we', k: '웨' }, うぉ: { r: 'wo', k: '워' },
  ゔぁ: { r: 'va', k: '바' }, ゔぃ: { r: 'vi', k: '비' }, ゔぇ: { r: 've', k: '베' }, ゔぉ: { r: 'vo', k: '보' },
  ゔ: { r: 'vu', k: '부' },
}

/** 가타카나를 히라가나로 (유니코드 블록이 0x60 차이) */
export function toHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}

const JONG_N = 4 // 종성 ㄴ
const JONG_S = 19 // 종성 ㅅ

/** 받침 없는 한글 음절에 종성을 붙인다 (이미 받침이 있으면 null) */
function withJong(syllable: string, jong: number): string | null {
  const code = syllable.charCodeAt(0) - 0xac00
  if (code < 0 || code > 11171 || code % 28 !== 0) return null
  return String.fromCharCode(0xac00 + code + jong)
}

const SMALL_VOWEL = 'ゃゅょぁぃぅぇぉ'
const PUNCT_KR: Record<string, string> = { '、': ', ', '。': '. ', '，': ', ', '！': '!', '？': '?' }

interface Converted {
  kr: string
  romaji: string
}

export function convertKana(input: string): Converted {
  const s = toHiragana(input)
  const kr: string[] = []
  const rj: string[] = []
  let lastVowel = ''
  let atStart = true

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]

    if (ch === ' ' || ch === '　') {
      kr.push(' ')
      rj.push(' ')
      atStart = true
      continue
    }
    if (ch in PUNCT_KR) {
      kr.push(PUNCT_KR[ch])
      rj.push(ch === '、' ? ', ' : '. ')
      atStart = true
      lastVowel = ''
      continue
    }
    if (ch === 'ー') {
      continue // 장음 부호는 표기하지 않음
    }
    if (!/[ぁ-ゖ]/.test(ch)) {
      // 한자·영숫자 등은 그대로 통과 (단어 데이터는 보통 가나만 들어오므로 드문 경우)
      kr.push(ch)
      rj.push(ch)
      atStart = false
      continue
    }

    // 촉음 っ → 앞 음절에 ㅅ 받침, 로마자는 다음 자음 중복
    if (ch === 'っ') {
      const prev = kr[kr.length - 1]
      const merged = prev ? withJong(prev, JONG_S) : null
      if (merged) kr[kr.length - 1] = merged
      const nextPair = s.slice(i + 1, i + 3)
      const nextSyl = TABLE[nextPair] ?? TABLE[s[i + 1]]
      if (nextSyl) rj.push(nextSyl.r[0])
      continue
    }

    // ん → 앞 음절에 ㄴ 받침
    if (ch === 'ん') {
      const prev = kr[kr.length - 1]
      const merged = prev ? withJong(prev, JONG_N) : null
      if (merged) kr[kr.length - 1] = merged
      else kr.push('은')
      rj.push('n')
      lastVowel = ''
      atStart = false
      continue
    }

    // 요음·외래어 조합은 두 글자 조합을 먼저 찾아본다
    const pair = s.slice(i, i + 2)
    const usePair = pair.length === 2 && SMALL_VOWEL.includes(pair[1]) && TABLE[pair]
    const key = usePair ? pair : ch
    const syl = TABLE[key]

    if (!syl) {
      kr.push(ch)
      rj.push(ch)
      atStart = false
      continue
    }

    // 장모음: お단·う단 뒤에 오는 う는 표기하지 않음
    if (ch === 'う' && (lastVowel === 'o' || lastVowel === 'u')) continue

    kr.push(atStart && syl.k0 ? syl.k0 : syl.k)
    rj.push(syl.r)
    lastVowel = syl.r.slice(-1)
    atStart = false
    if (usePair) i += 1
  }

  return { kr: kr.join(''), romaji: rj.join('') }
}

/** 가나(또는 가나가 섞인 문장) → 한글 발음 표기 */
export function toKorean(kana: string): string {
  return convertKana(kana).kr
}

/** 가나 → 로마자 */
export function toRomaji(kana: string): string {
  return convertKana(kana).romaji
}
