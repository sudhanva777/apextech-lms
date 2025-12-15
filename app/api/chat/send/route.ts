import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { z } from "zod";
import { parseAndValidateBody, secureErrorResponse, validateUUIDParam } from "@/lib/api-security";
import { verifyResourceOwnership } from "@/lib/access-control";

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

const sendMessageSchema = z.object({
  senderId: z.string().uuid("Invalid sender ID format"),
  receiverId: z.string().uuid("Invalid receiver ID format"),
  content: z.string().min(1, "Message cannot be empty").max(5000, "Message too long").trim(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req);
    const rateLimitResult = await chatRateLimit.limit(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many messages. Please slow down." },
        { 
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          },
        }
      );
    }

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate body
    const validation = await parseAndValidateBody(req, sendMessageSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }

    const { senderId, receiverId, content } = validation.data;

    // Validate UUIDs
    if (!validateUUIDParam(senderId) || !validateUUIDParam(receiverId)) {
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

    // Verify sender is the current user (prevent IDOR)
    if (!verifyResourceOwnership(senderId, currentUser.id, currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get receiver
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, role: true },
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

    // Sanitize content (basic XSS prevention)
    const sanitizedContent = content
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .slice(0, 5000); // Max length

    // Create message
    const message = await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        senderId,
        receiverId,
        content: sanitizedContent,
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
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    return secureErrorResponse(error, "Failed to send message");
  }
}
