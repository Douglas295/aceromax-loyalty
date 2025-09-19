import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Get users with their transaction summary (filtered by branch for admin)
    const users = await prisma.user.findMany({
      where: {
        role: "customer",
        ...branchFilter,
      },
      include: {
        branch: {
          select: {
            name: true,
            address: true
          }
        },
        pointsTransactions: {
          select: {
            id: true,
            type: true,
            points: true,
            amount: true,
            status: true,
            createdAt: true,
            folio: true,
            description: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate summary statistics for each user
    const usersWithStats = users.map(user => {
      const transactions = user.pointsTransactions;
      
      const totalEarned = transactions
        .filter(t => t.type === 'earn' && t.status === 'confirmed')
        .reduce((sum, t) => sum + t.points, 0);
      
      const totalRedeemed = transactions
        .filter(t => t.type === 'redeem' && t.status === 'confirmed')
        .reduce((sum, t) => sum + t.points, 0);
      
      const currentBalance = totalEarned - totalRedeemed;
      
      const totalSpent = transactions
        .filter(t => t.type === 'earn' && t.status === 'confirmed')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
      
      const lastActivity = transactions.length > 0 ? transactions[0].createdAt : user.createdAt;
      
      const transactionCount = transactions.length;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessType: user.businessType,
        branch: user.branch,
        createdAt: user.createdAt,
        stats: {
          currentBalance,
          totalEarned,
          totalRedeemed,
          totalSpent,
          transactionCount,
          pendingTransactions,
          lastActivity
        },
        recentTransactions: transactions.slice(0, 5) // Last 5 transactions
      };
    });

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
