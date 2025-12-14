import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: "STUDENT" | "ADMIN";
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role?: "STUDENT" | "ADMIN"; // Optional - will be set in JWT callback
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "ADMIN";
  }
}

