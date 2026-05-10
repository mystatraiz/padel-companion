'use client';

export function RacketSVG() {
  return (
    <svg width="100" height="100" viewBox="0 0 120 120" fill="none">
      <ellipse cx="48" cy="48" rx="32" ry="38" stroke="var(--ink)" strokeWidth="2" fill="var(--bg-soft)" />
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => (
          <circle key={`${r}-${c}`} cx={30 + c * 12} cy={26 + r * 11} r="1.4" fill="var(--ink-faint)" />
        ))
      )}
      <rect x="68" y="70" width="6" height="32" rx="2" transform="rotate(-45 71 86)" fill="var(--ink)" />
    </svg>
  );
}
