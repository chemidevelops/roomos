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
const YEARS = Array.from({ length: 36 }, (_, i) => 1975 + i);

const yearCache = new Map<number, { titles: string[]; ts: number }>();

async function getTitlesForYear(year: number): Promise<string[]> {
  const cached = yearCache.get(year);
  if (cached && Date.now() - cached.ts < 86400000) return cached.titles;

  const url = `https://es.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Categor%C3%ADa:Videojuegos%20de%20${year}&cmlimit=100&cmtype=page&format=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  const titles = (data?.query?.categorymembers ?? [])
    .map((m: any) => m.title as string)
    .filter((t: string) => !t.startsWith("Anexo:") && !t.includes("(desambiguación)"));

  yearCache.set(year, { titles, ts: Date.now() });
  return titles;
}

async function getArticle(title: string) {
  const url = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&piprop=thumbnail&pithumbsize=500&titles=${encodeURIComponent(title)}&format=json&redirects=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0] as any;
  return {
    title: page?.title ?? title,
    extract: page?.extract ?? "",
    thumb: page?.thumbnail?.source ?? null,
  };
}

async function pickArticleForSlot(dateStr: string, slot: number): Promise<{ title: string; extract: string; thumb: string | null }> {
  // Pick a year deterministically for this date+slot
  const yearIdx = hashSeed(`${dateStr}-${slot}-year`) % YEARS.length;
  const year = YEARS[yearIdx];

  const titles = await getTitlesForYear(year);
  if (!titles.length) throw new Error("No titles");

  // Try up to 5 candidates in that year
  for (let attempt = 0; attempt < 5; attempt++) {
    const idx = hashSeed(`${dateStr}-${slot}-${attempt}`) % titles.length;
    const article = await getArticle(titles[idx]);
    const textLen = article.extract.replace(/<[^>]+>/g, "").length;
    if (textLen > 600) return article;
  }

  // Fallback: return whatever we got
  const idx = hashSeed(`${dateStr}-${slot}`) % titles.length;
  return getArticle(titles[idx]);
}

export async function GET(req: NextRequest) {
  const tz = req.nextUrl.searchParams.get("tz") ?? "0";
  const offsetMin = parseInt(tz) || 0;
  const now = new Date(Date.now() + offsetMin * 60000);
  const hour = now.getUTCHours();
  const dateStr = now.toISOString().split("T")[0];
  const slot = getSlot(hour);

  try {
    const article = await pickArticleForSlot(dateStr, slot);
    return NextResponse.json({
      ...article,
      slot,
      slotLabel: SLOT_LABELS[slot],
      nextAt: SLOT_NEXT[slot],
      date: dateStr,
    });
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
