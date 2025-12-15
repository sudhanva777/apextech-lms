import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/security";

// Track failed login attempts
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface LoginAttempt {
  email: string;
  attempts: number;
  lockedUntil: number | null;
}

// In-memory store for login attempts (in production, use Redis)
const loginAttempts = new Map<string, LoginAttempt>();

// Check if account is locked
export async function isAccountLocked(email: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  const attempt = loginAttempts.get(normalizedEmail);

  if (!attempt || !attempt.lockedUntil) {
    return false;
  }

  if (Date.now() > attempt.lockedUntil) {
    // Lockout expired, clear attempts
    loginAttempts.delete(normalizedEmail);
    return false;
  }

  return true;
}

// Record failed login attempt
export async function recordFailedAttempt(email: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  const attempt = loginAttempts.get(normalizedEmail) || {
    email: normalizedEmail,
    attempts: 0,
    lockedUntil: null,
  };

  attempt.attempts += 1;

  if (attempt.attempts >= MAX_FAILED_ATTEMPTS) {
    attempt.lockedUntil = Date.now() + LOCKOUT_DURATION;
  }

  loginAttempts.set(normalizedEmail, attempt);
}

// Clear login attempts (on successful login)
export async function clearLoginAttempts(email: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  loginAttempts.delete(normalizedEmail);
}

// Get remaining attempts
export async function getRemainingAttempts(email: string): Promise<number> {
  const normalizedEmail = normalizeEmail(email);
  const attempt = loginAttempts.get(normalizedEmail);

  if (!attempt) {
    return MAX_FAILED_ATTEMPTS;
  }

  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
    return 0;
  }

  return Math.max(0, MAX_FAILED_ATTEMPTS - attempt.attempts);
}

