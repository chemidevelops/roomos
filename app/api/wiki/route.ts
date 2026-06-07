import { NextRequest, NextResponse } from "next/server";

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getSlot(hour: number): number {
  if (hour < 13) return 0;
  if (hour < 21) return 1;
  return 2;
}

const SLOT_LABELS = ["Mañana", "Tarde", "Noche"];
const SLOT_NEXT = ["13:00", "21:00", "07:00"];

// Years with good game articles in Spanish Wikipedia
const YEARS = Array.from({ length: 36 }, (_, i) => 1975 + i); // 1975-2010

let cachedTitles: string[] = [];
let cacheTs = 0;

async function getArticleTitles(): Promise<string[]> {
  if (cachedTitles.length > 0 && Date.now() - cacheTs < 86400000) return cachedTitles;

  const titles: string[] = [];
  // Sample random years to get diverse articles
  const sampledYears = YEARS.slice();
  for (const year of sampledYears) {
    try {
      const url = `https://es.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Categor%C3%ADa:Videojuegos%20de%20${year}&cmlimit=50&cmtype=page&format=json`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      const data = await res.json();
      const members = data?.query?.categorymembers ?? [];
      for (const m of members) {
        if (!m.title.startsWith("Anexo:") && !m.title.startsWith("Wikipedia:") && !m.title.includes("(desambiguación)")) {
          titles.push(m.title);
        }
      }
    } catch {}
  }

  cachedTitles = titles;
  cacheTs = Date.now();
  return titles;
}

async function getArticle(title: string) {
  const url = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&piprop=thumbnail&pithumbsize=500&titles=${encodeURIComponent(title)}&format=json&redirects=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0] as any;
  const extract = page?.extract ?? "";
  // Only use thumbnail if it looks like a game screenshot/cover
  const thumb = page?.thumbnail?.source ?? null;
  return {
    title: page?.title ?? title,
    extract,
    thumb,
    length: extract.replace(/<[^>]+>/g, "").length,
  };
}

export async function GET(req: NextRequest) {
  const tz = req.nextUrl.searchParams.get("tz") ?? "0";
  const offsetMin = parseInt(tz) || 0;
  const now = new Date(Date.now() + offsetMin * 60000);
  const hour = now.getUTCHours();
  const dateStr = now.toISOString().split("T")[0];
  const slot = getSlot(hour);

  const titles = await getArticleTitles();
  if (!titles.length) return NextResponse.json({ error: "No articles" }, { status: 500 });

  // Pick articles for today — try multiple candidates to find one with enough content
  const picks: string[] = [];
  for (let s = 0; s < 3; s++) {
    // Try up to 5 candidates per slot until we find a good one
    let chosen = titles[hashSeed(`${dateStr}-${s}`) % titles.length];
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = titles[hashSeed(`${dateStr}-${s}-${attempt}`) % titles.length];
      const art = await getArticle(candidate);
      if (art.length > 800) { chosen = candidate; break; }
    }
    picks.push(chosen);
  }

  const article = await getArticle(picks[slot]);

  return NextResponse.json({
    title: article.title,
    extract: article.extract,
    thumb: article.thumb,
    slot,
    slotLabel: SLOT_LABELS[slot],
    nextAt: SLOT_NEXT[slot],
    date: dateStr,
    allTitles: picks,
  });
}
