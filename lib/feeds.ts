// ── Central feed configuration ──────────────────────────────────────────────
// Add feeds here once — all platforms (desktop, mobile, Apple TV) pick them up.

export interface PodcastFeed {
  name: string;
  url: string;
}

export interface RSSFeed {
  name: string;
  url: string;
}

export const PODCAST_FEEDS: PodcastFeed[] = [
  { name: "Mesón Sol",                url: "https://feeds.acast.com/public/shows/meson-sol" },
  { name: "Defensores de la Galaxia", url: "https://feeds.ivoox.com/feed_fg_f11830068_filtro_1.xml" },
];

export const RSS_FEEDS: RSSFeed[] = [
  { name: "Applesfera", url: "https://www.applesfera.com/feedburner.xml" },
  { name: "Vida Extra",  url: "https://www.vidaextra.com/feedburner.xml" },
];
