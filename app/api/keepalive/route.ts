import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // If CRON_SECRET is configured in environment, require Bearer auth
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    // Uses the standard server client (anon / publishable key; no service role)
    const supabase = await createClient();
    const { error } = await supabase
      .from("tracks")
      .select("id")
      .limit(1);

    if (error) {
      console.error("[keepalive] Database query error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[keepalive] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

