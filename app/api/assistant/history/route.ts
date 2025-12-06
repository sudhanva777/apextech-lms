import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ messages: [] });
    }

    // Get user ID from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ messages: [] });
    }

    // Get chat history
    const history = await prisma.chatHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    // Transform to match the Message interface format
    const messages = history.map((item) => ({
      role: item.role === "USER" ? "user" : "assistant",
      content: item.message,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json({ messages: [] });
  }
}

