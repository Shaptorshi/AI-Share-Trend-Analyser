export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000/api";

export interface StockInfo {
    symbol: string;
    name: string | null;
    price: number | null;
    market_cap: number | null;
    pe_ratio: number | null;
    high: number | null;
    low: number | null;
    previous_close: number | null;
    error?: string;
}

export interface StockHistoryData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export const fetchStockInfo = async (symbol: string): Promise<StockInfo> => {
    try {
        const res = await fetch(`${API_BASE_URL}/stock/${symbol}`);
        if (!res.ok) throw new Error("Failed to fetch stock info");
        return res.json();
    } catch (error) {
        console.error(error);
        return { symbol, error: "Network Error", name: null, price: null, market_cap: null, pe_ratio: null, high: null, low: null, previous_close: null };
    }
};

export const fetchBatchStocks = async (symbols: string[]): Promise<StockInfo[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/stocks/batch?symbols=${symbols.join(",")}`);
        if (!res.ok) throw new Error("Failed to fetch batch stock info");
        return res.json();
    } catch (error) {
        console.error(error);
        return symbols.map(symbol => ({ symbol, error: "Network Error", name: null, price: null, market_cap: null, pe_ratio: null, high: null, low: null, previous_close: null }));
    }
};

export const fetchStockHistory = async (symbol: string): Promise<StockHistoryData[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/history`);
        if (!res.ok) throw new Error("Failed to fetch stock history");
        return res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};
