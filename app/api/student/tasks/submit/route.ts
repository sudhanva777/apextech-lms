import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { validateUUIDParam, secureErrorResponse } from "@/lib/api-security";
import { apiRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req);
    const rateLimitResult = await apiRateLimit.limit(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          },
        }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    const formData = await req.formData();
    const taskId = formData.get("taskId") as string;
    const studentTaskId = formData.get("studentTaskId") as string;

    // Validate UUIDs
    if (!validateUUIDParam(taskId) || !validateUUIDParam(studentTaskId)) {
      return NextResponse.json(
        { error: "Invalid task ID format" },
        { status: 400 }
      );
    }
    const answerText = formData.get("answerText") as string;
    const file = formData.get("file") as File | null;
    const submissionId = formData.get("submissionId") as string | null;

    if (!taskId || !studentTaskId) {
      return NextResponse.json(
        { error: "Task ID and Student Task ID are required" },
        { status: 400 }
      );
    }

    if (!answerText && !file) {
      return NextResponse.json(
        { error: "Please provide either a text answer or upload a file" },
        { status: 400 }
      );
    }

    // Verify the task is assigned to this student
    const studentTask = await prisma.studentTask.findUnique({
      where: { id: studentTaskId },
      include: { User: true, Task: true },
    });

    if (!studentTask || studentTask.userId !== userId) {
      return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    }

    // Check if submission already exists and is not rejected
    if (submissionId) {
      const existingSubmission = await prisma.taskSubmission.findUnique({
        where: { id: submissionId },
      });
      if (existingSubmission && existingSubmission.status !== "REJECTED") {
        return NextResponse.json(
          { error: "This task has already been submitted" },
          { status: 400 }
        );
      }
    } else {
      // Check if there's already a non-rejected submission
      const existingSubmission = await prisma.taskSubmission.findUnique({
        where: {
          studentId_taskId: {
            studentId: userId,
            taskId: taskId,
          },
        },
      });
      if (existingSubmission && existingSubmission.status !== "REJECTED") {
        return NextResponse.json(
          { error: "This task has already been submitted" },
          { status: 400 }
        );
      }
    }

    let fileUrl: string | null = null;

    // Handle file upload
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/zip",
        "application/x-zip-compressed",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Only PDF, ZIP, JPG, and PNG files are allowed" },
          { status: 400 }
        );
      }

      // Validate file size (10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File size must be less than 10MB" },
          { status: 400 }
        );
      }

      // Validate file name (prevent path traversal)
      const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      if (!fileName || fileName.length > 255) {
        return NextResponse.json(
          { error: "Invalid file name" },
          { status: 400 }
        );
      }

      // Save file to public/uploads/tasks directory
      const uploadsDir = join(process.cwd(), "public", "uploads", "tasks");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeFileName = `${userId}-${taskId}-${Date.now()}-${fileName}`;
      const filePath = join(uploadsDir, safeFileName);

      await writeFile(filePath, buffer);

      fileUrl = `/uploads/tasks/${safeFileName}`;
    }

    // Create or update submission
    if (submissionId) {
      // Update existing rejected submission
      await prisma.taskSubmission.update({
        where: { id: submissionId },
        data: {
          answerText: answerText || null,
          fileUrl: fileUrl || undefined,
          status: "PENDING",
          feedback: null, // Clear previous feedback
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new submission
      await prisma.taskSubmission.create({
        data: {
          id: crypto.randomUUID(),
          studentId: userId,
          taskId: taskId,
          answerText: answerText || null,
          fileUrl: fileUrl,
          status: "PENDING",
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, message: "Task submitted successfully" });
  } catch (error) {
    return secureErrorResponse(error, "Failed to submit task");
  }
}

