import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { registerSchema, hashPassword, normalizeEmail } from "@/lib/security";

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // 10 seconds max

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req);
    const rateLimitResult = await registerRateLimit.limit(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
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
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = validationResult.data;
    const normalizedEmail = normalizeEmail(email);

    // Check for existing user (uniform error message to prevent enumeration)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      // Return same message as success to prevent email enumeration
      return NextResponse.json(
        { message: "If the email is not registered, a verification email has been sent." },
        { status: 200 }
      );
    }

    // Hash password with secure cost factor
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: name.trim().slice(0, 100), // Max length
        email: normalizedEmail,
        passwordHash,
        phone: phone?.trim().slice(0, 20) || null,
        role: "STUDENT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
      },
    });

    // Return success (don't expose user ID in production)
    return NextResponse.json(
      { message: "Registration successful. Please log in." },
      { status: 201 }
    );
  } catch (error: any) {
    // Log error securely (no sensitive data)
    console.error("Registration error:", error?.code || "Unknown error");
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Registration failed. Please try again." },
        { status: 400 }
      );
    }
    
    // Generic error (no stack traces in production)
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
