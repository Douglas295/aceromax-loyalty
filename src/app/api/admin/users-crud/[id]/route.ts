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

// GET - Get a specific user
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperadmin();
    if ("error" in auth) return auth.error;

    const { id } = await context.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update a user
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperadmin();
    if ("error" in auth) return auth.error;

    const { id } = await context.params;
    const body = await req.json();
    const { name, email, password, phone, businessType, branchId, role } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate role if provided
    if (role && !["customer", "admin", "superadmin"].includes(role)) {
      return NextResponse.json({ 
        error: "Invalid role. Must be customer, admin, or superadmin" 
      }, { status: 400 });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json({ 
          error: "Email already taken by another user" 
        }, { status: 400 });
      }
    }

    // Validate branch if provided
    if (branchId && branchId !== existingUser.branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId }
      });

      if (!branch) {
        return NextResponse.json({ 
          error: "Branch not found" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (businessType !== undefined) updateData.businessType = businessType;
    if (branchId !== undefined) updateData.branchId = branchId;
    if (role !== undefined) updateData.role = role;

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
        action: "user_update",
        details: {
          userId: id,
          before: {
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            branchId: existingUser.branchId
          },
          after: {
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            branchId: updatedUser.branchId
          }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a user
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperadmin();
    if ("error" in auth) return auth.error;

    const { id } = await context.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        pointsTransactions: true,
        adminLogs: true
      }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deletion if user has transactions or admin logs
    if (existingUser.pointsTransactions.length > 0) {
      return NextResponse.json({
        error: "Cannot delete user with existing points transactions"
      }, { status: 400 });
    }

    if (existingUser.adminLogs.length > 0) {
      return NextResponse.json({
        error: "Cannot delete user with existing admin logs"
      }, { status: 400 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: auth.session.user.id,
        action: "user_delete",
        details: {
          deletedUserId: id,
          deletedUserName: existingUser.name,
          deletedUserEmail: existingUser.email
        }
      }
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
