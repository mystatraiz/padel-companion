'use client';

interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
}

export function Icon({ name, size = 18, stroke = 1.6 }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return <svg {...props}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
    case 'calendar':
      return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>;
    case 'stats':
      return <svg {...props}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>;
    case 'racket':
      return <svg {...props}><ellipse cx="10" cy="10" rx="6" ry="7"/><path d="M14.5 14.5L20 20"/><path d="M7 7l6 6M10 4v12M4 10h12"/></svg>;
    case 'user':
      return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
    case 'plus':
      return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'flame':
      return <svg {...props}><path d="M12 3c2 4 5 5 5 9a5 5 0 1 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-2-1-4 1-8z"/></svg>;
    case 'trend-up':
      return <svg {...props}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>;
    case 'trend-down':
      return <svg {...props}><path d="M3 7l6 6 4-4 8 8"/><path d="M14 17h7v-7"/></svg>;
    case 'clock':
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'alert':
      return <svg {...props}><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>;
    case 'shoe':
      return <svg {...props}><path d="M3 16c0-1 1-2 2-2h2l3-5c2 0 3 1 3 3l1 2c2 0 5 1 7 4 1 2 0 3-2 3H4c-1 0-1-1-1-2v-3z"/><path d="M9 14l2-2"/></svg>;
    case 'x':
      return <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'check':
      return <svg {...props}><path d="M5 12l4 4 10-10"/></svg>;
    case 'settings':
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19 13a7 7 0 0 0 0-2l2-2-2-3-3 1a7 7 0 0 0-2-1l-1-3h-3l-1 3a7 7 0 0 0-2 1L4 6 2 9l2 2a7 7 0 0 0 0 2l-2 2 2 3 3-1a7 7 0 0 0 2 1l1 3h3l1-3a7 7 0 0 0 2-1l3 1 2-3z"/></svg>;
    case 'map':
      return <svg {...props}><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>;
    case 'trophy':
      return <svg {...props}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 1 1-10 0V4z"/><path d="M17 5h3v3a3 3 0 0 1-3 3M7 5H4v3a3 3 0 0 0 3 3"/></svg>;
    case 'back':
      return <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'trash':
      return <svg {...props}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>;
    case 'edit':
      return <svg {...props}><path d="M16 3l5 5-12 12H4v-5z"/></svg>;
    case 'bell':
      return <svg {...props}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case 'sun':
      return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case 'moon':
      return <svg {...props}><path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/></svg>;
    case 'logout':
      return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    default:
      return null;
  }
}
