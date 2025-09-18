import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: true,
      },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error("Branches list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, address, price } = body as { name?: string; address?: string; price?: string | number };

    if (!name || !address || price === undefined || price === null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.branch.create({
      data: {
        name,
        address,
        price: price as Prisma.Decimal | number | string,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "branch_create",
        details: {
          branchId: created.id,
          name: created.name,
          address: created.address,
          price: created.price,
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Branch create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


