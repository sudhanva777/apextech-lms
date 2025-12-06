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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { userId, date, status } = await req.json();

    if (!userId || !date || !status) {
      return NextResponse.json(
        { error: "User ID, date, and status are required" },
        { status: 400 }
      );
    }

    if (status !== "PRESENT" && status !== "ABSENT") {
      return NextResponse.json(
        { error: "Status must be PRESENT or ABSENT" },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse date and set to start of day
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists for this date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: attendanceDate,
      },
    });

    if (existingAttendance) {
      // Update existing attendance
      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { status },
      });
      return NextResponse.json({ success: true, attendance: updated });
    } else {
      // Create new attendance
      const attendance = await prisma.attendance.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          date: attendanceDate,
          status,
        },
      });
      return NextResponse.json({ success: true, attendance }, { status: 201 });
    }
  } catch (error) {
    console.error("Mark attendance error:", error);
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}

