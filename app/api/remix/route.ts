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
          content: `Generate 5 creative remixes of this text. Format your response with ONLY the 5 remixes, one per line, no introduction or additional text:

${text}`,
        },
      ],
    });

    // Filter out any empty lines and get only valid remixes
    const remixedText =
      message.content[0].type === "text"
        ? message.content[0].text
            .split("\n")
            .filter((line) => line.trim()) // Remove empty lines
            .filter((line) => !line.includes("remixes") && !line.includes(":")) // Remove intro text
            .slice(0, 5) // Take only 5 remixes
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
