import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Check if user is authenticated
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  if (!user) {
    redirect("/auth/login");
  }
  
  return user;
}

// Check if user has specific role
export async function requireRole(role: "ADMIN" | "STUDENT") {
  const user = await requireAuth();
  
  if (user.role !== role) {
    redirect(role === "ADMIN" ? "/student" : "/admin");
  }
  
  return user;
}

// Verify resource ownership (prevent IDOR)
export async function verifyResourceOwnership(
  resourceUserId: string,
  currentUserId: string,
  userRole: string
): Promise<boolean> {
  // Admins can access any resource
  if (userRole === "ADMIN") {
    return true;
  }
  
  // Students can only access their own resources
  return resourceUserId === currentUserId;
}

// Get current user ID from session
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user ? (session.user as any).id : null;
}

// Validate UUID format (prevent injection)
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Verify student can access their own data
export async function verifyStudentAccess(studentId: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  if (!user) {
    return false;
  }
  
  // Admins can access any student
  if (user.role === "ADMIN") {
    return true;
  }
  
  // Students can only access their own data
  if (user.role === "STUDENT") {
    const userId = (user as any).id;
    return userId === studentId;
  }
  
  return false;
}

