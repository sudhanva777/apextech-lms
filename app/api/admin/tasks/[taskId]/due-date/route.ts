import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { secureErrorResponse, parseAndValidateBody } from "@/lib/api-security";
import { validateUUIDParam } from "@/lib/api-security";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const updateDueDateSchema = z.object({
  dueDate: z.string().min(1, "Due date is required"),
});

export async function PATCH(
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

    // Parse and validate request body
    const validation = await parseAndValidateBody(req, updateDueDateSchema);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: validation.status }
      );
    }

    const { dueDate } = validation.data;
    const dueDateObj = new Date(dueDate);

    // Validate that date is not in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (dueDateObj < now) {
      return NextResponse.json(
        { success: false, message: "Due date cannot be in the past" },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // Update only the due date
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        dueDate: dueDateObj,
        updatedAt: new Date(),
      },
    });

    console.log(`[Task Due Date Update] Task ${taskId} due date updated to ${dueDate} by admin`);

    return NextResponse.json(
      {
        success: true,
        message: "Due date updated successfully",
        task: updatedTask,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Task Due Date Update] Error:", error);
    return secureErrorResponse(error, "Failed to update due date");
  }
}

