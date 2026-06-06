import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Shared cache between resolve and proxy
export const streamCache = new Map<string, { url: string; ts: number }>();
export const TTL = 3 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("v");
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const cached = streamCache.get(videoId);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ ok: true, cached: true });
  }

  try {
    const { stdout } = await execAsync(
      `yt-dlp -f 'best[height<=720][ext=mp4]/best[height<=720]/best' --get-url 'https://www.youtube.com/watch?v=${videoId}'`,
      { timeout: 25000 }
    );
    const url = stdout.trim().split("\n")[0];
    if (!url) throw new Error("No URL");
    streamCache.set(videoId, { url, ts: Date.now() });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
