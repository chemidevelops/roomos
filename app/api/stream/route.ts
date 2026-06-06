import { NextRequest, NextResponse } from "next/server";
import { streamCache } from "./resolve/route";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("v");
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return new NextResponse("Invalid video ID", { status: 400 });
  }

  const cached = streamCache.get(videoId);
  if (!cached) {
    return new NextResponse("Stream not resolved yet", { status: 404 });
  }

  const range = req.headers.get("range") ?? undefined;
  const upstream = await fetch(cached.url, {
    headers: {
      ...(range ? { Range: range } : {}),
      "User-Agent": "Mozilla/5.0",
    },
  });

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
