import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering to avoid build-time database connection
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const chats = await prisma.chat.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(chats);
    } catch (error) {
        console.error("GET /api/chats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
