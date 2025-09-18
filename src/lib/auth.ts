import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";

type CustomUser = {
  id: string;
  email: string;
  role: "customer" | "admin" | "superadmin";
  branchId?: string;
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "name" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: { email: string; password: string } | undefined) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Missing username or password");
        }

        const { email, password } = credentials;
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            branch: true
          }
        });

        if (!user) {
          throw new Error("User does not exist");
        }

        if (!(await compare(password, user.password))) {
          throw new Error("Invalid password");
        }

        // Return user info including role and branch
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add id, role, and branchId to token when user logs in
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.role = customUser.role;
        token.branchId = customUser.branchId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "customer" | "admin" | "superadmin";
      }
      return session;
    },
  },
} satisfies NextAuthOptions;
