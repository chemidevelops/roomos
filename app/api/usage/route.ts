import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const db = getDb();
  const { type, label, seconds } = await req.json();
  if (!type || !label || !seconds) return NextResponse.json({ ok: false });
  const date = new Date().toISOString().split("T")[0];
  db.prepare("INSERT INTO usage_events (id, type, label, seconds, date, created_at) VALUES (?,?,?,?,?,?)")
    .run(randomUUID(), type, label, Math.round(seconds), date, Date.now());
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const db = getDb();
  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];

  const byType = db.prepare(`
    SELECT type, label, SUM(seconds) as total, COUNT(*) as count, MAX(date) as last
    FROM usage_events WHERE date >= ?
    GROUP BY type, label ORDER BY total DESC
  `).all(since);

  const byDay = db.prepare(`
    SELECT date, type, SUM(seconds) as total
    FROM usage_events WHERE date >= ?
    GROUP BY date, type ORDER BY date DESC
  `).all(since);

  return NextResponse.json({ byType, byDay });
}
