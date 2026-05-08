"use client"

import { useState, useEffect, useCallback } from "react"

export interface WatchlistItem {
    id: string
    userId: string
    symbol: string
    name: string
    sector: string
    createdAt: string
}

/**
 * Hook to manage the user's watchlist.
 * Provides CRUD operations and the current list.
 * 
 * Usage:
 *   const { items, loading, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
 */
export function useWatchlist() {
    const [items, setItems] = useState<WatchlistItem[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch watchlist on mount
    const fetchWatchlist = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/watchlist")
            if (res.ok) {
                const data = await res.json()
                setItems(data)
            }
        } catch (err) {
            console.error("Failed to fetch watchlist:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchWatchlist()
    }, [fetchWatchlist])

    // Add a stock to watchlist
    const addToWatchlist = useCallback(async (symbol: string, name?: string, sector?: string): Promise<boolean> => {
        try {
            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symbol, name, sector }),
            })

            if (res.ok) {
                const newItem = await res.json()
                setItems((prev) => [newItem, ...prev])
                return true
            }
            
            if (res.status === 409) {
                // Already exists
                return false
            }

            return false
        } catch (err) {
            console.error("Failed to add to watchlist:", err)
            return false
        }
    }, [])

    // Remove a stock from watchlist
    const removeFromWatchlist = useCallback(async (symbol: string): Promise<boolean> => {
        try {
            const res = await fetch(`/api/watchlist?symbol=${encodeURIComponent(symbol)}`, {
                method: "DELETE",
            })

            if (res.ok) {
                setItems((prev) => prev.filter((item) => item.symbol !== symbol))
                return true
            }

            return false
        } catch (err) {
            console.error("Failed to remove from watchlist:", err)
            return false
        }
    }, [])

    // Check if a symbol is in the watchlist
    const isInWatchlist = useCallback((symbol: string): boolean => {
        return items.some((item) => item.symbol === symbol)
    }, [items])

    return {
        items,
        loading,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        refetch: fetchWatchlist,
    }
}
