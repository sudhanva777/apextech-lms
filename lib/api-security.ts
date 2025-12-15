import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Request size limit (1MB)
const MAX_REQUEST_SIZE = 1024 * 1024;

// Validate request size
export async function validateRequestSize(req: NextRequest): Promise<boolean> {
  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > MAX_REQUEST_SIZE) {
      return false;
    }
  }
  return true;
}

// Parse and validate JSON body with size limit
export async function parseAndValidateBody<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string; status: number }> {
  // Check request size
  const isValidSize = await validateRequestSize(req);
  if (!isValidSize) {
    return {
      success: false,
      error: "Request body too large",
      status: 413,
    };
  }

  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || "Invalid input",
        status: 400,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: "Invalid JSON format",
      status: 400,
    };
  }
}

// Secure error response (no stack traces in production)
export function secureErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment) {
    console.error("Error:", error);
  } else {
    // Log error securely (no sensitive data)
    console.error("Error occurred");
  }

  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  );
}

// Validate UUID parameter
export function validateUUIDParam(param: string | undefined): boolean {
  if (!param) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(param);
}

