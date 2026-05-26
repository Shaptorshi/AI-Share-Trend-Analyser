import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email } = body;

        if (email !== session.user.email) {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                return NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { name, email },
        });

        return NextResponse.json({ message: "Profile updated successfully", user: { name: updatedUser.name, email: updatedUser.email } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
