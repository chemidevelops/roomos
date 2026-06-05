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

  // Radio X — via Global Player metadata
  try {
    const res = await fetch(
      "https://commercial.api.globalplayer.com/v2/stations/radiox/",
      { next: { revalidate: 30 }, headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      const np = data?.now_playing;
      if (np) {
        results.radiox = {
          artist: np.artist || "",
          title: np.title || "",
          art: np.artwork?.["480x480"] || "",
        };
      }
    }
  } catch {}

  return NextResponse.json(results);
}
