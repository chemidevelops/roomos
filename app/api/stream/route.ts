import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const cache = new Map<string, { url: string; ts: number }>();
const TTL = 3 * 60 * 60 * 1000;

async function resolve(videoId: string): Promise<string> {
  const cached = cache.get(videoId);
  if (cached && Date.now() - cached.ts < TTL) return cached.url;

  const { stdout } = await execAsync(
    `yt-dlp --cookies /root/yt-cookies.txt -f 'best[height<=720][ext=mp4]/best[height<=720]/best' --get-url 'https://www.youtube.com/watch?v=${videoId}'`,
    { timeout: 25000 }
  );
  const url = stdout.trim().split("\n")[0];
  if (!url) throw new Error("No URL");
  cache.set(videoId, { url, ts: Date.now() });
  return url;
}

export async function HEAD(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("v");
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return new NextResponse(null, { status: 400 });
  }
  try {
    await resolve(videoId);
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("v");
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return new NextResponse("Invalid video ID", { status: 400 });
  }

  let streamUrl: string;
  try {
    streamUrl = await resolve(videoId);
  } catch (e: any) {
    return new NextResponse(`yt-dlp error: ${e.message}`, { status: 500 });
  }

  const range = req.headers.get("range") ?? undefined;
  let upstream: Response;
  try {
    upstream = await fetch(streamUrl, {
      headers: {
        ...(range ? { Range: range } : {}),
        "User-Agent": "Mozilla/5.0",
      },
    });
  } catch (e: any) {
    // URL expirada — invalidar caché y reintentar
    cache.delete(videoId);
    try {
      streamUrl = await resolve(videoId);
      upstream = await fetch(streamUrl, {
        headers: { ...(range ? { Range: range } : {}), "User-Agent": "Mozilla/5.0" },
      });
    } catch {
      return new NextResponse("Stream fetch failed", { status: 502 });
    }
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("Content-Type") ?? "video/mp4");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Access-Control-Allow-Origin", "*");
  const cl = upstream.headers.get("Content-Length");
  const cr = upstream.headers.get("Content-Range");
  if (cl) headers.set("Content-Length", cl);
  if (cr) headers.set("Content-Range", cr);

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}
