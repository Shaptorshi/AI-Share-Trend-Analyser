export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000/api";

export interface StockInfo {
    prices_30d: number[];
    volumes_30d: number[];
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

const createEmptyStockInfo=(symbol:string,error="Network Error"):StockInfo=>({
    symbol,error,name:null,price:null,market_cap:null,pe_ratio:null,high:null,low:null,previous_close:null,prices_30d:[],volumes_30d:[]
})
export const fetchStockInfo = async (symbol: string): Promise<StockInfo> => {
    try {
        const res = await fetch(`${API_BASE_URL}/stock/${symbol}`);
        if (!res.ok) throw new Error("Failed to fetch stock info");
        return res.json();
    } catch (error) {
        console.error(error);
        return createEmptyStockInfo(symbol)
    }
};

export const fetchBatchStocks = async (symbols: string[]): Promise<StockInfo[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/stocks/batch?symbols=${symbols?.join(",")}`);
        if (!res.ok) throw new Error("Failed to fetch batch stock info");
        return res.json();
    } catch (error) {
        console.error(error);
        return symbols.map(symbol=>
            createEmptyStockInfo(symbol)
        )
    }
};

export const fetchStockHistory = async (symbol: string): Promise<StockHistoryData[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/history`);
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to fetch stock history: ${res.status} ${errorText}`);
        }
        return res.json();
    } catch (error) {
        console.error(`Error fetching history for ${symbol}:`, error);
        return [];
    }
};

export interface SearchResult {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
    sector: string;
    industry: string;
}

export const fetchStockSearch = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.trim().length < 1) return [];
    try {
        const res = await fetch(`${API_BASE_URL}/stocks/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Failed to search stocks");
        return res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};
