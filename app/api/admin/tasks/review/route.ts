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

    const { submissionId, action, feedback, studentTaskId, taskId } = await req.json();

    if (!submissionId || !action || !studentTaskId || !taskId) {
      return NextResponse.json(
        { error: "Submission ID, action, student task ID, and task ID are required" },
        { status: 400 }
      );
    }

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json(
        { error: "Action must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    if (action === "reject" && !feedback) {
      return NextResponse.json(
        { error: "Feedback is required when rejecting a task" },
        { status: 400 }
      );
    }

    // Get the submission
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status !== "PENDING") {
      return NextResponse.json(
        { error: "This submission has already been reviewed" },
        { status: 400 }
      );
    }

    // Update submission
    const newStatus = action === "accept" ? "ACCEPTED" : "REJECTED";
    await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status: newStatus,
        feedback: feedback || null,
        updatedAt: new Date(),
      },
    });

    // Update student task status
    if (action === "accept") {
      await prisma.studentTask.update({
        where: { id: studentTaskId },
        data: {
          status: "COMPLETED",
          submittedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Task ${action === "accept" ? "accepted" : "rejected"} successfully`,
    });
  } catch (error) {
    console.error("Task review error:", error);
    return NextResponse.json({ error: "Failed to review task" }, { status: 500 });
  }
}

