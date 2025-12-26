import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { secureErrorResponse } from "@/lib/api-security";
import { validateUUIDParam } from "@/lib/api-security";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { taskId } = params;

    // Validate taskId format
    if (!validateUUIDParam(taskId)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID format" },
        { status: 400 }
      );
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // Fetch all submissions for this task
    const submissions = await prisma.taskSubmission.findMany({
      where: { taskId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        task: {
          id: task.id,
          title: task.title,
        },
        submissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Get Submissions] Error:", error);
    return secureErrorResponse(error, "Failed to fetch submissions");
  }
}

