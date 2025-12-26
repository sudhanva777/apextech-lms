import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { secureErrorResponse, parseAndValidateBody } from "@/lib/api-security";
import { validateUUIDParam } from "@/lib/api-security";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const reviewSubmissionSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "PENDING"]),
  feedback: z.string().max(2000).trim().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { submissionId } = params;

    // Validate submissionId format
    if (!validateUUIDParam(submissionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid submission ID format" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const validation = await parseAndValidateBody(req, reviewSubmissionSchema);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: validation.status }
      );
    }

    const { status, feedback } = validation.data;

    // Check if submission exists
    const existingSubmission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, status: true },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    // Require feedback for rejection
    if (status === "REJECTED" && (!feedback || !feedback.trim())) {
      return NextResponse.json(
        { success: false, message: "Feedback is required when rejecting a submission" },
        { status: 400 }
      );
    }

    // Update the submission
    const updatedSubmission = await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        feedback: feedback?.trim() || null,
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    console.log(`[Submission Review] Submission ${submissionId} ${status.toLowerCase()} by admin`);

    return NextResponse.json(
      {
        success: true,
        message: `Submission ${status.toLowerCase()} successfully`,
        submission: updatedSubmission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Submission Review] Error:", error);
    return secureErrorResponse(error, "Failed to review submission");
  }
}

