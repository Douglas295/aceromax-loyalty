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

    if (session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
      // Total users
      prisma.user.count({
        where: {
          role: 'customer',
        },
      }),

      // Users created in last 30 days
      prisma.user.count({
        where: {
          pointsTransactions: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
              },
            },
          },
        },
      }),

      // Total confirmed "earn" transactions (i.e., purchases)
      prisma.pointsTransaction.count({
        where: {
          type: PointsTransactionType.earn,
          status: PointsTransactionStatus.confirmed,
        },
      }),

      // Pending "earn" transactions (awaiting admin review)
      prisma.pointsTransaction.count({
        where: {
          status: PointsTransactionStatus.pending,
        },
      }),

      // Total points earned (sum of confirmed earn)
      prisma.pointsTransaction.aggregate({
        where: {
          type: PointsTransactionType.earn,
          status: PointsTransactionStatus.confirmed,
        },
        _sum: {
          points: true,
        },
      }),

      // Total points redeemed (sum of confirmed redeem)
      prisma.pointsTransaction.aggregate({
        where: {
          type: PointsTransactionType.redeem,
          status: PointsTransactionStatus.confirmed,
        },
        _sum: {
          points: true,
        },
      }),

      // Total redemption amount (value) in MXN
      prisma.pointsTransaction.aggregate({
        where: {
          type: PointsTransactionType.redeem,
          status: PointsTransactionStatus.confirmed,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    
    const totalPointsEarnedValue = totalPointsEarned._sum.points || 0;
    const totalPointsRedeemedValue = totalPointsRedeemed._sum.points || 0;
    // const currentLiabilities = (totalPointsEarnedValue - totalPointsRedeemedValue) * 0.5;
    const totalRedemptions = Number(totalRedemptionsAmount._sum.amount || 0);

    // Fetch the user's branchId
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        branchId: true, // Fetch the branchId for the user
      },
    });

    // Fetch branch prices
    const branchPrices = await prisma.branch.findMany({
      select: {
        id: true,
        price: true,
      },
    });

    // Now, use the branch price for calculating current liabilities
    let currentLiabilities = 0;
    if (user && branchPrices.length > 0) {
      // Find the branch using the user's branchId
      const userBranch = branchPrices.find(branch => branch.id === user.branchId);
      if (userBranch) {
        currentLiabilities = (totalPointsEarnedValue - totalPointsRedeemedValue) * Number(userBranch.price);
      }
    }


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
