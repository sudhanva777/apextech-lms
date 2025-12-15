import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateUUIDParam, secureErrorResponse } from "@/lib/api-security";
import { verifyResourceOwnership } from "@/lib/access-control";

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const otherUserId = searchParams.get("otherUserId");

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { error: "User ID and other user ID are required" },
        { status: 400 }
      );
    }

    // Validate UUIDs (prevent injection)
    if (!validateUUIDParam(userId) || !validateUUIDParam(otherUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
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

    // Verify user is part of the conversation (prevent IDOR)
    // User must be either sender or receiver
    const isAuthorized = 
      verifyResourceOwnership(userId, currentUser.id, currentUser.role) ||
      verifyResourceOwnership(otherUserId, currentUser.id, currentUser.role) ||
      currentUser.id === userId ||
      currentUser.id === otherUserId;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get messages between the two users (limit to prevent abuse)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: userId,
          },
        ],
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        createdAt: true,
        User_Message_senderIdToUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100, // Limit to prevent abuse
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return secureErrorResponse(error, "Failed to fetch messages");
  }
}
