import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { secureErrorResponse, parseAndValidateBody } from "@/lib/api-security";
import { validateUUIDParam } from "@/lib/api-security";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).trim(),
  description: z.string().min(1, "Description is required").max(5000).trim(),
  week: z.number().int().min(1).max(16).nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export async function PUT(
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
    const validation = await parseAndValidateBody(req, updateTaskSchema);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: validation.status }
      );
    }

    const { title, description, week, dueDate } = validation.data;

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

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        week: week ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        updatedAt: new Date(),
      },
    });

    console.log(`[Task Update] Task ${taskId} updated successfully by admin`);

    return NextResponse.json(
      {
        success: true,
        message: "Task updated successfully",
        task: updatedTask,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Task Update] Error:", error);
    return secureErrorResponse(error, "Failed to update task");
  }
}

export async function DELETE(
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
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // Delete the task (cascade delete will handle StudentTask and TaskSubmission)
    await prisma.task.delete({
      where: { id: taskId },
    });

    console.log(`[Task Delete] Task ${taskId} deleted successfully by admin`);

    return NextResponse.json(
      { success: true, message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Task Delete] Error:", error);
    return secureErrorResponse(error, "Failed to delete task");
  }
}

