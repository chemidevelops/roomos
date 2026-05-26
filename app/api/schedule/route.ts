import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const db = getDb();
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  const entries = db.prepare(
    "SELECT se.*, bi.title as item_title, bi.category, bi.color FROM schedule_entries se LEFT JOIN backlog_items bi ON se.item_id = bi.id WHERE se.date=? ORDER BY se.start_min ASC"
  ).all(date);
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { item_id, date, start_min, end_min, notes } = body;
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO schedule_entries (id, item_id, date, start_min, end_min, notes) VALUES (?,?,?,?,?,?)")
    .run(id, item_id, date, start_min, end_min, notes ?? "");
  return NextResponse.json({ id, item_id, date, start_min, end_min, notes: notes ?? "" });
}
