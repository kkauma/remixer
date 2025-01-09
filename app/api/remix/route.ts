import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `Rewrite the following text in EXACTLY 4 different styles. Each style should be dramatically different (e.g., academic, casual/Gen-Z, poetic, humorous). Provide ONLY the 4 variations, each on its own line, with no additional text or numbering:

${text}

Remember: I need EXACTLY 4 variations, no more, no less.`,
        },
      ],
    });

    // Ensure exactly 4 variations
    const remixedText =
      message.content[0].type === "text"
        ? message.content[0].text
            .split("\n")
            .filter((line) => line.trim()) // Remove empty lines
            .filter(
              (line) => !line.includes("variations") && !line.includes(":")
            ) // Remove intro text
            .slice(0, 4) // Take exactly 4 variations
            .join("\n")
        : "";

    return NextResponse.json({ remixedText });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to remix content",
      },
      { status: 500 }
    );
  }
}
