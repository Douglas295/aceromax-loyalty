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

    // Fetch pending transactions (i.e., purchases needing review)
    const pendingPurchases = await prisma.pointsTransaction.findMany({
      where: {
        status: PointsTransactionStatus.pending,
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
