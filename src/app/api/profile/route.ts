import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        businessType: true,
        role: true,
        branchId: true,
        branch: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { name, phone, businessType, currentPassword, newPassword } = body as {
      name?: string;
      phone?: string | null;
      businessType?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    // Optional password change
    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return NextResponse.json({ error: "Provide both current and new password" }, { status: 400 });
    }

    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
      if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(businessType !== undefined ? { businessType } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        businessType: true,
        role: true,
        branchId: true,
        branch: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


