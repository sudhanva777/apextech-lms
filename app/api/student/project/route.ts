import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Check if user already has a submission
    const existingSubmission = await prisma.projectSubmission.findFirst({
      where: { userId },
    });

    if (existingSubmission && existingSubmission.status !== "NOT_SUBMITTED") {
      return NextResponse.json(
        { success: false, message: "You have already submitted a project" },
        { status: 400 }
      );
    }

    // Parse FormData
    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const githubRepo = formData.get("githubRepo") as string | null;
    const github = formData.get("github") as string | null; // Support both "github" and "githubRepo"
    const file = formData.get("file") as File | null;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, message: "Description is required" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only PDF and ZIP files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Log file metadata (for debugging/monitoring)
    console.log("[Project Submission] File received:", {
      userId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      title: title.trim(),
      hasGithub: !!(githubRepo || github),
    });

    // Use githubRepo or github (whichever is provided)
    const finalGithubRepo = githubRepo || github || null;

    // Create or update submission (without fileUrl since we're not storing the file)
    if (existingSubmission) {
      await prisma.projectSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          title: title.trim(),
          description: description.trim(),
          githubRepo: finalGithubRepo?.trim() || null,
          status: "SUBMITTED",
          submittedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.projectSubmission.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          title: title.trim(),
          description: description.trim(),
          githubRepo: finalGithubRepo?.trim() || null,
          status: "SUBMITTED",
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Project submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Project Submission] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit project" },
      { status: 500 }
    );
  }
}

