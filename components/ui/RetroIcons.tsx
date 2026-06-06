// Mac OS 9 style icons from BlissThatMiss/MoNine
const BASE = "https://raw.githubusercontent.com/BlissThatMiss/MoNine/master/apps/32";

const SOLITAIRE_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Card back -->
  <rect x="1" y="4" width="18" height="24" rx="2" fill="#1a3a8a" stroke="#000" stroke-width="1"/>
  <rect x="3" y="6" width="14" height="20" rx="1" fill="#2255cc"/>
  <path d="M5 8 l10 16 M15 8 l-10 16" stroke="#5588ff" stroke-width="1" opacity="0.4"/>
  <!-- Card front -->
  <rect x="13" y="6" width="18" height="24" rx="2" fill="white" stroke="#000" stroke-width="1.2"/>
  <!-- Spade -->
  <text x="15" y="17" font-family="serif" font-size="9" fill="#cc0000">♥</text>
  <text x="15" y="26" font-family="serif" font-size="7" fill="#cc0000">A</text>
  <text x="22" y="12" font-family="serif" font-size="7" fill="#000">A</text>
  <text x="21" y="22" font-family="serif" font-size="9" fill="#000">♠</text>
</svg>`)}`;

export const RETRO_ICON_URLS: Record<string, string> = {
  calendar:   `${BASE}/gnome-calendar.png`,
  notes:      `${BASE}/xfce4-notes-plugin.png`,
  settings:   `https://raw.githubusercontent.com/BlissThatMiss/MoNine/master/categories/32/gtk-preferences.png`,
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
