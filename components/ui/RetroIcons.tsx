// System 7/8 style SVG icons

export const RETRO_ICONS: Record<string, string> = {
  calendar: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="28" height="25" rx="2" fill="white" stroke="black" stroke-width="1.5"/>
    <rect x="2" y="4" width="28" height="8" rx="2" fill="#CC0000"/>
    <rect x="2" y="10" width="28" height="2" fill="#CC0000"/>
    <rect x="8" y="2" width="3" height="5" rx="1" fill="#333"/>
    <rect x="21" y="2" width="3" height="5" rx="1" fill="#333"/>
    <text x="16" y="26" text-anchor="middle" font-family="Chicago,Arial" font-size="10" font-weight="bold" fill="black">17</text>
  </svg>`,

  notes: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="20" height="28" fill="white" stroke="black" stroke-width="1.5"/>
    <path d="M24 2 l4 4 v24 H8 v-2 H28 V6 Z" fill="#ddd" stroke="black" stroke-width="1"/>
    <path d="M24 2 v4 h4" fill="none" stroke="black" stroke-width="1.5"/>
    <line x1="8" y1="10" x2="22" y2="10" stroke="#888" stroke-width="1"/>
    <line x1="8" y1="14" x2="22" y2="14" stroke="#888" stroke-width="1"/>
    <line x1="8" y1="18" x2="18" y2="18" stroke="#888" stroke-width="1"/>
  </svg>`,

  settings: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="6" fill="white" stroke="black" stroke-width="1.5"/>
    <circle cx="16" cy="16" r="2.5" fill="black"/>
    ${[0,45,90,135,180,225,270,315].map(a => {
      const r = a * Math.PI / 180;
      const x1 = 16 + Math.cos(r) * 8;
      const y1 = 16 + Math.sin(r) * 8;
      const x2 = 16 + Math.cos(r) * 11;
      const y2 = 16 + Math.sin(r) * 11;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="black" stroke-width="2.5" stroke-linecap="round"/>`;
    }).join('')}
  </svg>`,

  solitaire: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="3" width="18" height="26" rx="2" fill="white" stroke="black" stroke-width="1.5"/>
    <rect x="10" y="6" width="18" height="26" rx="2" fill="#CC0000" stroke="black" stroke-width="1.5"/>
    <text x="19" y="22" text-anchor="middle" font-family="Georgia" font-size="14" fill="white">♠</text>
  </svg>`,

  terminal: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="28" height="24" rx="1" fill="#1a1a1a" stroke="black" stroke-width="1.5"/>
    <rect x="2" y="4" width="28" height="5" rx="1" fill="#444"/>
    <circle cx="7" cy="6.5" r="1.5" fill="#ff5f56"/>
    <circle cx="12" cy="6.5" r="1.5" fill="#ffbd2e"/>
    <circle cx="17" cy="6.5" r="1.5" fill="#27c93f"/>
    <text x="6" y="20" font-family="Courier New" font-size="8" fill="#00ff41">&gt;_</text>
  </svg>`,

  calculator: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="24" height="28" rx="3" fill="#c8c8c8" stroke="black" stroke-width="1.5"/>
    <rect x="7" y="5" width="18" height="7" rx="1" fill="#9bc89b"/>
    <text x="23" y="11" text-anchor="end" font-family="Courier New" font-size="6" fill="#1a1a1a">0</text>
    ${[[7,16],[13,16],[19,16],[7,21],[13,21],[19,21],[7,26],[13,26],[19,26]].map(([x,y]) =>
      `<rect x="${x}" y="${y}" width="4" height="3" rx="0.5" fill="white" stroke="#888" stroke-width="0.5"/>`
    ).join('')}
    <rect x="25" y="16" width="4" height="8" rx="0.5" fill="#CC0000" stroke="#888" stroke-width="0.5"/>
  </svg>`,

  stats: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="28" height="28" rx="1" fill="white" stroke="black" stroke-width="1.5"/>
    <rect x="6" y="18" width="5" height="9" fill="#CC0000"/>
    <rect x="14" y="10" width="5" height="17" fill="#0055cc"/>
    <rect x="22" y="14" width="5" height="13" fill="#27c93f"/>
    <line x1="4" y1="27" x2="28" y2="27" stroke="black" stroke-width="1"/>
    <line x1="5" y1="4" x2="5" y2="27" stroke="black" stroke-width="1"/>
  </svg>`,

  rss: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="28" height="28" rx="3" fill="#FF6600"/>
    <circle cx="8" cy="24" r="3" fill="white"/>
    <path d="M8 18 a10 10 0 0 1 10 10" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M8 12 a16 16 0 0 1 16 16" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  radio: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="28" height="20" rx="2" fill="#c8c8c8" stroke="black" stroke-width="1.5"/>
    <rect x="5" y="13" width="12" height="8" rx="1" fill="#9bc89b"/>
    <circle cx="24" cy="17" r="4" fill="#888" stroke="black" stroke-width="1"/>
    <circle cx="24" cy="17" r="1.5" fill="#555"/>
    <path d="M8 10 L12 4 M16 10 L16 4 M24 10 L20 4" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  tv: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="26" height="20" rx="2" fill="#c8c8c8" stroke="black" stroke-width="1.5"/>
    <rect x="5" y="9" width="18" height="13" rx="1" fill="#1a1a2e"/>
    <line x1="12" y1="26" x2="10" y2="30" stroke="black" stroke-width="2"/>
    <line x1="20" y1="26" x2="22" y2="30" stroke="black" stroke-width="2"/>
    <circle cx="26" cy="12" r="1.5" fill="#CC0000"/>
    <circle cx="26" cy="17" r="1.5" fill="#555"/>
    <line x1="11" y1="2" x2="8" y2="8" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="21" y1="2" x2="24" y2="8" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  podcasts: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="2" width="8" height="16" rx="4" fill="white" stroke="black" stroke-width="1.5"/>
    <path d="M8 14 a8 8 0 0 0 16 0" fill="none" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="16" y1="22" x2="16" y2="28" stroke="black" stroke-width="1.5"/>
    <line x1="11" y1="28" x2="21" y2="28" stroke="black" stroke-width="2"/>
  </svg>`,

  home: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <polygon points="16,3 2,16 6,16 6,29 13,29 13,21 19,21 19,29 26,29 26,16 30,16" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="13" y="21" width="6" height="8" fill="#c8a882"/>
  </svg>`,
};

export function RetroIcon({ id, size = 40 }: { id: string; size?: number }) {
  const svg = RETRO_ICONS[id] ?? RETRO_ICONS["notes"];
  return (
    <div
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
