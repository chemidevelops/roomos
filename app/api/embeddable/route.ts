import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { ok: boolean; ts: number }>();
const TTL = 24 * 60 * 60 * 1000; // 24h

async function checkVideo(id: string): Promise<boolean> {
  const cached = cache.get(id);
  if (cached && Date.now() - cached.ts < TTL) return cached.ok;

  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    // Check playableInEmbed — the definitive field
    const match = html.match(/"playableInEmbed"\s*:\s*(true|false)/);
    const ok = match ? match[1] === "true" : true; // default allow if not found
    cache.set(id, { ok, ts: Date.now() });
    return ok;
  } catch {
    return true; // allow on error to avoid blocking everything
  }
}

export async function POST(req: NextRequest) {
  const { ids } = await req.json() as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ ids: [] });

  // Check up to 20 at a time
  const batch = ids.slice(0, 20);
  const results = await Promise.all(batch.map(id => checkVideo(id)));
  const embeddable = batch.filter((_, i) => results[i]);

  return NextResponse.json({ ids: embeddable });
}
