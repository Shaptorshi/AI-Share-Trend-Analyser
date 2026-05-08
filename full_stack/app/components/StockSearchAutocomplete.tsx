"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Loader2, TrendingUp, Building2 } from "lucide-react"
import { fetchStockSearch, SearchResult } from "@/lib/api"

interface StockSearchAutocompleteProps {
  onSelect?: (result: SearchResult) => void
  placeholder?: string
  className?: string
}

export default function StockSearchAutocomplete({
  onSelect,
  placeholder = "Search stocks...",
  className = "",
}: StockSearchAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    setActiveIndex(-1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 1) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const data = await fetchStockSearch(value)
      setResults(data)
      setOpen(data.length > 0)
      setLoading(false)
    }, 300)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < results.length) {
          handleSelect(results[activeIndex])
        }
        break
      case "Escape":
        setOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (result: SearchResult) => {
    setQuery(result.symbol)
    setOpen(false)
    onSelect?.(result)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-10 rounded-xl bg-muted/40 border border-muted/60 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-3 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-xl border border-muted/60 bg-card/95 backdrop-blur-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          {results.map((result, idx) => (
            <button
              key={`${result.symbol}-${idx}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-muted/20 last:border-0 ${
                idx === activeIndex
                  ? "bg-primary/8 text-foreground"
                  : "hover:bg-muted/30 text-foreground"
              }`}
            >
              {/* Icon */}
              <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                result.type === "equity" || result.type === "Equity"
                  ? "bg-blue-500/10 text-blue-600"
                  : result.type === "ETF" || result.type === "etf"
                    ? "bg-purple-500/10 text-purple-600"
                    : "bg-muted/50 text-muted-foreground"
              }`}>
                {result.type === "equity" || result.type === "Equity" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold">{result.symbol}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-medium uppercase">
                    {result.exchange}
                  </span>
                  {result.type && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium capitalize">
                      {result.type}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {result.name}
                  {result.sector && ` · ${result.sector}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
