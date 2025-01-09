import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // TODO: Add your Claude API integration here
    // This is a placeholder response
    const remixedText = `Remixed: ${text}`;

    return NextResponse.json({ remixedText });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remix content" },
      { status: 500 }
    );
  }
}
