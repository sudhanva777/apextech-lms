import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
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

    // Check if user already has a submission
    const existingSubmission = await prisma.projectSubmission.findFirst({
      where: { userId },
    });

    if (existingSubmission && existingSubmission.status !== "NOT_SUBMITTED") {
      return NextResponse.json(
        { error: "You have already submitted a project" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubRepo = formData.get("githubRepo") as string | null;
    const file = formData.get("file") as File | null;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "application/zip", "application/x-zip-compressed"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and ZIP files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Save file to public/uploads directory
    const uploadsDir = join(process.cwd(), "public", "uploads", "projects");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${userId}-${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/projects/${fileName}`;

    // Create or update submission
    if (existingSubmission) {
      await prisma.projectSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          title,
          description,
          githubRepo: githubRepo || null,
          fileUrl,
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
          title,
          description,
          githubRepo: githubRepo || null,
          fileUrl,
          status: "SUBMITTED",
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, message: "Project submitted successfully" });
  } catch (error) {
    console.error("Project submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit project" },
      { status: 500 }
    );
  }
}

