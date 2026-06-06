// Mac OS 9 style icons from BlissThatMiss/MoNine
const BASE = "https://raw.githubusercontent.com/BlissThatMiss/MoNine/master/apps/32";

const gear = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="40%" cy="35%">
      <stop offset="0%" stop-color="#d0d0d0"/>
      <stop offset="100%" stop-color="#888"/>
    </radialGradient>
  </defs>
  <!-- Gear shape using polygon -->
  <circle cx="16" cy="16" r="13" fill="url(#g)"/>
  <!-- Teeth as small rects rotated via transform -->
  ${[0,45,90,135,180,225,270,315].map(a => {
    const r = a * Math.PI / 180;
    const cx = 16 + Math.cos(r) * 11;
    const cy = 16 + Math.sin(r) * 11;
    return `<rect x="${(cx-2.5).toFixed(1)}" y="${(cy-2.5).toFixed(1)}" width="5" height="5" fill="#888" transform="rotate(${a} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
  }).join('')}
  <!-- Cover teeth edges with circle -->
  <circle cx="16" cy="16" r="10" fill="url(#g)"/>
  <!-- Center hole -->
  <circle cx="16" cy="16" r="4.5" fill="#444"/>
  <circle cx="16" cy="16" r="3.5" fill="#222"/>
</svg>`;

const cards = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <!-- Card back -->
  <rect x="0" y="3" width="19" height="25" fill="#000"/>
  <rect x="1" y="4" width="17" height="23" fill="#1a3a8a"/>
  <rect x="3" y="6" width="2" height="2" fill="#2255cc"/>
  <rect x="7" y="6" width="2" height="2" fill="#2255cc"/>
  <rect x="11" y="6" width="2" height="2" fill="#2255cc"/>
  <rect x="5" y="10" width="2" height="2" fill="#2255cc"/>
  <rect x="9" y="10" width="2" height="2" fill="#2255cc"/>
  <rect x="13" y="10" width="2" height="2" fill="#2255cc"/>
  <rect x="3" y="14" width="2" height="2" fill="#2255cc"/>
  <rect x="7" y="14" width="2" height="2" fill="#2255cc"/>
  <rect x="11" y="14" width="2" height="2" fill="#2255cc"/>
  <rect x="5" y="18" width="2" height="2" fill="#2255cc"/>
  <rect x="9" y="18" width="2" height="2" fill="#2255cc"/>
  <rect x="13" y="18" width="2" height="2" fill="#2255cc"/>
  <rect x="3" y="22" width="2" height="2" fill="#2255cc"/>
  <rect x="7" y="22" width="2" height="2" fill="#2255cc"/>
  <rect x="11" y="22" width="2" height="2" fill="#2255cc"/>
  <!-- Card front -->
  <rect x="13" y="5" width="19" height="25" fill="#000"/>
  <rect x="14" y="6" width="17" height="23" fill="#fff"/>
  <text x="15" y="14" font-family="monospace" font-size="7" font-weight="bold" fill="#000">A</text>
  <rect x="20" y="17" width="2" height="1" fill="#cc0000"/>
  <rect x="23" y="17" width="2" height="1" fill="#cc0000"/>
  <rect x="19" y="18" width="7" height="2" fill="#cc0000"/>
  <rect x="20" y="20" width="5" height="1" fill="#cc0000"/>
  <rect x="21" y="21" width="3" height="1" fill="#cc0000"/>
  <rect x="22" y="22" width="1" height="1" fill="#cc0000"/>
  <text x="24" y="28" font-family="monospace" font-size="7" font-weight="bold" fill="#000">A</text>
</svg>`;

const SETTINGS_SVG = `data:image/svg+xml,${encodeURIComponent(gear)}`;
const SOLITAIRE_SVG = `data:image/svg+xml,${encodeURIComponent(cards)}`;

export const RETRO_ICON_URLS: Record<string, string> = {
  calendar:   `${BASE}/gnome-calendar.png`,
  notes:      `${BASE}/xfce4-notes-plugin.png`,
  settings:   SETTINGS_SVG,
  solitaire:  SOLITAIRE_SVG,
  terminal:   `${BASE}/org.xfce.terminal.png`,
  calculator: `${BASE}/accessories-calculator.png`,
  stats:      `https://raw.githubusercontent.com/BlissThatMiss/MoNine/master/mimes/32/application-vnd.oasis.opendocument.chart.png`,
  rss:        `${BASE}/internet-web-browser.png`,
  podcasts:   `${BASE}/multimedia-audio-player.png`,
  radio:      `${BASE}/gnome-audio.png`,
  tv:         `${BASE}/multimedia-video-player.png`,
};

export function RetroIcon({ id, size = 40 }: { id: string; size?: number }) {
  const url = RETRO_ICON_URLS[id];
  if (!url) return <span style={{ fontSize: size * 0.8 }}>📁</span>;
  return (
    <img
      src={url}
      width={size}
      height={size}
      style={{ imageRendering: url.startsWith("data:") ? "auto" : "pixelated", display: "block" }}
      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}
