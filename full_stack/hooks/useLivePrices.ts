"use client"

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react"

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  "ws://127.0.0.1:8000/ws/prices"

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

export function useLivePrices(symbols: string[]) {
  const [prices, setPrices] = useState<PriceMap>({})
  const [connected, setConnected] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef =
    useRef<NodeJS.Timeout | null>(null)

  const reconnectAttemptsRef = useRef(0)
  const mountedRef = useRef(true)

  const maxReconnectAttempts = 5

  // Stable symbols
  const stableSymbols = useMemo(
    () => symbols,
    [symbols.join(",")]
  )

  const symbolsRef = useRef<string[]>(stableSymbols)

  useEffect(() => {
    symbolsRef.current = stableSymbols
  }, [stableSymbols])

  const connect = useCallback(() => {
    // Prevent duplicate sockets
    if (
      wsRef.current &&
      (
        wsRef.current.readyState ===
          WebSocket.OPEN ||
        wsRef.current.readyState ===
          WebSocket.CONNECTING
      )
    ) {
      return
    }

    if (
      reconnectAttemptsRef.current >=
      maxReconnectAttempts
    ) {
      console.warn(
        "Max WS reconnect attempts reached"
      )
      return
    }

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("WS connected")

        setConnected(true)

        reconnectAttemptsRef.current = 0

        // Subscribe
        if (
          ws.readyState === WebSocket.OPEN &&
          symbolsRef.current.length > 0
        ) {
          ws.send(
            JSON.stringify({
              action: "subscribe",
              symbols: symbolsRef.current,
            })
          )
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (
            data.type ===
            "price_update"
          ) {
            setPrices((prev) => ({
              ...prev,
              [data.symbol]: {
                symbol: data.symbol,
                price: data.price,
                change: data.change,
                changePercent:
                  data.changePercent,
                volume: data.volume,
                marketHours:
                  data.marketHours,
                timestamp:
                  data.timestamp,
              },
            }))
          }
        } catch (err) {
          console.error(
            "WS parse error",
            err
          )
        }
      }

      // Do NOT force close here
      // ws.onerror = (err) => {
      //   console.error(
      //     "WebSocket error",
      //     err
      //   )
      // }

      ws.onclose = (event) => {
        console.log(
          "WS closed",
          {
            code: event.code,
            reason:
              event.reason ||
              "No reason",
            clean:
              event.wasClean,
          }
        )

        setConnected(false)
        wsRef.current = null

        if (!mountedRef.current)
          return

        reconnectAttemptsRef.current += 1

        if (
          reconnectAttemptsRef.current <
          maxReconnectAttempts
        ) {
          const delay =
            Math.min(
              3000 *
                reconnectAttemptsRef
                  .current,
              15000
            )

          console.log(
            `Reconnecting in ${delay}ms`
          )

          reconnectTimeoutRef.current =
            setTimeout(() => {
              connect()
            }, delay)
        }
      }
    } catch (err) {
      console.error(
        "WS constructor error",
        err
      )
      setConnected(false)
    }
  }, [])

  // Initial connect
  useEffect(() => {
    mountedRef.current = true

    connect()

    return () => {
      mountedRef.current = false

      if (
        reconnectTimeoutRef.current
      ) {
        clearTimeout(
          reconnectTimeoutRef.current
        )
      }

      if (wsRef.current) {
        wsRef.current.close(
          1000,
          "Component unmounted"
        )
        wsRef.current = null
      }
    }
  }, [connect])

  // Re-subscribe on symbol change
  useEffect(() => {
    const ws = wsRef.current

    if (
      ws &&
      ws.readyState ===
        WebSocket.OPEN &&
      stableSymbols.length > 0
    ) {
      ws.send(
        JSON.stringify({
          action: "subscribe",
          symbols: stableSymbols,
        })
      )
    }
  }, [stableSymbols])

  return {
    prices,
    connected,
  }
}