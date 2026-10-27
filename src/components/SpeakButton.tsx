import { speak, ttsSupported } from '../lib/tts'
import { useApp } from '../state/AppContext'

interface Props {
  text: string
  label?: string
  big?: boolean
}

export function SpeakButton({ text, label = '발음 듣기', big = false }: Props) {
  const { user } = useApp()
  if (!ttsSupported() || !user.tts) return null

  return (
    <button
      type="button"
      className={big ? 'speak speak--big' : 'speak'}
      onClick={() => speak(text)}
      aria-label={label}
    >
      <svg viewBox="0 0 24 24" width={big ? 32 : 20} height={big ? 32 : 20} aria-hidden>
        <path
          fill="currentColor"
          d="M4 9v6h3.5l5 4V5l-5 4H4zm12.5-.5a4.5 4.5 0 0 1 0 7v-2a2.5 2.5 0 0 0 0-3v-2zm0-4a8.5 8.5 0 0 1 0 15v-2a6.5 6.5 0 0 0 0-11v-2z"
        />
      </svg>
      {big && <span>발음 듣기</span>}
    </button>
  )
}
