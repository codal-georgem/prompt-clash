import { NextResponse } from "next/server";
import { getSubmissionAnalytics } from "@/lib/supabase/queries";

export async function GET() {
  try {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const data = await getSubmissionAnalytics();
        return NextResponse.json(data);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
