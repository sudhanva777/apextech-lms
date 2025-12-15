import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { validateUUIDParam, secureErrorResponse } from "@/lib/api-security";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WEBP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 2MB" },
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

    // Create uploads directory
    const uploadsDir = join(process.cwd(), "public", "uploads", "avatars");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${user.id}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadsDir, uniqueFileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update user image URL
    const imageUrl = `/uploads/avatars/${uniqueFileName}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json(
      { success: true, imageUrl },
      { status: 200 }
    );
  } catch (error) {
    return secureErrorResponse(error, "Failed to upload avatar");
  }
}
