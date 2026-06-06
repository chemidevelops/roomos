// Mac OS 9 style icons from BlissThatMiss/MoNine
const BASE = "https://raw.githubusercontent.com/BlissThatMiss/MoNine/master/apps/32";

const SETTINGS_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <!-- Gear teeth (pixel art) -->
  <rect x="13" y="1" width="6" height="4" fill="#888"/>
  <rect x="13" y="27" width="6" height="4" fill="#888"/>
  <rect x="1" y="13" width="4" height="6" fill="#888"/>
  <rect x="27" y="13" width="4" height="6" fill="#888"/>
  <rect x="4" y="4" width="4" height="4" fill="#888"/>
  <rect x="24" y="4" width="4" height="4" fill="#888"/>
  <rect x="4" y="24" width="4" height="4" fill="#888"/>
  <rect x="24" y="24" width="4" height="4" fill="#888"/>
  <!-- Gear body -->
  <rect x="8" y="3" width="16" height="26" fill="#aaa"/>
  <rect x="3" y="8" width="26" height="16" fill="#aaa"/>
  <rect x="5" y="5" width="22" height="22" fill="#aaa"/>
  <!-- Inner circle -->
  <rect x="10" y="8" width="12" height="16" fill="#555"/>
  <rect x="8" y="10" width="16" height="12" fill="#555"/>
  <rect x="9" y="9" width="14" height="14" fill="#555"/>
  <!-- Center hole -->
  <rect x="12" y="12" width="8" height="8" fill="#222"/>
  <rect x="13" y="11" width="6" height="10" fill="#222"/>
  <rect x="11" y="13" width="10" height="6" fill="#222"/>
</svg>`)}`;

const SOLITAIRE_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <!-- Card back (pixel art, no rounded corners) -->
  <rect x="0" y="3" width="19" height="25" fill="#000"/>
  <rect x="1" y="4" width="17" height="23" fill="#1a3a8a"/>
  <!-- Pixel pattern on back -->
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
  <!-- A top-left -->
  <text x="15" y="14" font-family="monospace" font-size="7" font-weight="bold" fill="#000">A</text>
  <!-- Heart center (pixel) -->
  <rect x="20" y="17" width="2" height="1" fill="#cc0000"/>
  <rect x="23" y="17" width="2" height="1" fill="#cc0000"/>
  <rect x="19" y="18" width="7" height="2" fill="#cc0000"/>
  <rect x="20" y="20" width="5" height="1" fill="#cc0000"/>
  <rect x="21" y="21" width="3" height="1" fill="#cc0000"/>
  <rect x="22" y="22" width="1" height="1" fill="#cc0000"/>
  <!-- A bottom-right -->
  <text x="24" y="28" font-family="monospace" font-size="7" font-weight="bold" fill="#000">A</text>
</svg>`)}`;

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
