import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const cache = new Map<string, { ids: string[]; ts: number }>();
const TTL = 6 * 60 * 60 * 1000; // 6h

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const n = parseInt(req.nextUrl.searchParams.get("n") ?? "5");
  if (!q) return NextResponse.json({ ids: [] });

  const key = q;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ ids: cached.ids });
  }

  try {
    const { stdout } = await execAsync(
      `yt-dlp "ytsearch${n}:${q}" --flat-playlist --print id`,
      { timeout: 15000 }
    );
    const ids = stdout.trim().split("\n").filter(id => /^[a-zA-Z0-9_-]{11}$/.test(id));
    cache.set(key, { ids, ts: Date.now() });
    return NextResponse.json({ ids });
  } catch {
    return NextResponse.json({ ids: [] });
  }
}
