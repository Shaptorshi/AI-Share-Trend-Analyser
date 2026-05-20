import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/watchlist — get user's watchlist
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await prisma.watchList.findMany({
        where: { userId: session.user.id as string },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(items)
}

// POST /api/watchlist — add stock to watchlist
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { symbol, name, sector } = body

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // Check if already exists (unique constraint: userId + symbol)
    const existing = await prisma.watchList.findUnique({
        where: { userId_symbol: { userId: session.user.id as string, symbol } },
    })

    if (existing) {
        return NextResponse.json({ error: "Already in watchlist" }, { status: 409 })
    }

    const item = await prisma.watchList.create({
        data: {
            userId: session.user.id as string,
            symbol,
            name: name || symbol,
            sector: sector || "General",
        },
    })

    return NextResponse.json(item, { status: 201 })
}

// DELETE /api/watchlist — remove stock from watchlist
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    try {
        await prisma.watchList.delete({
            where: { userId_symbol: { userId: session.user.id as string, symbol } },
        })
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
}
