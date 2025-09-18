import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and superadmin can create customers
    if (session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, phone, businessType } = body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      businessType?: string;
    };

    if (!name || !email || !password || !businessType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // Determine branch ID
    let branchId: string;
    if (session.user.role === "superadmin") {
      // Superadmin can specify branch, but for now we'll use the first branch
      // In a real app, you might want to add branch selection
      const firstBranch = await prisma.branch.findFirst();
      if (!firstBranch) {
        return NextResponse.json({ error: "No branches available" }, { status: 400 });
      }
      branchId = firstBranch.id;
    } else {
      // Admin can only create customers for their own branch
      branchId = session.user.branchId!;
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create customer
    const customer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        businessType,
        role: "customer",
        branchId,
      },
      include: {
        branch: true,
      },
    });

    // Log the action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "customer_create",
        details: {
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          branchId: customer.branchId,
          branchName: customer.branch.name,
        },
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
