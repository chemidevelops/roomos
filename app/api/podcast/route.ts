import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const res = await fetch(url, {
    headers: { "User-Agent": "RoomOS Podcast Player" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch feed" }, { status: 502 });

  const xml = await res.text();

  const getTag = (block: string, tag: string) => {
    const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
    return m ? m[1].trim() : "";
  };

  // Podcast metadata
  const title = getTag(xml.slice(0, 3000), "title");
  const image = xml.match(/<itunes:image[^>]+href="([^"]+)"/)?.[1] ||
                xml.match(/<image>[\s\S]*?<url>([^<]+)<\/url>/)?.[1] || "";

  // Episodes
  const episodes: {
    title: string; description: string; pubDate: string;
    duration: string; audioUrl: string; guid: string;
  }[] = [];

  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const b = m[1];
    const audioUrl = b.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] ?? "";
    if (!audioUrl) continue;
    episodes.push({
      title: getTag(b, "title"),
      description: getTag(b, "description") || getTag(b, "itunes:summary"),
      pubDate: getTag(b, "pubDate"),
      duration: getTag(b, "itunes:duration"),
      audioUrl,
      guid: getTag(b, "guid") || audioUrl,
    });
  }

  return NextResponse.json({ title, image, episodes });
}
