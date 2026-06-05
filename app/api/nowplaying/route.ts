import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, { artist: string; title: string; album?: string; art?: string }> = {};

  // KEXP
  try {
    const res = await fetch("https://api.kexp.org/v2/plays/?format=json&limit=10", {
      next: { revalidate: 30 },
    });
    const data = await res.json();
    const track = data.results?.find((p: any) => p.play_type === "trackplay");
    if (track) {
      results.kexp = {
        artist: track.artist || "",
        title: track.song || "",
        album: track.release || "",
        art: track.thumbnail_uri || track.image_uri || "",
      };
    }
  } catch {}

  // Radio X — API no pública, intentamos ICY metadata via stream
  try {
    const res = await fetch("https://media-ssl.musicradio.com/RadioXUK", {
      headers: { "Icy-MetaData": "1", "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(4000),
    });
    const icyTitle = res.headers.get("icy-name") || "";
    const meta = res.headers.get("icy-meta") || "";
    const match = meta.match(/StreamTitle='([^;']*)'/);
    if (match?.[1]) {
      const parts = match[1].split(" - ");
      results.radiox = { artist: parts[0] || "", title: parts[1] || match[1] };
    } else if (icyTitle) {
      results.radiox = { artist: "Radio X", title: "En directo" };
    }
  } catch {
    results.radiox = { artist: "Radio X", title: "En directo" };
  }

  // BBC Radio 6 Music
  try {
    const res = await fetch(
      "https://rms.api.bbc.co.uk/v2/services/bbc_6music/segments/latest",
      { next: { revalidate: 30 } }
    );
    if (res.ok) {
      const data = await res.json();
      const track = data.data?.find((s: any) => s.segment_type === "music");
      if (track) {
        results.bbc6 = {
          artist: track.titles?.secondary || "",
          title: track.titles?.primary || "",
          art: track.image_url?.replace("{recipe}", "320x320") || "",
        };
      }
    }
  } catch {}

  return NextResponse.json(results);
}
