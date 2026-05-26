import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const notes = db.prepare("SELECT * FROM notes ORDER BY updated_at DESC").all();
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { id, title, content } = body;
  const now = Date.now();

  if (id) {
    // Update existing
    db.prepare("UPDATE notes SET title=?, content=?, updated_at=? WHERE id=?")
      .run(title ?? "", content ?? "", now, id);
    return NextResponse.json({ id, title, content, updated_at: now });
  } else {
    // Create new
    const newId = crypto.randomUUID();
    db.prepare("INSERT INTO notes (id, title, content, updated_at) VALUES (?,?,?,?)")
      .run(newId, title ?? "", content ?? "", now);
    return NextResponse.json({ id: newId, title: title ?? "", content: content ?? "", updated_at: now });
  }
}
