import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// TypeScript type augmentation for next-auth session and JWT
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "customer" | "admin" | "superadmin";  // Add role here
    };
  }
}


declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "superadmin" | "admin" | "customer";
  }
}
