import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluatePrompt } from "@/lib/gemini/client";

const bodySchema = z.object({
  promptText: z.string().min(20),
  scenarioTitle: z.string().min(3),
  scenarioDescription: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const evaluation = await evaluatePrompt({
      promptText: parsed.data.promptText,
      scenarioTitle: parsed.data.scenarioTitle,
      scenarioDescription: parsed.data.scenarioDescription,
    });
    return NextResponse.json(evaluation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
