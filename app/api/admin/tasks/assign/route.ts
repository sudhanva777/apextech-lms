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

    const { taskId, userId } = await req.json();

    if (!taskId || !userId) {
      return NextResponse.json(
        { error: "Task ID and User ID are required" },
        { status: 400 }
      );
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if task is already assigned to this user
    const existingAssignment = await prisma.studentTask.findUnique({
      where: {
        userId_taskId: {
          userId,
          taskId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Task is already assigned to this student" },
        { status: 400 }
      );
    }

    // Create assignment
    const studentTask = await prisma.studentTask.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        taskId,
        status: "PENDING",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, studentTask }, { status: 201 });
  } catch (error) {
    console.error("Task assignment error:", error);
    return NextResponse.json({ error: "Failed to assign task" }, { status: 500 });
  }
}

