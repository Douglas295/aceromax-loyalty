import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PointsTransactionStatus, PointsTransactionType } from "@prisma/client";

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

    // Get dashboard statistics
    const [
      totalUsers,
      activeUsers,
      totalPurchases,
      pendingPurchases,
      totalPointsEarned,
      totalPointsRedeemed,
      totalRedemptionsAmount
    ] = await Promise.all([
      // Total users (filtered by branch for admin)
      prisma.user.count({
        where: {
          role: 'customer',
          ...branchFilter,
        },
      }),

      // Users with activity in last 30 days (filtered by branch for admin)
      prisma.user.count({
        where: {
          role: 'customer',
          ...branchFilter,
          pointsTransactions: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
              },
            },
          },
        },
      }),

      // Total confirmed "earn" transactions (filtered by branch for admin)
      prisma.pointsTransaction.count({
        where: {
          type: PointsTransactionType.earn,
          status: PointsTransactionStatus.confirmed,
          ...branchFilter,
        },
      }),

      // Pending transactions (filtered by branch for admin)
      prisma.pointsTransaction.count({
        where: {
          status: PointsTransactionStatus.pending,
          ...branchFilter,
        },
      }),

      // Total points earned (filtered by branch for admin)
      prisma.pointsTransaction.aggregate({
        where: {
          type: PointsTransactionType.earn,
          status: PointsTransactionStatus.confirmed,
          ...branchFilter,
        },
        _sum: {
          points: true,
        },
      }),

      // Total points redeemed (filtered by branch for admin)
      prisma.pointsTransaction.aggregate({
        where: {
          type: PointsTransactionType.redeem,
          status: PointsTransactionStatus.confirmed,
          ...branchFilter,
        },
        _sum: {
          points: true,
        },
      }),

      // Total redemption amount (filtered by branch for admin)
      prisma.pointsTransaction.aggregate({
        where: {
          type: PointsTransactionType.redeem,
          status: PointsTransactionStatus.confirmed,
          ...branchFilter,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    
    const totalPointsEarnedValue = totalPointsEarned._sum.points || 0;
    const totalPointsRedeemedValue = totalPointsRedeemed._sum.points || 0;
    const totalRedemptions = Number(totalRedemptionsAmount._sum.amount || 0);

    // Get branch price for liability calculation
    let price = 0.5; // Default price
    if (adminUser.role === "admin") {
      const branch = await prisma.branch.findUnique({
        where: { id: adminUser.branchId },
        select: { price: true },
      });
      if (branch) {
        price = Number(branch.price);
      }
    } else {
      // For superadmin, use average price or default
      const avgPrice = await prisma.branch.aggregate({
        _avg: { price: true },
      });
      price = Number(avgPrice._avg.price || 0.5);
    }

    const currentLiabilities = (totalPointsEarnedValue - totalPointsRedeemedValue) * price || 0

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalPurchases,
      pendingPurchases,
      totalPointsEarned: totalPointsEarnedValue,
      totalPointsRedeemed: totalPointsRedeemedValue,
      currentLiabilities,
      totalRedemptions,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
