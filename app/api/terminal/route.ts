import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const COMMANDS: Record<string, string> = {
  top:    "top -bn1 | head -25",
  ps:     "ps aux --sort=-%cpu | head -20",
  df:     "df -h",
  free:   "free -h",
  pm2:    "pm2 status",
  logs:   "tail -n 30 /var/log/nginx/access.log",
  pixel:  "pm2 logs pixel-src --nostream --lines 20 2>&1 || echo 'No pixel logs'",
};

export async function GET(req: NextRequest) {
  const cmd = req.nextUrl.searchParams.get("cmd");
  if (!cmd || !COMMANDS[cmd]) {
    return NextResponse.json({ error: "Unknown command", available: Object.keys(COMMANDS) }, { status: 400 });
  }

  try {
    const { stdout, stderr } = await execAsync(COMMANDS[cmd], { timeout: 8000 });
    return NextResponse.json({ output: (stdout || stderr || "").trim() });
  } catch (e: any) {
    return NextResponse.json({ output: e.stdout || e.message || "Error" });
  }
}
