import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Cache para no llamar yt-dlp en cada request (URLs válidas ~6h)
const cache = new Map<string, { url: string; ts: number }>();
const TTL = 4 * 60 * 60 * 1000; // 4 horas

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("v");
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  const cached = cache.get(videoId);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ url: cached.url });
  }

  try {
    const { stdout } = await execAsync(
      `yt-dlp -f 'best[height<=720][ext=mp4]/best[height<=720]/best' --get-url 'https://www.youtube.com/watch?v=${videoId}'`,
      { timeout: 20000 }
    );
    const url = stdout.trim().split("\n")[0];
    if (!url) throw new Error("No URL");
    cache.set(videoId, { url, ts: Date.now() });
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
