"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws/prices"

export interface LivePriceData {
  symbol: string
  price: number | null
  change: number | null
  changePercent: number | null
  volume: number | null
  marketHours: string | null
  timestamp: number | null
}

type PriceMap = Record<string, LivePriceData>

/**
 * React hook for real-time stock price streaming via WebSocket.
 * 
 * Usage:
 *   const { prices, connected } = useLivePrices(["RELIANCE.NS", "TCS.NS"])
 *   // prices["RELIANCE.NS"]?.price → latest price
 */
export function useLivePrices(symbols: string[]) {
  const [prices, setPrices] = useState<PriceMap>({})
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // Stabilize symbols array — only re-create when the actual values change
  const stableSymbols = useMemo(() => symbols, [symbols.join(",")])

  // Keep a ref for the latest symbols (used inside callbacks)
  const symbolsRef = useRef<string[]>(stableSymbols)
  useEffect(() => {
    symbolsRef.current = stableSymbols
  }, [stableSymbols])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) return

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        reconnectAttemptsRef.current = 0  // reset on successful connection
        // Subscribe to symbols
        if (symbolsRef.current.length > 0) {
          ws.send(JSON.stringify({
            action: "subscribe",
            symbols: symbolsRef.current
          }))
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === "price_update") {
            setPrices((prev) => ({
              ...prev,
              [data.symbol]: {
                symbol: data.symbol,
                price: data.price,
                change: data.change,
                changePercent: data.changePercent,
                volume: data.volume,
                marketHours: data.marketHours,
                timestamp: data.timestamp,
              },
            }))
          }
        } catch {
          // ignore parse errors
        }
      }

      ws.onclose = () => {
        setConnected(false)
        wsRef.current = null
        // Auto-reconnect with backoff, up to max attempts
        reconnectAttemptsRef.current += 1
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(3000 * reconnectAttemptsRef.current, 15000)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      ws.onerror = () => {
        ws.close()
      }
    } catch {
      // WebSocket constructor can throw if URL is invalid
      setConnected(false)
    }
  }, [])

  // Connect on mount
  useEffect(() => {
    connect()

    return () => {
      reconnectAttemptsRef.current = maxReconnectAttempts // prevent reconnect on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  // Re-subscribe when symbols change (using stable reference)
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && stableSymbols.length > 0) {
      wsRef.current.send(JSON.stringify({
        action: "subscribe",
        symbols: stableSymbols
      }))
    }
  }, [stableSymbols])

  return { prices, connected }
}
