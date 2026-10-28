export type MascotStage = 1 | 2 | 3 | 4
export type MascotMood = 'happy' | 'neutral' | 'hungry'

interface Props {
  stage: MascotStage
  mood: MascotMood
  size?: number
}

/** 단계별 자연스러운 높이 비율 (실제 스프라이트 그림 크기 차이를 그대로 반영) */
const STAGE_HEIGHT_RATIO: Record<MascotStage, number> = { 1: 0.52, 2: 0.7, 3: 0.86, 4: 1 }

const MOOD_LABEL: Record<MascotMood, string> = { happy: '행복', neutral: '보통', hungry: '배고픔' }

/**
 * 도트(픽셀아트) 스타일로 그린 시바견 마스코트 스프라이트.
 * public/assets/mascot/stage{1-4}-{happy|neutral|hungry}.png 12장을 사용한다.
 * stage: 레벨에 따른 성장 단계(1~4), mood: 오늘 학습 여부에 따른 표정.
 */
export function Mascot({ stage, mood, size = 180 }: Props) {
  const src = `/assets/mascot/stage${stage}-${mood}.png`

  return (
    <div
      className={`mascot mascot--${mood}`}
      style={{ width: size, height: size, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <img
        src={src}
        alt={`시바견 ${stage}단계, ${MOOD_LABEL[mood]}`}
        style={{ height: `${STAGE_HEIGHT_RATIO[stage] * 100}%`, width: 'auto' }}
      />
    </div>
  )
}
