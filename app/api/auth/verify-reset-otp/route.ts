import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { otpVerifyRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { verifyOTPSchema, normalizeEmail, comparePassword } from "@/lib/security";

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req);
    const rateLimitResult = await otpVerifyRateLimit.limit(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          },
        }
      );
    }

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
    const validationResult = verifyOTPSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    const { email, otp } = validationResult.data;
    const normalizedEmail = normalizeEmail(email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        resetTokenHash: true,
        resetTokenExpiresAt: true,
        resetTokenAttempts: true,
      },
    });

    // Uniform error message (don't reveal if user exists)
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

    // Check attempts (max 3)
    if (user.resetTokenAttempts >= 3) {
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          resetTokenAttempts: 0,
        },
      });
      return NextResponse.json(
        { error: "Too many attempts. Please request a new reset code." },
        { status: 400 }
      );
    }

    // Verify OTP with timing-safe comparison
    const isValid = await comparePassword(otp, user.resetTokenHash);

    if (!isValid) {
      // Increment attempts
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          resetTokenAttempts: user.resetTokenAttempts + 1,
        },
      });

      const remainingAttempts = 3 - (user.resetTokenAttempts + 1);
      return NextResponse.json(
        { 
          error: `Invalid code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.` : 'No attempts remaining. Please request a new code.'}` 
        },
        { status: 400 }
      );
    }

    // OTP is valid - return success (don't clear yet, wait for password reset)
    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    // Log error securely
    console.error("Verify OTP error");
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
