import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PointsTransactionStatus, PointsTransactionType } from "@prisma/client";
import { randomUUID } from "crypto"; // for folio generation

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { points, description } = await req.json();

    const parsedPoints = Number(points);
    if (!parsedPoints || isNaN(parsedPoints) || parsedPoints <= 0) {
      return NextResponse.json({ error: "Invalid points amount" }, { status: 400 });
    }

    // Fetch user and confirmed point transactions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        pointsTransactions: {
          where: { status: PointsTransactionStatus.confirmed },
        },
      },
    });

    if (!user || !user.branchId) {
      return NextResponse.json({ error: "User or branch not found" }, { status: 404 });
    }

    const earnedPoints = user.pointsTransactions
      .filter((p) => p.type === PointsTransactionType.earn)
      .reduce((sum, p) => sum + p.points, 0);

    const redeemedPoints = user.pointsTransactions
      .filter((p) => p.type === PointsTransactionType.redeem)
      .reduce((sum, p) => sum + p.points, 0);

    const currentBalance = earnedPoints - redeemedPoints;

    if (parsedPoints > currentBalance) {
      return NextResponse.json({ error: "Insufficient points balance" }, { status: 400 });
    }

    // Calculate monetary value (1 point = branch.price)
    const branch = await prisma.branch.findUnique({
      where: { id: user.branchId },
    });
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const amount = parsedPoints * Number(branch.price);

    // Create new redemption transaction
    const transaction = await prisma.pointsTransaction.create({
      data: {
        userId: user.id,
        branchId: user.branchId,
        type: PointsTransactionType.redeem,
        points: parsedPoints,
        amount,
        status: PointsTransactionStatus.pending,
        description: description?.trim() || "Points redemption request",
        folio: `R-${Date.now()}-${randomUUID().slice(0, 6)}`, // ✅ generate folio
        receiptUrl: null, // optional, can be updated later
      },
    });

    return NextResponse.json({
      transactionId: transaction.id,
      folio: transaction.folio,
      points: transaction.points,
      amount: transaction.amount,
      message: "Redemption generated successfully",
    });
  } catch (error) {
    console.error("Redemption error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
