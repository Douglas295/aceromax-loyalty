import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperadmin();
    if ("error" in auth) return auth.error;

    const { id } = await context.params;
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(branch);
  } catch (error) {
    console.error("Branch get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperadmin();
    if ("error" in auth) return auth.error;

    const { id } = await context.params;
    const body = await req.json();
    const { name, address, price } = body as { name?: string; address?: string; price?: string | number };

    const existing = await prisma.branch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: {
      name?: string;
      address?: string;
      price?: Prisma.Decimal | number | string;
    } = {};
    if (name !== undefined) data.name = name;
    if (address !== undefined) data.address = address;
    if (price !== undefined) data.price = price as Prisma.Decimal | number | string;

    const updated = await prisma.branch.update({
      where: { id },
      data,
    });

    await prisma.adminLog.create({
      data: {
        adminId: auth.session.user.id,
        action: "branch_update",
        details: {
          before: existing,
          after: updated,
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Branch update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperadmin();
    if ("error" in auth) return auth.error;

    const { id } = await context.params;

    const existing = await prisma.branch.findUnique({
      where: { id },
      include: { users: true, pointsTransactions: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Prevent deletion if related entities exist
    if (existing.users.length > 0 || existing.pointsTransactions.length > 0) {
      return NextResponse.json({
        error: "Cannot delete branch with related users or transactions",
      }, { status: 400 });
    }

    await prisma.branch.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        adminId: auth.session.user.id,
        action: "branch_delete",
        details: { branchId: id },
      },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Branch delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


