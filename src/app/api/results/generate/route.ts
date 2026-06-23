import { NextResponse } from "next/server";
import { generatePendingAnalyses } from "@/lib/actions/results";

export async function POST() {
  try {
    const result = await generatePendingAnalyses();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
