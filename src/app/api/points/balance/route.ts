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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        pointsTransactions: {
          where: {
            status: PointsTransactionStatus.confirmed
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const earnedPoints = user.pointsTransactions
      .filter(p => p.type === PointsTransactionType.earn)
      .reduce((sum, p) => sum + p.points, 0);
    
    const redeemedPoints = user.pointsTransactions
      .filter(p => p.type === PointsTransactionType.redeem)
      .reduce((sum, p) => sum + p.points, 0);

    const currentBalance = earnedPoints - redeemedPoints;

    return NextResponse.json({
      balance: currentBalance,
      earnedPoints,
      redeemedPoints,
      pointsValue: currentBalance * 0.5
    });
  } catch (error) {
    console.error("Balance calculation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
