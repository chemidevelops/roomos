import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const channelId = req.nextUrl.searchParams.get("channelId");
  if (!channelId) return NextResponse.json({ error: "Missing channelId" }, { status: 400 });

  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return NextResponse.json({ videos: [] });

  const xml = await res.text();
  const videos: { id: string; title: string; channelName: string; published: string; thumb: string }[] = [];

  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag: string) => {
      const r = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return r ? r[1].trim() : "";
    };
    const videoId = get("yt:videoId");
    const title = get("title");
    const published = get("published");
    const channelName = xml.match(/<name>([^<]*)<\/name>/)?.[1] ?? "";
    if (videoId) {
      videos.push({
        id: videoId,
        title,
        channelName,
        published,
        thumb: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      });
    }
  }

  return NextResponse.json({ videos });
}
