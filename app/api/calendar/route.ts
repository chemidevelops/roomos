import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const db = getDb();
  const month = req.nextUrl.searchParams.get("month"); // YYYY-MM
  const events = month
    ? db.prepare("SELECT * FROM calendar_events WHERE date LIKE ? ORDER BY date, time").all(`${month}%`)
    : db.prepare("SELECT * FROM calendar_events ORDER BY date, time").all();
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const { title, date, time, notes } = await req.json();
  const id = randomUUID();
  db.prepare("INSERT INTO calendar_events (id, title, date, time, notes, created_at) VALUES (?,?,?,?,?,?)")
    .run(id, title, date, time ?? "", notes ?? "", Date.now());
  return NextResponse.json({ id, title, date, time, notes });
}

export async function DELETE(req: NextRequest) {
  const db = getDb();
  const id = req.nextUrl.searchParams.get("id");
  if (id) db.prepare("DELETE FROM calendar_events WHERE id=?").run(id);
  return NextResponse.json({ ok: true });
}
