/**
 * 브라우저 내장 음성 합성 래퍼.
 * 일본어 음성이 설치되어 있지 않은 기기도 있으므로 항상 가용성을 먼저 확인한다.
 */

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

let jaVoice: SpeechSynthesisVoice | null = null

function pickVoice() {
  if (!supported) return
  const voices = window.speechSynthesis.getVoices()
  jaVoice =
    voices.find((v) => v.lang === 'ja-JP') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('ja')) ??
    null
}

if (supported) {
  pickVoice()
  // 대부분의 브라우저에서 음성 목록은 비동기로 채워진다
  window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
}

export function ttsSupported(): boolean {
  return supported
}

export function hasJapaneseVoice(): boolean {
  if (!supported) return false
  if (!jaVoice) pickVoice()
  return jaVoice !== null
}

export function speak(text: string, rate = 0.95) {
  if (!supported || !text) return
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'
  u.rate = rate
  if (!jaVoice) pickVoice()
  if (jaVoice) u.voice = jaVoice
  synth.speak(u)
}

export function stopSpeaking() {
  if (supported) window.speechSynthesis.cancel()
}
