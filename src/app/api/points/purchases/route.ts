import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PointsTransactionStatus, PointsTransactionType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { branchId: true },
    });

    if (!user?.branchId) {
      return NextResponse.json({ error: "User does not belong to a branch" }, { status: 403 });
    }

    const body = await req.json();
    const { folio, amount, receiptUrl, description } = body;

    if (!folio || !amount || !receiptUrl || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const existingTransaction = await prisma.pointsTransaction.findFirst({
      where: {
        userId: session.user.id,
        folio,
      },
    });

    if (existingTransaction) {
      return NextResponse.json({ error: "Receipt with this folio already submitted" }, { status: 400 });
    }

    const cleanDescription = typeof description === "string" ? description.trim() : "";
    const points = Math.floor(numericAmount / 100); // e.g., 1 point per 100 MXN

    const transaction = await prisma.pointsTransaction.create({
      data: {
        userId: session.user.id,
        branchId: user.branchId,
        folio,
        receiptUrl,
        description: cleanDescription,
        type: PointsTransactionType.earn,
        points,
        amount: numericAmount,
        status: PointsTransactionStatus.pending,
      },
    });

    return NextResponse.json({
      transactionId: transaction.id,
      points,
      message: "Receipt submitted successfully. Points will be credited after admin approval.",
    });
  } catch (error) {
    console.error("Points transaction submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
