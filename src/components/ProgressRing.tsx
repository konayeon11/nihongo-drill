interface Props {
  ratio: number
  size?: number
  stroke?: number
  children?: React.ReactNode
  tone?: 'primary' | 'flame' | 'hero'
  className?: string
}

export function ProgressRing({
  ratio,
  size = 136,
  stroke = 12,
  children,
  tone = 'primary',
  className,
}: Props) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, ratio))

  return (
    <div className={className ? `ring ${className}` : 'ring'} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className={`ring-bar ring-bar--${tone}`}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  )
}
