import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema, normalizeEmail, hashPassword, comparePassword } from "@/lib/security";

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate input with Zod
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = validationResult.data;
    const normalizedEmail = normalizeEmail(email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        resetTokenHash: true,
        resetTokenExpiresAt: true,
        passwordHash: true,
      },
    });

    // Uniform error message
    if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > user.resetTokenExpiresAt) {
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          resetTokenAttempts: 0,
        },
      });
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP one more time with timing-safe comparison
    const isValid = await comparePassword(otp, user.resetTokenHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    // Prevent password reuse (optional but recommended)
    if (user.passwordHash) {
      const isSamePassword = await comparePassword(newPassword, user.passwordHash);
      if (isSamePassword) {
        return NextResponse.json(
          { error: "New password must be different from your current password" },
          { status: 400 }
        );
      }
    }

    // Hash new password with secure cost factor
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset fields (invalidate OTP after use)
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        resetTokenAttempts: 0,
      },
    });

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    // Log error securely
    console.error("Reset password error");
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
