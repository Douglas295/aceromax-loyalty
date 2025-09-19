import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PointsTransactionStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get admin's branch information
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { branchId: true, role: true },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // For superadmin, show all data; for admin, filter by their branch
    const branchFilter = adminUser.role === "superadmin" ? {} : { branchId: adminUser.branchId };

    // Fetch pending transactions (filtered by branch for admin)
    const pendingPurchases = await prisma.pointsTransaction.findMany({
      where: {
        status: PointsTransactionStatus.pending,
        ...branchFilter,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        branch: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pendingPurchases);
  } catch (error) {
    console.error("Pending purchases error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
