import { NextRequest, NextResponse } from "next/server";

// Simple deterministic hash
function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Current slot: 0 = 00-13h, 1 = 13-21h, 2 = 21-24h
function getSlot(hour: number): number {
  if (hour < 13) return 0;
  if (hour < 21) return 1;
  return 2;
}

const SLOT_LABELS = ["Mañana", "Tarde", "Noche"];
const SLOT_NEXT = ["13:00", "21:00", "07:00"];

// Cache articles list for 24h
let cachedTitles: string[] = [];
let cacheTs = 0;

async function getArticleTitles(): Promise<string[]> {
  if (cachedTitles.length > 0 && Date.now() - cacheTs < 86400000) return cachedTitles;

  const titles: string[] = [];
  let cont = "";
  for (let i = 0; i < 6; i++) { // up to 300 articles
    const url = `https://es.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Categor%C3%ADa:Videojuegos&cmlimit=50&cmtype=page&format=json${cont ? `&cmcontinue=${cont}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const data = await res.json();
    const members = data?.query?.categorymembers ?? [];
    for (const m of members) {
      if (!m.title.startsWith("Anexo:") && !m.title.startsWith("Wikipedia:")) {
        titles.push(m.title);
      }
    }
    cont = data?.continue?.cmcontinue ?? "";
    if (!cont) break;
  }

  cachedTitles = titles;
  cacheTs = Date.now();
  return titles;
}

async function getArticle(title: string) {
  const url = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=false&piprop=thumbnail&pithumbsize=400&titles=${encodeURIComponent(title)}&format=json&redirects=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0] as any;
  return {
    title: page?.title ?? title,
    extract: page?.extract ?? "",
    thumb: page?.thumbnail?.source ?? null,
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

  // Pick 3 deterministic articles for today
  const picks = [0, 1, 2].map(s => {
    const idx = hashSeed(`${dateStr}-${s}`) % titles.length;
    return titles[idx];
  });

  const article = await getArticle(picks[slot]);

  return NextResponse.json({
    ...article,
    slot,
    slotLabel: SLOT_LABELS[slot],
    nextAt: SLOT_NEXT[slot],
    date: dateStr,
    allTitles: picks,
  });
}
