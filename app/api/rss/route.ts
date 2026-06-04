import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const res = await fetch(url, { headers: { "User-Agent": "RoomOS RSS Reader" }, next: { revalidate: 300 } });
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch feed" }, { status: 502 });

  const xml = await res.text();

  // Parse items from RSS/Atom
  const items: { title: string; link: string; pubDate: string; description: string }[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
      return m ? m[1].trim() : "";
    };
    items.push({
      title: get("title"),
      link: get("link"),
      pubDate: get("pubDate"),
      description: get("description"),
    });
  }

  return NextResponse.json({ items });
}
