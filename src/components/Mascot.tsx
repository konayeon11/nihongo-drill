export type MascotStage = 1 | 2 | 3 | 4
export type MascotMood = 'happy' | 'neutral' | 'hungry'

interface Props {
  stage: MascotStage
  mood: MascotMood
  size?: number
}

const STAGE_SCALE: Record<MascotStage, number> = { 1: 0.62, 2: 0.78, 3: 0.92, 4: 1.04 }
const FUR = '#e7a15c'
const FUR_DARK = '#d98a3f'
const CREAM = '#fff6ea'

/**
 * 순수 SVG로 그린 시바견 마스코트. 사진·외부 이미지 없이도 "박스 나열" 느낌을 깨고
 * 화면에 바로 떠 있는 캐릭터로 홈 화면 정체성을 준다.
 * stage: 레벨에 따른 성장 단계(1~4), mood: 오늘 학습 여부에 따른 표정.
 */
export function Mascot({ stage, mood, size = 180 }: Props) {
  const scale = STAGE_SCALE[stage]
  const earTilt = mood === 'hungry' ? 18 : 0
  const tailTilt = mood === 'hungry' ? -10 : mood === 'happy' ? 18 : 6

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`mascot mascot--${mood}`}
      role="img"
      aria-label={`시바견 ${stage}단계, ${mood === 'happy' ? '행복' : mood === 'hungry' ? '배고픔' : '보통'}`}
    >
      {/* 그림자 */}
      <ellipse cx="100" cy="182" rx={46 * scale} ry="7" fill="currentColor" opacity="0.1" />

      <g style={{ transformOrigin: '100px 184px', transform: `scale(${scale})` }}>
        {/* 꼬리 */}
        <path
          d="M 150 150 Q 182 140 176 108 Q 172 88 152 96 Q 164 112 150 130 Z"
          fill={FUR}
          style={{ transformOrigin: '152px 140px', transform: `rotate(${tailTilt}deg)`, transition: 'transform 0.3s ease' }}
        />

        {/* 몸통 */}
        <ellipse cx="100" cy="148" rx="46" ry="34" fill={FUR} />
        <ellipse cx="100" cy="158" rx="28" ry="20" fill={CREAM} />

        {/* 뒷다리 */}
        <ellipse cx="72" cy="176" rx="12" ry="8" fill={FUR} />
        <ellipse cx="128" cy="176" rx="12" ry="8" fill={FUR} />
        <ellipse cx="72" cy="180" rx="9" ry="4" fill={CREAM} />
        <ellipse cx="128" cy="180" rx="9" ry="4" fill={CREAM} />

        {/* 머리 */}
        <g style={{ transformOrigin: '100px 95px', transform: mood === 'hungry' ? 'rotate(-4deg) translateY(2px)' : 'none', transition: 'transform 0.3s ease' }}>
          {/* 귀 */}
          <path
            d="M 58 70 Q 48 36 72 46 Q 80 64 72 82 Z"
            fill={FUR_DARK}
            style={{ transformOrigin: '68px 76px', transform: `rotate(${-earTilt}deg)`, transition: 'transform 0.3s ease' }}
          />
          <path
            d="M 142 70 Q 152 36 128 46 Q 120 64 128 82 Z"
            fill={FUR_DARK}
            style={{ transformOrigin: '132px 76px', transform: `rotate(${earTilt}deg)`, transition: 'transform 0.3s ease' }}
          />

          {/* 얼굴 */}
          <circle cx="100" cy="92" r="44" fill={FUR} />
          <ellipse cx="100" cy="104" rx="26" ry="20" fill={CREAM} />

          {/* 볼터치 */}
          <ellipse cx="68" cy="100" rx="7" ry="4.5" fill="#ff9d8a" opacity="0.55" />
          <ellipse cx="132" cy="100" rx="7" ry="4.5" fill="#ff9d8a" opacity="0.55" />

          {/* 눈 */}
          {mood === 'happy' ? (
            <>
              <path d="M 78 88 Q 85 80 92 88" stroke="#2b1a0f" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 108 88 Q 115 80 122 88" stroke="#2b1a0f" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : mood === 'hungry' ? (
            <>
              <circle cx="85" cy="91" r="5.5" fill="#2b1a0f" />
              <circle cx="115" cy="91" r="5.5" fill="#2b1a0f" />
              <circle cx="87" cy="89" r="1.4" fill="#fff" />
              <circle cx="117" cy="89" r="1.4" fill="#fff" />
              <path d="M 76 79 Q 83 83 90 81" stroke="#2b1a0f" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 110 81 Q 117 83 124 79" stroke="#2b1a0f" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 70 98 Q 66 104 69 110" stroke="#8fd3ff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
            </>
          ) : (
            <>
              <circle cx="85" cy="90" r="5" fill="#2b1a0f" />
              <circle cx="115" cy="90" r="5" fill="#2b1a0f" />
              <circle cx="87" cy="88" r="1.6" fill="#fff" />
              <circle cx="117" cy="88" r="1.6" fill="#fff" />
            </>
          )}

          {/* 코·입 */}
          <ellipse cx="100" cy="106" rx="5" ry="3.5" fill="#2b1a0f" />
          {mood === 'hungry' ? (
            <path d="M 92 113 Q 100 119 108 113" stroke="#2b1a0f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M 92 110 Q 100 117 108 110" stroke="#2b1a0f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* 3단계 이상: 목도리 */}
        {stage >= 3 && (
          <path d="M 76 130 Q 100 142 124 130 L 120 140 Q 100 150 80 140 Z" fill="var(--accent)" />
        )}
        {/* 4단계: 반짝임 */}
        {stage >= 4 && (
          <>
            <path d="M 40 60 l 3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#ffd166" />
            <path d="M 162 100 l 2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5 Z" fill="#ffd166" />
          </>
        )}
      </g>
    </svg>
  )
}
