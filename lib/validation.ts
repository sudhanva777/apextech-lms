import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .toLowerCase()
  .trim()
  .max(255, "Email too long");

// Strong password validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Registration schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .trim(),
  email: emailSchema,
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .nullable(),
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Verify OTP schema
export const verifyOTPSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  newPassword: passwordSchema,
});

// UUID validation
export const uuidSchema = z.string().uuid("Invalid ID format");

// Sanitize string input
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ""); // Remove potential XSS characters
}

// Validate and parse JSON safely
export async function safeJsonParse<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const text = await req.text();
    
    // Limit request body size (1MB max)
    if (text.length > 1024 * 1024) {
      return { success: false, error: "Request body too large" };
    }

    const json = JSON.parse(text);
    const result = schema.safeParse(json);

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || "Invalid input",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: "Invalid JSON" };
  }
}

