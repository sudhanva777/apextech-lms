import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If userId is provided, verify access
    if (userId) {
      // Students can only view their own attendance
      if (currentUser.role === "STUDENT" && currentUser.id !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Determine which user's attendance to fetch
    const targetUserId = userId || currentUser.id;

    // If admin and no userId specified, return all students' attendance
    if (currentUser.role === "ADMIN" && !userId) {
      const allAttendance = await prisma.attendance.findMany({
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ success: true, attendance: allAttendance });
    }

    // Get attendance for specific user
    const attendance = await prisma.attendance.findMany({
      where: { userId: targetUserId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

