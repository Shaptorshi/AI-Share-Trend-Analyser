import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

// GET /api/watchlist — get user's watchlist
export async function GET(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await prisma.watchList.findMany({
        where: { userId: token.id as string },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(items)
}

// POST /api/watchlist — add stock to watchlist
export async function POST(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { symbol, name, sector } = body

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // Check if already exists (unique constraint: userId + symbol)
    const existing = await prisma.watchList.findUnique({
        where: { userId_symbol: { userId: token.id as string, symbol } },
    })

    if (existing) {
        return NextResponse.json({ error: "Already in watchlist" }, { status: 409 })
    }

    const item = await prisma.watchList.create({
        data: {
            userId: token.id as string,
            symbol,
            name: name || symbol,
            sector: sector || "General",
        },
    })

    return NextResponse.json(item, { status: 201 })
}

// DELETE /api/watchlist — remove stock from watchlist
export async function DELETE(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    try {
        await prisma.watchList.delete({
            where: { userId_symbol: { userId: token.id as string, symbol } },
        })
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
}
