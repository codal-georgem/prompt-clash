import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluatePrompt } from "@/lib/gemini/client";

const bodySchema = z.object({
  promptText: z.string().min(20),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const evaluation = await evaluatePrompt(parsed.data.promptText);
    return NextResponse.json(evaluation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
