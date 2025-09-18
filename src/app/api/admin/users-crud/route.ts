import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

async function requireSuperadmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "superadmin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session } as const;
}

// GET - List all users with their branch information
export async function GET() {
  try {
    const auth = await requireSuperadmin();
    if ("error" in auth) return auth.error;

    const users = await prisma.user.findMany({
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Users list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new user
export async function POST(req: Request) {
  try {
    const auth = await requireSuperadmin();
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const { name, email, password, phone, businessType, branchId, role } = body;

    // Validate required fields
    if (!name || !email || !password || !businessType || !branchId || !role) {
      return NextResponse.json({ 
        error: "Missing required fields: name, email, password, businessType, branchId, role" 
      }, { status: 400 });
    }

    // Validate role
    if (!["customer", "admin", "superadmin"].includes(role)) {
      return NextResponse.json({ 
        error: "Invalid role. Must be customer, admin, or superadmin" 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: "User already exists with this email" 
      }, { status: 400 });
    }

    // Validate branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch) {
      return NextResponse.json({ 
        error: "Branch not found" 
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        businessType,
        branchId,
        role: role as "customer" | "admin" | "superadmin"
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: auth.session.user.id,
        action: "user_create",
        details: {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: user.branchId
        }
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("User create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
