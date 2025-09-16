import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's points history
    const pointsHistory = await prisma.pointsTransaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
        points: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true,
        folio: true,
        receiptUrl: true,
      },
    });

    const formatted = pointsHistory.map((tx) => ({
      id: tx.id,
      type: tx.type,
      points: tx.points,
      amount: Number(tx.amount),
      status: tx.status,
      description: tx.description,
      createdAt: tx.createdAt,
      folio: tx.folio || undefined,
      receiptUrl: tx.receiptUrl || undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Points history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
