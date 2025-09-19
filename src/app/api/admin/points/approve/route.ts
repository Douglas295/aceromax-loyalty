import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PointsTransactionStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { transactionId, action } = await req.json();

    if (!transactionId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get admin's branch information
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { branchId: true, role: true },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // Fetch the transaction with branch information
    const transaction = await prisma.pointsTransaction.findUnique({
      where: { id: transactionId },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // For admin users, ensure they can only approve transactions from their branch
    if (adminUser.role === "admin" && transaction.branchId !== adminUser.branchId) {
      return NextResponse.json({ 
        error: "You can only approve transactions from your branch" 
      }, { status: 403 });
    }

    if (transaction.status !== PointsTransactionStatus.pending) {
      return NextResponse.json({
        error: `Transaction already ${transaction.status}`,
      }, { status: 400 });
    }

    const newStatus =
      action === "approve"
        ? PointsTransactionStatus.confirmed
        : PointsTransactionStatus.rejected;

    // Update the transaction
    const updatedTransaction = await prisma.pointsTransaction.update({
      where: { id: transactionId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    // Check if admin exists in the admin table
    const adminExists = await prisma.user.findUnique({
      where: { id: session.user.id, role: { in: ['admin', 'superadmin'] } },
    });
    
    if (!adminExists) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }
    
    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: `transaction_${action}`,
        details: {
          transactionId: updatedTransaction.id,
          folio: updatedTransaction.folio,
          userId: updatedTransaction.userId,
          type: updatedTransaction.type,
          amount: updatedTransaction.amount,
          points: updatedTransaction.points,
          statusBefore: transaction.status,
          statusAfter: updatedTransaction.status,
        },
      },
    });

    return NextResponse.json({
      message: `Transaction ${action}d successfully`,
      transaction: updatedTransaction,
    });

  } catch (error) {
    console.error("Transaction approval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
