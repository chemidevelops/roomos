// Mac OS 9 style icons from BlissThatMiss/MoNine
const BASE = "https://raw.githubusercontent.com/BlissThatMiss/MoNine/master/apps/32";

export const RETRO_ICON_URLS: Record<string, string> = {
  calendar:   `${BASE}/gnome-calendar.png`,
  notes:      `${BASE}/xfce4-notes-plugin.png`,
  settings:   `${BASE}/org.xfce.settings.manager.png`,
  solitaire:  `https://raw.githubusercontent.com/BlissThatMiss/MoNine/master/xfce-games.png`,
  terminal:   `${BASE}/org.xfce.terminal.png`,
  calculator: `${BASE}/accessories-calculator.png`,
  stats:      `${BASE}/gnome-system-monitor.png`,
  settings:   `${BASE}/gnome-control-centre.png`,
  rss:        `${BASE}/internet-web-browser.png`,
  podcasts:   `${BASE}/multimedia-audio-player.png`,
  radio:      `${BASE}/gnome-audio.png`,
  tv:         `${BASE}/multimedia-video-player.png`,
};

// Fallback: use the places dir for generic icons
const PLACES_BASE = "https://raw.githubusercontent.com/BlissThatMiss/MoNine/master/places/32";

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
