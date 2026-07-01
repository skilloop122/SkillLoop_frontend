import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const fs = require('fs');
  fs.writeFileSync('/tmp/match_logs.json', JSON.stringify(body, null, 2));
  return NextResponse.json({ success: true });
}
