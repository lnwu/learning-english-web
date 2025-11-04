import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma/client";

// GET /api/words - Get all words for the authenticated user
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const words = await prisma.word.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error("Error fetching words:", error);
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    );
  }
}

// POST /api/words - Add a new word
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { word, translation } = body;

    if (!word || !translation) {
      return NextResponse.json(
        { error: "Word and translation are required" },
        { status: 400 }
      );
    }

    // Check if word already exists for this user
    const existingWord = await prisma.word.findUnique({
      where: {
        userId_word: {
          userId: session.user.id,
          word: word,
        },
      },
    });

    if (existingWord) {
      return NextResponse.json(
        { error: "Word already exists" },
        { status: 409 }
      );
    }

    const newWord = await prisma.word.create({
      data: {
        word,
        translation,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newWord, { status: 201 });
  } catch (error) {
    console.error("Error creating word:", error);
    return NextResponse.json(
      { error: "Failed to create word" },
      { status: 500 }
    );
  }
}

// DELETE /api/words - Delete all words for the authenticated user
export async function DELETE() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.word.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "All words deleted" });
  } catch (error) {
    console.error("Error deleting words:", error);
    return NextResponse.json(
      { error: "Failed to delete words" },
      { status: 500 }
    );
  }
}
