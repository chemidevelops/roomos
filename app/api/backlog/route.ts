import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const items = db.prepare("SELECT * FROM backlog_items ORDER BY created_at DESC").all();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { title, category, color } = body;
  const id = crypto.randomUUID();
  const now = Date.now();
  db.prepare("INSERT INTO backlog_items (id, title, category, color, status, created_at) VALUES (?,?,?,?,?,?)")
    .run(id, title, category, color, "active", now);
  return NextResponse.json({ id, title, category, color, status: "active", created_at: now });
}
