import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma/client";

// DELETE /api/words/[word] - Delete a specific word
export async function DELETE(
  request: NextRequest,
  { params }: { params: { word: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const word = decodeURIComponent(params.word);

    const deletedWord = await prisma.word.deleteMany({
      where: {
        userId: session.user.id,
        word: word,
      },
    });

    if (deletedWord.count === 0) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Word deleted successfully" });
  } catch (error) {
    console.error("Error deleting word:", error);
    return NextResponse.json(
      { error: "Failed to delete word" },
      { status: 500 }
    );
  }
}
