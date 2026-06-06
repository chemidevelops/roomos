// Mac OS 9 style icons from BlissThatMiss/MoNine
const BASE = "https://raw.githubusercontent.com/BlissThatMiss/MoNine/master/apps/32";

const gear = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

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
