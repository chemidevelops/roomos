// Mac OS 9 style icons from BlissThatMiss/MoNine
const BASE = "https://raw.githubusercontent.com/BlissThatMiss/MoNine/master/apps/32";

const gear = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <!-- 8 clear teeth -->
  <rect x="12" y="0" width="8" height="6" fill="#7a7a7a"/>
  <rect x="12" y="26" width="8" height="6" fill="#7a7a7a"/>
  <rect x="0" y="12" width="6" height="8" fill="#7a7a7a"/>
  <rect x="26" y="12" width="6" height="8" fill="#7a7a7a"/>
  <rect x="3" y="3" width="6" height="6" fill="#7a7a7a"/>
  <rect x="23" y="3" width="6" height="6" fill="#7a7a7a"/>
  <rect x="3" y="23" width="6" height="6" fill="#7a7a7a"/>
  <rect x="23" y="23" width="6" height="6" fill="#7a7a7a"/>
  <!-- Body -->
  <rect x="6" y="6" width="20" height="20" fill="#aaa"/>
  <rect x="4" y="10" width="24" height="12" fill="#aaa"/>
  <rect x="10" y="4" width="12" height="24" fill="#aaa"/>
  <!-- Highlight -->
  <rect x="6" y="6" width="20" height="1" fill="#ccc"/>
  <rect x="6" y="6" width="1" height="20" fill="#ccc"/>
  <!-- Center hole -->
  <rect x="12" y="10" width="8" height="12" fill="#333"/>
  <rect x="10" y="12" width="12" height="8" fill="#333"/>
  <rect x="11" y="11" width="10" height="10" fill="#333"/>
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
      style={{ imageRendering: "pixelated", display: "block" }}
      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}
