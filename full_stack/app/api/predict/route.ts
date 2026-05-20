import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { API_BASE_URL } from '@/lib/api'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface PredictionResponse{
    symbol:string,
    current_price:number,
    indicators:{
        rsi:number,
        macd: number
        macd_signal: number

        ema_50: number
        ema_200: number

        bb_upper: number
        bb_mid: number
        bb_lower: number

        stoch_k: number
        stoch_d: number

        atr: number
        volume_ratio: number
    }

    prediction:{
        predicted_price_7d: number
        predicted_price_14d: number
        predicted_price_1m: number
        predicted_price_3m: number

        range_low_7d: number
        range_high_7d: number

        confidence: number
        trend: "Bullish" | "Bearish" | "Neutral"
        signal_strength: string
        summary: string
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const res = await fetch(`${API_BASE_URL}/predict/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        return NextResponse.json({ error: "Backend error" }, { status: res.status })
    }

    const data:PredictionResponse = await res.json()
    const { symbol, current_price, indicators: ind, prediction: p } = data

    try {
        for (const horizon of ['7d', '14d', '1m', '3m'] as const) {
            const horizonMap = {
                '7d': { price: p.predicted_price_7d, low: p.range_low_7d, high: p.range_high_7d },
                '14d': { price: p.predicted_price_14d, low: p.range_low_7d * 0.97, high: p.range_high_7d * 1.04 },
                '1m': { price: p.predicted_price_1m, low: p.range_low_7d * 0.93, high: p.range_high_7d * 1.1 },
                '3m': { price: p.predicted_price_3m, low: p.range_low_7d * 0.85, high: p.range_high_7d * 1.25 },
            }

            await prisma.sharePrediction.create({
                data: {
                    symbol, currentPrice: current_price, predictedPrice: horizonMap[horizon].price, rangeLow: horizonMap[horizon].low, rangeHigh: horizonMap[horizon].high, confidence: p.confidence, horizon, trend: p.trend, signalStrength: p.signal_strength, summary: p.summary, rsi: ind.rsi, macd: ind.macd, macdSignal: ind.macd_signal, ema50: ind.ema_50, ema200: ind.ema_200, bbUpper: ind.bb_upper, bbMid: ind.bb_mid, bbLower: ind.bb_lower, stochK: ind.stoch_k, stochD: ind.stoch_d, atr: ind.atr, volumeRatio: ind.volume_ratio,
                    userId: session.user.id as string
                }
            })
        }
    } catch (dbError: any) {
        console.error("Database Error:", dbError);
        return NextResponse.json({ error: "Database Error", details: dbError.message }, { status: 500 })
    }

    return NextResponse.json(data)
}