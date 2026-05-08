import yfinance as yf
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=10)

def fetch_single_stock(symbol: str):
    try:
        stock = yf.Ticker(symbol)
        
        # Try to get fast_info first (usually very fast)
        fast_data = {}
        try:
            fast = stock.fast_info
            fast_data = {
                "price": fast.get("lastPrice"),
                "market_cap": fast.get("marketCap"),
                "high": fast.get("yearHigh"),
                "low": fast.get("yearLow"),
                "previous_close": fast.get("previousClose"),
            }
        except Exception:
            pass
            
        # Try to get slow info for name/PE (with fallback)
        info_data = {}
        try:
            info = stock.info
            info_data = {
                "name": info.get("longName") or info.get("shortName"),
                "pe_ratio": info.get("trailingPE"),
            }
        except Exception:
            pass

        return {
            "symbol": symbol.upper(),
            "name": info_data.get("name") or symbol.upper(),
            "price": fast_data.get("price"),
            "market_cap": fast_data.get("market_cap"),
            "pe_ratio": info_data.get("pe_ratio"),
            "high": fast_data.get("high"),
            "low": fast_data.get("low"),
            "previous_close": fast_data.get("previous_close"),
        }
    except Exception as e:
        return {
            "symbol": symbol.upper(),
            "error": str(e),
            "name": None,
            "price": None,
            "market_cap": None,
            "pe_ratio": None,
            "high": None,
            "low": None,
            "previous_close": None
        }

def get_stock_info(symbol:str):
    return fetch_single_stock(symbol)

def get_batch_stock_info(symbols: list[str]):
    # Use ThreadPoolExecutor to fetch multiple stocks in parallel
    try:
        with ThreadPoolExecutor(max_workers=min(len(symbols), 15)) as pool:
            results = list(pool.map(fetch_single_stock, symbols))
        return results
    except Exception as e:
        print(f"Batch fetch error: {e}")
        # Return a list of error objects so frontend doesn't crash on .map()
        return [{"symbol": s.upper(), "error": str(e)} for s in symbols]

def get_stock_history(symbol:str,period="1mo",interval="1d"):
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period=period,interval=interval)
        
        data = []
        for index,row in hist.iterrows():
            data.append({
                "date":str(index),
                "open":row["Open"],
                "high":row["High"],
                "low":row["Low"],
                "close":row["Close"],
                "volume":row["Volume"],
            })
        
        return data
    except Exception:
        return []

def search_stocks(query: str, max_results: int = 8):
    try:
        search = yf.Search(query, news_count=0)
        results = []
        for quote in search.quotes[:max_results]:
            results.append({
                "symbol": quote.get("symbol", ""),
                "name": quote.get("longname") or quote.get("shortname", ""),
                "exchange": quote.get("exchDisp", ""),
                "type": quote.get("typeDisp", ""),
                "sector": quote.get("sectorDisp", ""),
                "industry": quote.get("industryDisp", ""),
            })
        return results
    except Exception as e:
        return []