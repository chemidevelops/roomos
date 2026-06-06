import { NextResponse } from "next/server";

const FEED = "https://www.eurogamer.es/feed";

export async function GET() {
  try {
    const res = await fetch(FEED, {
      headers: { "User-Agent": "roomOS Ticker" },
      next: { revalidate: 1800 },
    });
    const xml = await res.text();
    const items: string[] = [];
    const re = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/g;
    let m; let skip = true;
    while ((m = re.exec(xml)) !== null) {
      if (skip) { skip = false; continue; } // skip channel title
      const t = m[1].trim();
      if (t) items.push(t);
      if (items.length >= 20) break;
    }
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
