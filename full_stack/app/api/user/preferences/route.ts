import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { defaultHorizon: true, riskTolerance: true, favoriteSector: true }
        });
        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { defaultHorizon, riskTolerance, favoriteSector } = body;

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { defaultHorizon, riskTolerance, favoriteSector },
        });

        return NextResponse.json({ message: "Preferences updated successfully", preferences: { defaultHorizon: updatedUser.defaultHorizon, riskTolerance: updatedUser.riskTolerance, favoriteSector: updatedUser.favoriteSector } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
