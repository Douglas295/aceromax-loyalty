// /app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone, businessType } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default branch (change this logic as needed)
    const defaultBranch = await prisma.branch.findFirst();

    if (!defaultBranch) {
      return NextResponse.json(
        { error: "No branch found. Please contact support." },
        { status: 500 }
      );
    }

    // Create user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        businessType,
        branchId: defaultBranch.id,
        role: "customer", // optional, as it's default in schema
      },
    });

    return NextResponse.json({ message: "Account created." }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Registration error:", error.message);
    } else {
      console.error("Registration error:", error);
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
  );
  }
}
