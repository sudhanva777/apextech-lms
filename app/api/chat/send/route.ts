import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { senderId, receiverId, content } = await req.json();

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: "Sender ID, receiver ID, and content are required" },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify sender is the current user
    if (currentUser.id !== senderId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get receiver
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { role: true },
    });

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    // Validate: Students can only message admins, Admins can message any student
    if (currentUser.role === "STUDENT" && receiver.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Students can only message administrators" },
        { status: 403 }
      );
    }

    if (currentUser.role === "ADMIN" && receiver.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Admins can only message students" },
        { status: 403 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        senderId,
        receiverId,
        content: content.trim(),
      },
      include: {
        User_Message_senderIdToUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

