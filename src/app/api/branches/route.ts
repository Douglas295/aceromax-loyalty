import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Public: list branches for signup selection
export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      select: { id: true, name: true, address: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(branches);
  } catch (error) {
    console.error("Public branches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


