'use client';

interface RingProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel: string;
}

export function Ring({ value, max = 100, size = 156, stroke = 12, label, sublabel }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));

  return (
    <div className="streak-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle className="ring-bg" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-fg"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
      <div className="center">
        <div>
          <div className="num">{label}</div>
          <small>{sublabel}</small>
        </div>
      </div>
    </div>
  );
}
