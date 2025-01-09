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
          content: `Please provide exactly 5 creative remixes of the following text. Each remix should be on a new line and should be different in style, tone, or format while preserving the core meaning:

${text}`,
        },
      ],
    });

    return NextResponse.json({
      remixedText:
        message.content[0].type === "text" ? message.content[0].text : "",
    });
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
