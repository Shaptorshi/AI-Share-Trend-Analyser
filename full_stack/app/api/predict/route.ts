import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


interface PredictionResponse{
    symbol:string,
    current_price:number,
    indicators:{
        rsi:number,
        macd: number
        macdSignal: number

        ema_50: number
        ema_200: number

        bb_Upper: number
        bb_Mid: number
        bb_Lower: number

        stoch_K: number
        stoch_D: number

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
        trend: string
        signalStrength: number
        summary: string
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json()

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/predict`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
    const data:PredictionResponse = await res.json()
    const { symbol, current_price, indicators: ind, prediction: p } = data

    for (const horizon of ['7d', '14d', '1m', '3m'] as const) {
        const horizonMap = {
            '7d': { price: p.predicted_price_7d, low: p.range_low_7d, high: p.range_high_7d },
            '14d': { price: p.predicted_price_14d, low: p.range_low_7d * 0.97, high: p.range_high_7d * 1.04 },
            '1m': { price: p.predicted_price_1m, low: p.range_low_7d * 0.93, high: p.range_high_7d * 1.1 },
            '3m': { price: p.predicted_price_3m, low: p.range_low_7d * 0.85, high: p.range_high_7d * 1.25 },
        }

        await prisma.sharePrediction.create({
            data: {
                symbol, currentPrice: current_price, predictedPrice: horizonMap[horizon].price, rangeLow: horizonMap[horizon].low, rangeHigh: horizonMap[horizon].high, confidence: p.confidence, horizon, trend: p.trend, signalStrength: p.signalStrength, summary: p.summary, rsi: ind.rsi, macd: ind.macd, macdSignal: ind.macdSignal, ema50: ind.ema_50, ema200: ind.ema_200, bbUpper: ind.bb_Upper, bbMid: ind.bb_Mid, bbLower: ind.bb_Lower, stochK: ind.stoch_K, stochD: ind.stoch_D, atr: ind.atr, volumeRatio: ind.volume_ratio
            }
        })
    }

    return NextResponse.json(data)
}