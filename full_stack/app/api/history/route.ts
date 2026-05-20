import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const predictions = await prisma.sharePrediction.findMany({
            where: {
                horizon: '7d', // Only fetch one horizon to avoid duplicates per analysis run
                userId: session.user.id as string
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(predictions);
    } catch (error) {
        console.error("Error fetching history:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
